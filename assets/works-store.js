/* ==========================================================================
   12 的个人空间 - 作品数据层（静态站 · 无后端）
   --------------------------------------------------------------------------
   读：assets/works-index.js 里的 window.WORKS_SEED（出厂状态，只读）
   写：localStorage['gerenboke.works.v1']，三种改动
         deleted  []        被隐藏的作品 slug（软删除，可恢复）
         edits    {slug:{}} 对出厂作品的字段覆盖（标题 / 分类 / 标签 / 封面 …）
         added    []        新上传的作品（封面图存成 dataURL）
       渲染 = 出厂状态 + 这些改动，所以清掉浏览器数据就回到出厂状态。

   为什么用 localStorage 而不是 IndexedDB：封面图会先压到 584×400，
   单张 40–90KB，十几张也远小于 5MB 配额，而且同步读写能让列表页在
   首屏就渲染完，不会闪一下。

   对外接口（window.WorksStore）：
     all(options)            合并后的作品列表（新增的排最前）
     get(slug)               单个作品
     create(fields)          新增（slug 冲突自动加序号）
     update(slug, patch)     改出厂作品 -> edits；改新增作品 -> 直接改 added
     remove(slug)            软删除（出厂作品写 deleted，新增作品直接移除）
     restore(slug)           恢复出厂作品
     reset()                 清掉全部本地改动
     stats()                 { total, base, edited, added, deleted }
     isEditMode() / setEditMode(bool)   列表页「管理模式」开关
     slugify(name)           文件名 -> slug
     compress(file)          图片压缩成 584×400 的 dataURL（Promise）
     exportData()            导出 works-data.json 片段 + 新增图片清单
     subscribe(fn)           数据变更订阅，返回取消函数
   ========================================================================== */
