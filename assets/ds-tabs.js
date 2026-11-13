/* ==========================================================================
   12 的个人空间 - 设计规范页的标签切换（主要设计规范）
   ----------------------------------------------------------------------------
   色彩 / 字体 / 间距 / 玻璃 / 组件五个面板，同一时刻只显示一个：

     · 点标签切换；聚焦标签后 ← → / Home / End 也能切；
     · aria-selected + 漫游 tabindex，读屏能正确播报当前是第几个标签；
     · 当前分类写进地址栏 #color / #type / #space / #glass / #comp，
       可以直接把某一类发给别人，浏览器前进 / 后退也会跟着切；
     · 无 JS 时第一个面板（色彩系统）依然可见，标签栏退化成静态胶囊，
       不会出现「整块内容消失」的情况。

   纯静态实现，不依赖任何框架，也不参与构建。
   ========================================================================== */
(function () {
  'use strict';

  var root = document.querySelector('[data-ds-tabs]');
  if (!root) return;

  var tabs = [].slice.call(root.querySelectorAll('[data-ds-tab]'));
  var panels = [].slice.call(root.querySelectorAll('[data-ds-panel]'));
  if (!tabs.length || !panels.length) return;

  function hasPanel(name) {
    return panels.some(function (panel) {
      return panel.getAttribute('data-ds-panel') === name;
    });
  }

  /* 当前选中标签的 key，用于判断 hashchange 是否真的需要切。 */
  function currentKey() {
    for (var i = 0; i < tabs.length; i += 1) {
      if (tabs[i].getAttribute('aria-selected') === 'true') {
        return tabs[i].getAttribute('data-ds-tab');
      }
    }
    return tabs[0].getAttribute('data-ds-tab');
  }

  /* 切换：标签选中态 -> 漫游 tabindex -> 面板显隐 -> 地址栏 hash。 */
  function show(name, sync) {
    var target = hasPanel(name) ? name : tabs[0].getAttribute('data-ds-tab');

    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-ds-tab') === target;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
    });

    panels.forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-ds-panel') !== target;
    });

    if (sync !== false) syncHash(target);
  }

  /* 把当前分类写回地址栏，方便分享（不新增历史记录）。 */
  function syncHash(name) {
    if (!window.history || !window.history.replaceState) return;
    try {
      window.history.replaceState(null, '', '#' + name);
    } catch (error) {
      /* file:// 等环境拒绝改地址时不阻断切换。 */
    }
  }

  function hashKey() {
    return (window.location.hash || '').replace(/^#/, '');
  }

  root.addEventListener('click', function (event) {
    var tab = event.target.closest('[data-ds-tab]');
    if (!tab || !root.contains(tab)) return;
    show(tab.getAttribute('data-ds-tab'));
  });

  /* 键盘：← → / ↑ ↓ 在同组标签间移动焦点并直接切换，Home / End 跳到首尾。 */
  root.addEventListener('keydown', function (event) {
    var tab = event.target.closest('[data-ds-tab]');
    if (!tab) return;

    var index = tabs.indexOf(tab);
    var next = -1;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = (index + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    tabs[next].focus();
    show(tabs[next].getAttribute('data-ds-tab'));
  });

  /* 深链 / 前进后退：#color 之类的 hash 变化都跟着切面板。 */
  window.addEventListener('hashchange', function () {
    var key = hashKey();
    if (key && key !== currentKey()) show(key, false);
  });

  /* 首屏：优先按 hash 还原，没有 hash 就停在 HTML 里默认选中的第一个标签。 */
  var initial = hashKey();
  if (initial) show(initial, false);
})();
