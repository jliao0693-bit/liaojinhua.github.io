/* ==========================================================================
   12 的个人空间 - 新增作品的详情页（works/view.html?slug=xxx）
   --------------------------------------------------------------------------
   出厂作品的详情是构建脚本生成的静态页（works/<slug>.html），这里只负责
   浏览器里「新增」的作品：从 localStorage 读出来渲染成同样的版式。
   命中出厂作品时直接 replace 到静态页，保证同一内容只有一个地址。

   没有这件作品（slug 写错 / 已删除）就露出内置的缺省面板。
   ========================================================================== */
(function (global) {
  'use strict';

  var store = global.WorksStore;
  var root = document.querySelector('[data-view]');
  var missing = document.querySelector('[data-missing]');
  if (!store || !root) return;

  var slug = new URLSearchParams(global.location.search).get('slug') || '';
  var item = slug ? store.get(slug) : null;

  /* 出厂作品 -> 静态详情页。 */
  if (item && item.source !== 'added') {
    global.location.replace(item.href);
    return;
  }

  if (!item || item.state === 'deleted') {
    root.hidden = true;
    if (missing) missing.hidden = false;
    return;
  }

  root.hidden = false;
  if (missing) missing.hidden = true;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  var catLabel = item.catLabel || store.catLabel(item.cat) || '';
  var taxonomy = store.TAXONOMY[item.cat];
  var subLabel = (taxonomy && taxonomy.subs[item.sub]) || item.sub || '';

  document.title = item.title + ' · 12 的个人空间';

  var crumb = document.querySelector('[data-view-crumb]');
  if (crumb) crumb.textContent = item.title;

  document.querySelector('[data-view-eyebrow]').textContent = 'Case Study · ' + (catLabel || '作品');
  document.querySelector('[data-view-title]').textContent = item.title;
  document.querySelector('[data-view-lead]').textContent = item.lead || item.desc || '';

  var metaHost = document.querySelector('[data-view-meta]');
  [
    ['分类', catLabel || '—'],
    ['细分', subLabel || '—'],
    ['标签', (item.tags || []).join(' / ') || '—'],
    ['更新', String(item.createdAt || '').slice(0, 10) || '—']
  ].forEach(function (pair) {
    var wrap = el('div', 'meta-item glass glass--soft glass--d35');
    wrap.appendChild(el('span', 'meta-item__k', pair[0]));
    wrap.appendChild(el('span', 'meta-item__v', pair[1]));
    metaHost.appendChild(wrap);
  });

  var figure = document.querySelector('[data-view-figure]');
  var cover = document.querySelector('[data-view-cover]');
  if (item.cover) {
    cover.setAttribute('src', item.cover);
    cover.setAttribute('alt', item.coverAlt || item.title);
    cover.setAttribute('width', '584');
    cover.setAttribute('height', '400');
    var cap = document.querySelector('[data-view-cap]');
    if (cap) cap.textContent = item.desc || item.title;
  } else if (figure) {
    figure.hidden = true;
  }

  var body = document.querySelector('[data-view-body]');
  var paragraphs = (item.paragraphs && item.paragraphs.length)
    ? item.paragraphs
    : [item.lead || item.desc || '这个作品还没有填写详情，可以在「作品管理」里补上导语与正文。'];
  paragraphs.forEach(function (text) {
    body.appendChild(el('p', '', text));
  });

  var note = document.querySelector('[data-view-body-note]');
  if (note) note.textContent = catLabel + (subLabel ? ' · ' + subLabel : '');

  var edit = document.querySelector('[data-view-edit]');
  if (edit) {
    edit.setAttribute('href', '../manage.html?slug=' + encodeURIComponent(item.slug) + '&act=edit');
  }
}(window));
