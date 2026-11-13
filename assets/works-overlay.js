/* ==========================================================================
   12 的个人空间 - 列表页叠加层（管理模式 / 编辑 / 删除）
   --------------------------------------------------------------------------
   works.html 的 15 张卡片是静态 HTML，出厂状态不动。这个脚本在筛选脚本之前
   执行，把 localStorage 里的改动叠加到 DOM 上：
     · 被隐藏的作品  -> 直接把节点摘掉（筛选脚本重新收集卡片时就不会再算它）
     · 改过字段的作品 -> 原地改标题 / 分类 / 标签 / 封面
     · 新上传的作品   -> 生成同结构的卡片插到最前
   然后给每张卡片挂上「编辑 / 删除」按钮；按钮只在管理模式（body.is-editing）
   里显示，公众访问时看不到，卡片也不会被撑高。

   加载顺序要求：works-index.js -> works-store.js -> 本文件 -> works-filter.js
   ========================================================================== */
(function (global) {
  'use strict';

  var store = global.WorksStore;
  var grid = document.querySelector('[data-works-grid]');
  if (!store || !grid) return;

  var raw = store.raw();

  function slugOfCard(card) {
    var link = card.querySelector('a[href*="works/"]');
    if (!link) return '';
    var match = link.getAttribute('href').match(/works\/([^"?#]+?)(?:\.html)?(?:[?#]|$)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function tagList(card) {
    return card.querySelector('.work__tags');
  }

  function setTags(card, tags) {
    var list = tagList(card);
    if (!list) return;
    list.textContent = '';
    (tags || []).forEach(function (text) {
      var li = document.createElement('li');
      li.className = 'tag';
      li.textContent = text;
      list.appendChild(li);
    });
  }

  function patchCard(card, data) {
    var titleLink = card.querySelector('.work__title a');
    if (data.title && titleLink) titleLink.textContent = data.title;

    var cat = card.querySelector('.work__cat');
    if (data.catLabel && cat) cat.textContent = data.catLabel;

    var img = card.querySelector('.work__img');
    if (img) {
      if (typeof data.cover === 'string' && !data.cover) {
        /* 明确清空封面：藏掉原图，补一个占位块 */
        img.hidden = true;
        var coverLink = card.querySelector('.work__cover');
        if (coverLink && !coverLink.querySelector('.work__thumb-blank')) {
          var blank = document.createElement('span');
          blank.className = 'work__thumb-blank';
          blank.textContent = '待补封面';
          coverLink.appendChild(blank);
        }
      } else if (data.cover) {
        img.hidden = false;
        img.setAttribute('src', data.cover);
      }
      if (data.coverAlt) img.setAttribute('alt', data.coverAlt);
    }

    if (data.cat) card.setAttribute('data-cat', data.cat);
    if (data.sub) card.setAttribute('data-sub', data.sub);
    if (data.tags) setTags(card, data.tags);
  }

  /* 新增作品生成和静态卡片一模一样的结构，筛选脚本的 data-cat / data-sub 照样生效。 */
  function buildCard(item) {
    var card = document.createElement('article');
    card.className = 'work glass glass--soft glass--d60';
    card.setAttribute('data-cat', item.cat || 'app');
    card.setAttribute('data-sub', item.sub || '');
    card.setAttribute('data-slug', item.slug);

    var cover = document.createElement('a');
    cover.className = 'work__cover';
    cover.setAttribute('href', item.href);

    if (item.cover) {
      var img = document.createElement('img');
      img.className = 'work__img';
      img.setAttribute('src', item.cover);
      img.setAttribute('width', '292');
      img.setAttribute('height', '200');
      img.setAttribute('alt', item.coverAlt || item.title);
      cover.appendChild(img);
    } else {
      var blank = document.createElement('span');
      blank.className = 'work__thumb-blank';
      blank.textContent = '待补封面';
      cover.appendChild(blank);
    }

    var meta = document.createElement('div');
    meta.className = 'work__meta';

    var h3 = document.createElement('h3');
    h3.className = 'work__title';
    var link = document.createElement('a');
    link.setAttribute('href', item.href);
    link.textContent = item.title;
    h3.appendChild(link);

    var cat = document.createElement('p');
    cat.className = 'work__cat';
    cat.textContent = item.catLabel || '';

    var tags = document.createElement('ul');
    tags.className = 'work__tags';
    tags.setAttribute('aria-label', '项目标签');
    (item.tags || []).forEach(function (text) {
      var li = document.createElement('li');
      li.className = 'tag';
      li.textContent = text;
      tags.appendChild(li);
    });

    meta.appendChild(h3);
    meta.appendChild(cat);
    meta.appendChild(tags);

    card.appendChild(cover);
    card.appendChild(meta);
    return card;
  }

  function refreshCounts() {
    var total = grid.querySelectorAll('.work').length;
    var eyebrow = document.querySelector('.phead__eyebrow');
    if (eyebrow) eyebrow.textContent = 'Portfolio · ' + total + ' Projects';

    var foot = document.querySelector('.works-foot');
    if (foot) {
      foot.textContent = '';
      foot.appendChild(document.createTextNode('以上 ' + total + ' 个项目均可点击进入详情页 · 需要完整作品集请'));
      var link = document.createElement('a');
      link.setAttribute('href', 'about.html');
      link.textContent = '联系我';
      foot.appendChild(link);
    }
  }

  /* ------------------------------------------------------------------------
     管理模式：卡片右上角的「编辑 / 删除」
     ---------------------------------------------------------------------- */
  function attachAdmin(card) {
    var slug = card.getAttribute('data-slug') || slugOfCard(card);
    if (!slug) return;
    card.setAttribute('data-slug', slug);
    if (card.querySelector('.work__admin')) return;

    var box = document.createElement('div');
    box.className = 'work__admin';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', '作品管理操作');

    var edit = document.createElement('a');
    edit.className = 'work__adm';
    edit.setAttribute('href', 'manage.html?slug=' + encodeURIComponent(slug) + '&act=edit');
    edit.textContent = '编辑';

    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'work__adm work__adm--danger';
    del.setAttribute('data-remove', slug);
    del.textContent = '删除';

    box.appendChild(edit);
    box.appendChild(del);
    card.appendChild(box);
  }

  var toastTimer = 0;
  function toast(message) {
    var el = document.querySelector('.works-toast');
    if (!el) {
      el = document.createElement('p');
      el.className = 'works-toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-on');
    global.clearTimeout(toastTimer);
    toastTimer = global.setTimeout(function () { el.classList.remove('is-on'); }, 2600);
  }

  grid.addEventListener('click', function (event) {
    var button = event.target.closest ? event.target.closest('[data-remove]') : null;
    if (!button) return;
    event.preventDefault();

    var slug = button.getAttribute('data-remove');
    var item = store.get(slug);
    var name = item ? item.title : slug;
    if (!global.confirm('确定隐藏「' + name + '」？\n\n作品列表将不再显示它，随时可以在「作品管理」里恢复。')) return;

    store.remove(slug);
    var card = button.closest('.work');
    if (card && card.parentNode) card.parentNode.removeChild(card);
    refreshCounts();
    toast('已隐藏「' + name + '」· 可在作品管理里恢复');
    if (global.CustomEvent) global.dispatchEvent(new CustomEvent('works:changed'));
  });

  /* ------------------------------------------------------------------------
     管理模式开关（状态存在 localStorage，刷新后保持）
     ---------------------------------------------------------------------- */
  var toggle = document.querySelector('[data-editmode-toggle]');

  function applyMode(on) {
    document.body.classList.toggle('is-editing', on);
    if (!toggle) return;
    toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    toggle.textContent = on ? '退出管理' : '管理模式';
  }

  applyMode(store.isEditMode());

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = !document.body.classList.contains('is-editing');
      store.setEditMode(next);
      applyMode(next);
      if (next) toast('管理模式已开启：卡片右上角可编辑 / 删除');
    });
  }

  /* ------------------------------------------------------------------------
     首屏叠加：隐藏 -> 改字段 -> 新增
     ---------------------------------------------------------------------- */
  var changed = false;

  [].slice.call(grid.querySelectorAll('.work')).forEach(function (card) {
    var slug = slugOfCard(card);

    if (slug && raw.deleted.indexOf(slug) >= 0) {
      card.parentNode.removeChild(card);
      changed = true;
      return;
    }

    if (slug && raw.edits[slug]) {
      patchCard(card, raw.edits[slug]);
      changed = true;
    }

    attachAdmin(card);
  });

  var added = store.all().filter(function (item) { return item.state === 'added'; });
  for (var i = added.length - 1; i >= 0; i -= 1) {
    var card = buildCard(added[i]);
    attachAdmin(card);
    grid.insertBefore(card, grid.firstChild);
    changed = true;
  }

  if (changed) refreshCounts();
}(window));

