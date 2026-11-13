/* ==========================================================================
   12 的个人空间 - 作品列表页的两级筛选
   ----------------------------------------------------------------------------
   一级胶囊 = 作品类型（data-cat-btn: all / app / pc / promo / banner / screen / ai）
   二级胶囊 = 该类型下的细分领域（.filters__group[data-group] 内的 [data-sub]）

   筛选逻辑（与参考图的交互一致）：
     · 「全部」：只列全部作品，不出现二级细分（筛选区保持一行类型胶囊）；
     · 点一级胶囊：只看该类型的项目，并在其下展开该类型的一组「… 细分」；
     · 点二级胶囊：在该类型范围内再筛一层，再点一次取消；切换一级时二级选中态清空；
     · 计数 / 空状态 / URL 同步更新，所以首页胶囊可以直接深链到
       works.html?cat=app、works.html?cat=banner&sub=launch。

   卡片用 article.work[data-cat][data-sub] 声明归属，纯静态页面即可工作，
   不需要构建步骤，也不依赖 Tailwind。
   ========================================================================== */
(function () {
  'use strict';

  var root = document.querySelector('[data-filter-root]');
  var grid = document.querySelector('[data-works-grid]');
  if (!root || !grid) return;

  var cards = [].slice.call(grid.querySelectorAll('.work'));

  /* 管理模式里删掉 / 新增过作品后（见 works-overlay.js），重新收集一次卡片。
     不重收集的话，删掉的节点仍留在闭包里，计数会算错。 */
  function collect() {
    cards = [].slice.call(grid.querySelectorAll('.work'));
  }
  var catButtons = [].slice.call(root.querySelectorAll('[data-cat-btn]'));
  var groups = [].slice.call(root.querySelectorAll('[data-group]'));
  var subButtons = [].slice.call(root.querySelectorAll('[data-sub]'));
  var countEl = document.querySelector('[data-filter-count]');
  var emptyEl = document.querySelector('[data-works-empty]');

  var state = { cat: 'all', sub: '' };

  function hasCat(value) {
    return catButtons.some(function (button) {
      return button.getAttribute('data-cat-btn') === value;
    });
  }

  function hasSub(value) {
    return subButtons.some(function (button) {
      return button.getAttribute('data-sub') === value;
    });
  }

  /* 二级胶囊所属的一级类型，取自它所在的分组。
     同一个 sub 键可以出现在多个类型下（App 的「金融 / 工具」与运营的「金融 / 投资」
     都是 finance），所以按 cat 优先匹配：给了 cat 就先在该类型的分组里找，
     找不到再退回第一个同名胶囊。否则 ?cat=promo&sub=finance 会被 App 抢走。 */
  function ownerOf(sub, cat) {
    var fallback = '';
    for (var i = 0; i < subButtons.length; i += 1) {
      if (subButtons[i].getAttribute('data-sub') !== sub) continue;
      var group = subButtons[i].closest('[data-group]');
      var owner = group ? group.getAttribute('data-group') : '';
      if (cat && owner === cat) return owner;
      if (!fallback) fallback = owner;
    }
    return fallback;
  }

  /* 刷新筛选结果：胶囊状态 -> 细分分组显隐 -> 卡片显隐 -> 计数 / 空状态。 */
  function render() {
    catButtons.forEach(function (button) {
      var on = button.getAttribute('data-cat-btn') === state.cat;
      button.classList.toggle('chip--active', on);
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    subButtons.forEach(function (button) {
      var on = !!state.sub && button.getAttribute('data-sub') === state.sub;
      button.classList.toggle('chip--active', on);
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    /* 二级细分只在选中某个类型时出现，且只出现该类型的一组；「全部」下整块收起。 */
    groups.forEach(function (group) {
      group.hidden = state.cat === 'all' || group.getAttribute('data-group') !== state.cat;
    });

    var visible = 0;
    cards.forEach(function (card) {
      var inCat = state.cat === 'all' || card.getAttribute('data-cat') === state.cat;
      var inSub = !state.sub || card.getAttribute('data-sub') === state.sub;
      var on = inCat && inSub;
      card.hidden = !on;
      if (on) visible += 1;
    });

    grid.hidden = visible === 0;
    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (countEl) {
      countEl.textContent = '共 ' + visible + ' 个项目 · 按更新时间排序';
    }
  }

  /* 把当前筛选写回地址栏，方便分享 / 从首页深链进来（不新增历史记录）。 */
  function syncUrl() {
    if (!window.history || !window.history.replaceState) return;
    try {
      var params = new URLSearchParams(window.location.search);
      if (state.cat === 'all') { params.delete('cat'); } else { params.set('cat', state.cat); }
      if (state.sub) { params.set('sub', state.sub); } else { params.delete('sub'); }
      var query = params.toString();
      var hash = window.location.hash || '';
      window.history.replaceState(
        null,
        '',
        window.location.pathname + (query ? '?' + query : '') + hash
      );
    } catch (error) {
      /* file:// 等环境拒绝改地址时不阻断筛选。 */
    }
  }

  /* 收敛一次状态变更：非法值回落到「全部」，二级选中时一级跟随它所在的分组
     （先按当前 cat 找同名的胶囊，再退回全局第一个）。 */
  function apply(cat, sub, sync) {
    state.cat = hasCat(cat) ? cat : 'all';
    state.sub = hasSub(sub) ? sub : '';
    if (state.sub) {
      var owner = ownerOf(state.sub, state.cat);
      if (owner) state.cat = owner;
    }
    render();
    if (sync !== false) syncUrl();
  }

  root.addEventListener('click', function (event) {
    var button = event.target.closest('[data-cat-btn], [data-sub]');
    if (!button || !root.contains(button)) return;

    if (button.hasAttribute('data-cat-btn')) {
      apply(button.getAttribute('data-cat-btn'), '');
      return;
    }

    var sub = button.getAttribute('data-sub');
    var owner = ownerOf(sub, state.cat) || state.cat;
    apply(owner, sub === state.sub ? '' : sub);
  });

  /* 首屏按 URL 还原筛选状态（?cat=app / ?cat=banner&sub=launch）。 */
  var initial = new URLSearchParams(window.location.search);
  apply(initial.get('cat') || 'all', initial.get('sub') || '', false);

  /* works-overlay.js 增删卡片后广播，这里重新收卡片并重算计数 / 空状态。 */
  window.addEventListener('works:changed', function () {
    collect();
    render();
  });
})();

