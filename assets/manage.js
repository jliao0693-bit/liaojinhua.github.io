/* ==========================================================================
   12 的个人空间 - 作品管理页（manage.html）
   --------------------------------------------------------------------------
   列表：出厂作品 + 本地改动（见 assets/works-store.js）
   操作：新增 / 编辑 / 隐藏（软删除）/ 恢复 / 批量上传 / 导出 / 恢复初始
   写权限只有本机浏览器（localStorage），所以这一页对访客没有意义，
   已经在 <head> 里挂了 noindex，也不进主导航。

   交互约定：
     · 「隐藏」= 列表不再显示，可恢复；「删除」只对新增作品出现，真删。
     · 表单同时服务新增与编辑（data-dialog="edit"），slug 留空自动生成。
     · 图片一律先压到 584×400 JPEG 再存，reason: 5MB 配额要装十几张封面。
   ========================================================================== */
(function (global) {
  'use strict';

  var store = global.WorksStore;
  if (!store) return;

  var listEl = document.querySelector('[data-list]');
  var statEl = document.querySelector('[data-stat]');
  var searchEl = document.querySelector('[data-act="search"]');
  var filterEl = document.querySelector('[data-act="filter"]');
  var toastEl = document.querySelector('[data-toast]');

  var editDialog = document.querySelector('[data-dialog="edit"]');
  var editForm = editDialog.querySelector('[data-form="edit"]');
  var editTitleEl = editDialog.querySelector('[data-edit-title]');
  var editSubEl = editDialog.querySelector('[data-edit-sub]');
  var editNoteEl = editDialog.querySelector('[data-edit-note]');
  var editErrorEl = editDialog.querySelector('[data-edit-error]');
  var coverPreview = editDialog.querySelector('[data-cover-preview]');
  var coverFile = editDialog.querySelector('[data-cover-file]');
  var coverHint = editDialog.querySelector('[data-cover-hint]');
  var saveBtn = editDialog.querySelector('[data-save]');

  var confirmDialog = document.querySelector('[data-dialog="confirm"]');
  var confirmForm = confirmDialog.querySelector('[data-form="confirm"]');

  var state = { status: 'all', q: '', editing: null };
  var draftCover = '';
  var confirmAction = null;

  var STATUS = {
    base: '出厂',
    edited: '已编辑',
    added: '新增',
    deleted: '已隐藏'
  };

  var toastTimer = 0;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-on');
    global.clearTimeout(toastTimer);
    toastTimer = global.setTimeout(function () { toastEl.classList.remove('is-on'); }, 2800);
  }

  function subLabel(item) {
    var tax = store.TAXONOMY[item.cat];
    return (tax && tax.subs[item.sub]) || item.sub || '未分类';
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  /* 类型下拉：选项与 works.html 的筛选胶囊同源，避免新增作品筛不到。 */
  function fillCatSelect(select) {
    select.textContent = '';
    store.CAT_ORDER.forEach(function (cat) {
      var option = el('option', '', store.TAXONOMY[cat].label);
      option.value = cat;
      select.appendChild(option);
    });
  }

  function fillSubSelect(select, cat, current) {
    select.textContent = '';
    var subs = (store.TAXONOMY[cat] || {}).subs || {};
    Object.keys(subs).forEach(function (key) {
      var option = el('option', '', subs[key]);
      option.value = key;
      select.appendChild(option);
    });
    if (current && subs[current]) select.value = current;
  }

  /* ------------------------------------------------------------------------
     列表
     ---------------------------------------------------------------------- */
  function rowOf(item) {
    var li = el('li', 'adm-row adm-row--' + item.state);
    li.setAttribute('data-slug', item.slug);

    if (item.cover) {
      var thumb = el('img', 'adm-row__thumb');
      thumb.src = item.cover;
      thumb.alt = '';
      thumb.loading = 'lazy';
      li.appendChild(thumb);
    } else {
      li.appendChild(el('span', 'adm-row__thumb adm-row__thumb--empty', '无封面'));
    }

    var main = el('div', 'adm-row__main');

    var titleRow = el('p', 'adm-row__title');
    titleRow.appendChild(el('span', 'adm-row__name', item.title));
    titleRow.appendChild(el('span', 'adm-badge adm-badge--' + item.state, STATUS[item.state] || item.state));
    main.appendChild(titleRow);

    main.appendChild(el('p', 'adm-row__meta', item.catLabel + ' · ' + subLabel(item)));

    var tags = el('ul', 'adm-row__tags');
    (item.tags || []).slice(0, 4).forEach(function (text) {
      tags.appendChild(el('li', 'tag', text));
    });
    if (tags.childNodes.length) main.appendChild(tags);

    var path = el('p', 'adm-row__slug');
    path.appendChild(el('code', '', item.slug));
    main.appendChild(path);

    li.appendChild(main);

    var acts = el('div', 'adm-row__acts');

    var preview = el('a', 'adm-btn', '预览');
    preview.href = item.href;
    preview.target = '_blank';
    preview.rel = 'noopener';
    acts.appendChild(preview);

    if (item.state === 'deleted') {
      var restoreBtn = el('button', 'adm-btn', '恢复');
      restoreBtn.type = 'button';
      restoreBtn.setAttribute('data-row-act', 'restore');
      acts.appendChild(restoreBtn);
    } else {
      var editBtn = el('button', 'adm-btn', '编辑');
      editBtn.type = 'button';
      editBtn.setAttribute('data-row-act', 'edit');
      acts.appendChild(editBtn);

      var delBtn = el('button', 'adm-btn adm-btn--danger', item.state === 'added' ? '删除' : '隐藏');
      delBtn.type = 'button';
      delBtn.setAttribute('data-row-act', 'delete');
      acts.appendChild(delBtn);
    }

    li.appendChild(acts);
    return li;
  }

  function render() {
    var all = store.all({ includeDeleted: true });
    var query = state.q.trim().toLowerCase();

    var visible = all.filter(function (item) {
      if (state.status !== 'all' && item.state !== state.status) return false;
      if (!query) return true;
      var hay = [item.title, item.slug, item.catLabel, subLabel(item), (item.tags || []).join(' ')]
        .join(' ').toLowerCase();
      return hay.indexOf(query) >= 0;
    });

    listEl.textContent = '';
    visible.forEach(function (item) { listEl.appendChild(rowOf(item)); });

    if (!visible.length) {
      listEl.appendChild(el('li', 'adm-empty', query || state.status !== 'all'
        ? '没有匹配的作品，换个关键词或状态试试。'
        : '还没有作品，点左上角「新增作品」上传第一个。'));
    }

    var stats = store.stats();
    statEl.textContent = '共 ' + stats.total + ' 个作品 · 出厂 ' + stats.base +
      ' · 已编辑 ' + stats.edited + ' · 新增 ' + stats.added + ' · 已隐藏 ' + stats.deleted;
  }

  /* ------------------------------------------------------------------------
     确认弹层（隐藏 / 删除 / 恢复初始共用）
     ---------------------------------------------------------------------- */
  function askConfirm(options) {
    confirmDialog.querySelector('[data-confirm-title]').textContent = options.title;
    confirmDialog.querySelector('[data-confirm-text]').textContent = options.text;

    var ok = confirmDialog.querySelector('[data-confirm-ok]');
    ok.textContent = options.okText || '确定';
    ok.classList.toggle('btn--danger', options.danger !== false);

    confirmAction = options.onOk || null;
    confirmDialog.returnValue = '';
    confirmDialog.showModal();
  }

  confirmForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var action = confirmAction;
    confirmAction = null;
    confirmDialog.close();
    if (action) action();
  });

  /* ------------------------------------------------------------------------
     编辑器（新增 / 编辑共用）
     ---------------------------------------------------------------------- */
  function paintCover() {
    coverPreview.textContent = '';
    if (draftCover) {
      var img = el('img', 'adm-cover__img');
      img.src = draftCover;
      img.alt = '';
      coverPreview.appendChild(img);
      return;
    }
    coverPreview.appendChild(el('span', 'adm-cover__empty', '暂无封面'));
  }

  function editError(message) {
    if (!message) {
      editErrorEl.hidden = true;
      editErrorEl.textContent = '';
      return;
    }
    editErrorEl.hidden = false;
    editErrorEl.textContent = message;
  }

  function openEditor(slug) {
    var item = slug ? store.get(slug) : null;
    var isNew = !slug;

    state.editing = slug || '';
    draftCover = item ? (item.cover || '') : '';
    editError('');

    editTitleEl.textContent = isNew ? '新增作品' : '编辑作品';
    editSubEl.textContent = isNew
      ? '先填标题就能存，封面与正文可以之后再补。'
      : (item && item.source === 'added'
        ? '本地新增的作品：改动立即生效，详情页 works/view.html?slug=' + item.slug + ' 同步更新。'
        : '出厂作品：卡片上的标题 / 类型 / 标签 / 封面会即时更新；静态详情页正文需要改 tools/works-data.json 后重跑构建。');

    editNoteEl.textContent = isNew
      ? '保存后出现在「作品列表」最前面，并可在卡片上继续编辑。'
      : 'slug = ' + (item ? item.slug : '') + '（决定详情页地址，编辑时不可改）';

    editForm.reset();
    fillCatSelect(editForm.elements.cat);

    var cat = item ? item.cat : 'app';
    editForm.elements.cat.value = cat;
    fillSubSelect(editForm.elements.sub, cat, item ? item.sub : '');

    if (item) {
      editForm.elements.title.value = item.title || '';
      editForm.elements.slug.value = item.slug || '';
      editForm.elements.tags.value = (item.tags || []).join(', ');
      editForm.elements.desc.value = item.desc || '';
      editForm.elements.lead.value = item.lead || '';
      editForm.elements.paragraphs.value = (item.paragraphs || []).join('\n');
      editForm.elements.coverAlt.value = item.coverAlt || '';
    }

    /* slug 是详情页地址，改了就对不上原有链接，所以只在新增时可填。 */
    editForm.elements.slug.readOnly = !isNew;

    paintCover();
    coverHint.textContent = '建议 1460×1000 以上，主体居中；会自动裁成 584×400。';

    if (!editDialog.open && editDialog.showModal) editDialog.showModal();
    editForm.elements.title.focus();
  }

  fillCatSelect(editForm.elements.cat);
  fillSubSelect(editForm.elements.sub, 'app', '');

  editForm.elements.cat.addEventListener('change', function () {
    fillSubSelect(editForm.elements.sub, editForm.elements.cat.value, '');
  });

  editForm.addEventListener('input', function () { editError(''); });

  coverFile.addEventListener('change', function () {
    var file = coverFile.files && coverFile.files[0];
    if (!file) return;

    saveBtn.disabled = true;
    coverHint.textContent = '正在压缩图片…';

    store.compress(file).then(function (result) {
      draftCover = result.dataURL;
      paintCover();
      coverHint.textContent = '已就绪：' + result.w + '×' + result.h + ' · 约 ' +
        Math.round(result.dataURL.length * 0.75 / 1024) + ' KB';
    }).catch(function (error) {
      editError(error.message || '图片读取失败。');
      coverHint.textContent = '换一张试试：支持 PNG / JPG / WebP。';
    }).then(function () {
      saveBtn.disabled = false;
      coverFile.value = '';
    });
  });

  editDialog.querySelector('[data-cover-clear]').addEventListener('click', function () {
    draftCover = '';
    paintCover();
    coverHint.textContent = '已移除封面，卡片会显示「待补封面」占位。';
  });

  editForm.addEventListener('submit', function (event) {
    event.preventDefault();

    var fields = editForm.elements;
    var title = fields.title.value.trim();
    if (!title) {
      editError('标题不能为空。');
      fields.title.focus();
      return;
    }

    var payload = {
      title: title,
      cat: fields.cat.value,
      sub: fields.sub.value,
      catLabel: store.catLabel(fields.cat.value),
      tags: fields.tags.value.split(/[,，、]/).map(function (s) { return s.trim(); }).filter(Boolean),
      desc: fields.desc.value.trim(),
      lead: fields.lead.value.trim(),
      paragraphs: fields.paragraphs.value.split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean),
      cover: draftCover,
      coverAlt: fields.coverAlt.value.trim()
    };

    try {
      if (state.editing) {
        store.update(state.editing, payload);
        toast('已保存「' + title + '」');
      } else {
        payload.slug = fields.slug.value.trim();
        var created = store.create(payload);
        toast('已新增「' + created.title + '」· 排在作品列表最前面');
      }
    } catch (error) {
      editError(error.message || '保存失败，请重试。');
      return;
    }

    editDialog.close();
    render();
  });

  /* ------------------------------------------------------------------------
     列表操作：编辑 / 隐藏 / 删除 / 恢复
     ---------------------------------------------------------------------- */
  listEl.addEventListener('click', function (event) {
    var button = event.target.closest ? event.target.closest('[data-row-act]') : null;
    if (!button) return;

    var row = button.closest('[data-slug]');
    var slug = row && row.getAttribute('data-slug');
    var item = slug && store.get(slug);
    if (!item) return;

    var act = button.getAttribute('data-row-act');

    if (act === 'edit') {
      openEditor(slug);
      return;
    }

    if (act === 'restore') {
      store.restore(slug);
      render();
      toast('已恢复「' + item.title + '」');
      return;
    }

    if (act === 'delete') {
      var isNew = item.state === 'added' || item.source === 'added';
      askConfirm({
        title: isNew ? '删除这个作品？' : '隐藏这个作品？',
        text: isNew
          ? '「' + item.title + '」是本机新增的作品，删除后封面与文字一起清掉，不能恢复。'
          : '「' + item.title + '」会从作品列表隐藏，随时能在「已隐藏」里恢复；出厂页面文件不会被动。',
        okText: isNew ? '删除' : '隐藏',
        onOk: function () {
          store.remove(slug);
          render();
          toast(isNew ? '已删除「' + item.title + '」' : '已隐藏「' + item.title + '」· 可在「已隐藏」里恢复');
        }
      });
    }
  });

  /* ------------------------------------------------------------------------
     工具条：搜索 / 状态筛选 / 新增 / 批量上传 / 导出 / 恢复初始
     ---------------------------------------------------------------------- */
  searchEl.addEventListener('input', function () {
    state.q = searchEl.value;
    render();
  });

  filterEl.addEventListener('change', function () {
    state.status = filterEl.value;
    render();
  });

  document.querySelector('[data-act="new"]').addEventListener('click', function () {
    openEditor('');
  });

  var bulkInput = document.querySelector('[data-act="bulk"]');
  bulkInput.addEventListener('change', function () {
    var files = [].slice.call(bulkInput.files || []);
    if (!files.length) return;

    var done = 0;
    var failed = 0;
    toast('正在处理 ' + files.length + ' 张图片…');

    files.reduce(function (chain, file) {
      return chain.then(function () {
        return store.compress(file).then(function (result) {
          var name = file.name.replace(/\.[a-z0-9]+$/i, '');
          store.create({
            title: name,
            cover: result.dataURL,
            coverAlt: name,
            tags: []
          });
          done += 1;
          render();
        }).catch(function () {
          failed += 1;
        });
      });
    }, Promise.resolve()).then(function () {
      bulkInput.value = '';
      render();
      toast('已新增 ' + done + ' 个作品' +
        (failed ? '，' + failed + ' 张处理失败' : '') + '；点「编辑」补标题和描述就能用了');
    });
  });

  function download(filename, blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    global.setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  }

  function base64ToBlob(dataURL, mime) {
    var binary = atob(dataURL.split(',')[1]);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime || 'image/jpeg' });
  }

  document.querySelector('[data-act="export"]').addEventListener('click', function () {
    var data = store.exportData();

    download('works-export.json', new Blob([JSON.stringify(data.json, null, 2)], {
      type: 'application/json'
    }));

    data.images.forEach(function (image, index) {
      global.setTimeout(function () {
        download(image.name, base64ToBlob(image.dataURL));
      }, 500 * (index + 1));
    });

    var extra = [];
    if (data.hidden.length) extra.push('隐藏清单 ' + data.hidden.length + ' 条');
    if (Object.keys(data.edited).length) extra.push('已编辑 ' + Object.keys(data.edited).length + ' 条');

    toast('已导出：JSON' +
      (data.images.length ? ' + ' + data.images.length + ' 张封面' : '') +
      (extra.length ? '（含' + extra.join('、') + '）' : ''));
  });

  document.querySelector('[data-act="reset"]').addEventListener('click', function () {
    askConfirm({
      title: '恢复初始状态？',
      text: '会清掉全部本地改动：新增的作品、改过的字段、隐藏的记录。回到 works-index.js 里的出厂状态，操作不可撤销。',
      okText: '恢复初始',
      onOk: function () {
        store.reset();
        render();
        toast('已恢复初始状态');
      }
    });
  });

  /* ------------------------------------------------------------------------
     弹层关闭 + 地址栏直达（works.html 卡片上的「编辑」会带 ?slug=&act=edit）
     ---------------------------------------------------------------------- */
  [editDialog, confirmDialog].forEach(function (dialog) {
    [].slice.call(dialog.querySelectorAll('[data-close]')).forEach(function (button) {
      button.addEventListener('click', function () { dialog.close(); });
    });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
  });

  render();

  var params = new URLSearchParams(global.location.search);
  var targetSlug = params.get('slug');
  var targetAct = params.get('act');

  if (targetAct === 'new') {
    openEditor('');
  } else if (targetSlug && targetAct === 'edit') {
    openEditor(targetSlug);
  } else if (targetSlug && targetAct === 'delete') {
    var target = store.get(targetSlug);
    if (target) {
      askConfirm({
        title: '隐藏这个作品？',
        text: '「' + target.title + '」会从作品列表隐藏，随时能在「已隐藏」里恢复。',
        okText: '隐藏',
        onOk: function () {
          store.remove(targetSlug);
          render();
          toast('已隐藏「' + target.title + '」');
        }
      });
    }
  }
}(window));