(function (global) {
  'use strict';

  var KEY = 'gerenboke.works.v1';
  var MODE_KEY = 'gerenboke.editmode';

  /* 类型 / 细分：与 works.html 的筛选胶囊一一对应，新增作品只能落在这里面。 */
  var TAXONOMY = {
    app: { label: 'App 设计', subs: { social: '社交 / 泛娱乐', outdoor: '户外 / 生活方式', sport: '运动 / 技术社区', finance: '金融 / 工具' } },
    pc: { label: 'PC 端设计', subs: { saas: '后台 / 官网 / SaaS' } },
    promo: { label: '运营 / 营销', subs: { ecom: '电商 / 大促', finance: '金融 / 投资', content: '内容 / 充值' } },
    banner: { label: '宣传图 / Banner', subs: { launch: '品牌 / 新品发布', promo: '电商 / 活动促销' } },
    screen: { label: '可视化大屏', subs: { monitor: '监控 / 数据看板', show: '活动 / 展示屏' } },
    ai: { label: 'AI 剪辑 / 生成', subs: { video: 'AI 剪辑视频', image: 'AI 生成图片' } }
  };

  var CAT_ORDER = ['app', 'pc', 'promo', 'banner', 'screen', 'ai'];
  var listeners = [];

  function seedItems() {
    var seed = global.WORKS_SEED;
    if (!seed || !seed.items) return [];
    return seed.items.slice();
  }

  function blank() {
    return { deleted: [], edits: {}, added: [] };
  }

  function read() {
    try {
      var raw = global.localStorage.getItem(KEY);
      if (!raw) return blank();
      var data = JSON.parse(raw);
      return {
        deleted: Array.isArray(data.deleted) ? data.deleted : [],
        edits: data.edits && typeof data.edits === 'object' ? data.edits : {},
        added: Array.isArray(data.added) ? data.added : []
      };
    } catch (error) {
      return blank();
    }
  }

  function write(data) {
    data.savedAt = new Date().toISOString();
    try {
      global.localStorage.setItem(KEY, JSON.stringify(data));
    } catch (error) {
      throw new Error('浏览器本地存储已满（约 5MB）。请先删掉几个带封面图的作品，或换更小的图片。');
    }
    listeners.forEach(function (fn) {
      try { fn(data); } catch (error) { /* 订阅方报错不影响写入 */ }
    });
  }

  function catLabelOf(cat) {
    return TAXONOMY[cat] ? TAXONOMY[cat].label : cat;
  }

  function assign(target) {
    for (var i = 1; i < arguments.length; i += 1) {
      var src = arguments[i];
      if (!src) continue;
      for (var k in src) {
        if (Object.prototype.hasOwnProperty.call(src, k) && src[k] !== undefined) target[k] = src[k];
      }
    }
    return target;
  }

  /* 出厂作品 + 本地改动 = 渲染用对象；state 用来在管理页显示徽章。 */
  function decorate(item, state) {
    var out = assign({}, item);
    out.state = state;
    out.catLabel = item.catLabel || catLabelOf(item.cat);
    out.href = item.source === 'added'
      ? 'works/view.html?slug=' + encodeURIComponent(item.slug)
      : (item.href || 'works/' + item.slug + '.html');
    return out;
  }

  function all(options) {
    var opts = options || {};
    var data = read();
    var out = [];

    /* 新增的排最前：刚上传的作品应该一眼看到。 */
    data.added.forEach(function (item) {
      if (opts.includeDeleted || data.deleted.indexOf(item.slug) < 0) {
        out.push(decorate(item, 'added'));
      }
    });

    seedItems().forEach(function (item) {
      var edited = data.edits[item.slug];
      var merged = decorate(edited ? assign({}, item, edited) : item, edited ? 'edited' : 'base');
      if (data.deleted.indexOf(item.slug) >= 0) {
        if (!opts.includeDeleted) return;
        merged.state = 'deleted';
      }
      out.push(merged);
    });

    return out;
  }

  function get(slug) {
    var list = all({ includeDeleted: true });
    for (var i = 0; i < list.length; i += 1) {
      if (list[i].slug === slug) return list[i];
    }
    return null;
  }

  function exists(slug) {
    return !!get(slug);
  }

  function slugify(name) {
    var base = String(name || '')
      .replace(/\.[a-z0-9]+$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
    return base || ('work-' + Date.now().toString(36));
  }

  function uniqueSlug(slug) {
    var candidate = slug;
    var n = 2;
    while (exists(candidate)) {
      candidate = slug + '-' + n;
      n += 1;
    }
    return candidate;
  }

  function firstSub(cat) {
    var subs = TAXONOMY[cat] && TAXONOMY[cat].subs;
    if (!subs) return '';
    for (var k in subs) { if (Object.prototype.hasOwnProperty.call(subs, k)) return k; }
    return '';
  }

  function create(fields) {
    var data = read();
    var cat = fields.cat || 'app';
    var item = {
      source: 'added',
      slug: uniqueSlug(slugify(fields.slug || fields.title)),
      title: fields.title || '未命名作品',
      cat: cat,
      sub: fields.sub || firstSub(cat),
      catLabel: catLabelOf(cat),
      tags: fields.tags || [],
      cover: fields.cover || '',
      coverAlt: fields.coverAlt || '',
      desc: fields.desc || '',
      lead: fields.lead || '',
      paragraphs: fields.paragraphs || [],
      createdAt: new Date().toISOString()
    };
    data.added.unshift(item);
    write(data);
    return item;
  }

  function update(slug, patch) {
    var data = read();
    var isAdded = false;

    data.added = data.added.map(function (item) {
      if (item.slug !== slug) return item;
      isAdded = true;
      var next = assign({}, item, patch);
      if (patch.cat) next.catLabel = catLabelOf(patch.cat);
      return next;
    });

    if (!isAdded) {
      var base = null;
      seedItems().forEach(function (item) { if (item.slug === slug) base = item; });
      if (!base) throw new Error('找不到作品：' + slug);

      data.edits[slug] = assign({}, data.edits[slug], patch);

      /* 改回和出厂一致就把覆盖删掉，徽章才不会一直挂着「已编辑」。 */
      var dirty = false;
      for (var k in data.edits[slug]) {
        if (!Object.prototype.hasOwnProperty.call(data.edits[slug], k)) continue;
        if (String(data.edits[slug][k]) !== String(base[k] === undefined ? '' : base[k])) {
          dirty = true;
          break;
        }
      }
      if (!dirty) delete data.edits[slug];
    }

    write(data);
    return get(slug);
  }

  function remove(slug) {
    var data = read();
    var before = data.added.length;
    data.added = data.added.filter(function (item) { return item.slug !== slug; });

    if (data.added.length === before) {
      if (data.deleted.indexOf(slug) < 0) data.deleted.push(slug);
      delete data.edits[slug];
    } else {
      data.deleted = data.deleted.filter(function (s) { return s !== slug; });
    }

    write(data);
  }

  function restore(slug) {
    var data = read();
    data.deleted = data.deleted.filter(function (s) { return s !== slug; });
    write(data);
  }

  function reset() {
    try { global.localStorage.removeItem(KEY); } catch (error) { /* 忽略 */ }
    listeners.forEach(function (fn) { fn(read()); });
  }

  function stats() {
    var data = read();
    var base = seedItems();
    return {
      total: base.length + data.added.length - data.deleted.length,
      base: base.length,
      edited: Object.keys(data.edits).length,
      added: data.added.length,
      deleted: data.deleted.length
    };
  }

  function isEditMode() {
    try { return global.localStorage.getItem(MODE_KEY) === '1'; } catch (error) { return false; }
  }

  function setEditMode(on) {
    try { global.localStorage.setItem(MODE_KEY, on ? '1' : '0'); } catch (error) { /* 忽略 */ }
  }

  /* 图片 -> 584×400（列表卡片 2x）居中裁切的 dataURL。
     统一转 JPEG：同一张图比 PNG 小 3–5 倍，配额更经用。 */
  function compress(file, options) {
    var opts = options || {};
    var targetW = opts.width || 584;
    var targetH = opts.height || 400;
    var quality = opts.quality || 0.85;

    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) {
        reject(new Error('只支持图片文件（PNG / JPG / WebP）。'));
        return;
      }

      var url = URL.createObjectURL(file);
      var img = new Image();

      img.onload = function () {
        try {
          var scale = Math.max(targetW / img.width, targetH / img.height);
          var drawW = Math.round(img.width * scale);
          var drawH = Math.round(img.height * scale);

          var canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = '#E9EDFB';
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(
            img,
            Math.round((targetW - drawW) / 2),
            Math.round((targetH - drawH) / 2),
            drawW,
            drawH
          );

          URL.revokeObjectURL(url);
          resolve({ dataURL: canvas.toDataURL('image/jpeg', quality), w: targetW, h: targetH });
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };

      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('这张图读不出来，换一张试试。'));
      };

      img.src = url;
    });
  }

  /* 导出成 works-data.json 的 projects 片段 + 需要落盘的封面图，
     方便把浏览器里调好的内容交回给 tools/build-works.ps1 固化。 */
  function exportData() {
    var data = read();
    var images = [];
    var projects = [];

    data.added.forEach(function (item) {
      var coverPath = 'work-' + item.slug + '.png';
      if (item.cover && item.cover.indexOf('data:') === 0) {
        images.push({ name: coverPath, dataURL: item.cover });
      }
      projects.push({
        slug: item.slug,
        title: item.title,
        cat: item.catLabel,
        eyebrow: 'Case Study · ' + (item.tags[0] || item.catLabel),
        desc: item.desc,
        lead: item.lead,
        meta: [
          { k: '分类', v: item.catLabel },
          { k: '细分', v: (TAXONOMY[item.cat] && TAXONOMY[item.cat].subs[item.sub]) || item.sub },
          { k: '标签', v: item.tags.join(' / ') },
          { k: '上传', v: String(item.createdAt || '').slice(0, 10) }
        ],
        hero: {
          img: coverPath, w: 584, h: 400,
          alt: item.coverAlt || item.title,
          cap: item.desc || item.title
        },
        sections: [{
          id: 'bg', title: '项目背景', note: '', type: 'prose',
          text: item.paragraphs.length ? item.paragraphs : [item.lead || item.desc || item.title]
        }]
      });
    });

    return {
      json: {
        '//': '由 manage.html 导出，可合进 tools/works-data.json 后重跑 build-works.ps1',
        projects: projects
      },
      images: images,
      hidden: data.deleted.slice(),
      edited: data.edits
    };
  }

  function subscribe(fn) {
    listeners.push(fn);
    return function () {
      listeners = listeners.filter(function (item) { return item !== fn; });
    };
  }

  global.WorksStore = {
    KEY: KEY,
    TAXONOMY: TAXONOMY,
    CAT_ORDER: CAT_ORDER,
    catLabel: catLabelOf,
    firstSub: firstSub,
    seed: seedItems,
    raw: read,
    all: all,
    get: get,
    exists: exists,
    create: create,
    update: update,
    remove: remove,
    restore: restore,
    reset: reset,
    stats: stats,
    slugify: slugify,
    uniqueSlug: uniqueSlug,
    compress: compress,
    exportData: exportData,
    isEditMode: isEditMode,
    setEditMode: setEditMode,
    subscribe: subscribe
  };
}(window));
