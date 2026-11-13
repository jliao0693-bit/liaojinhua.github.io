/* ==========================================================================
   12 的个人空间 - 设计规范页「项目级规范」卡片
   ----------------------------------------------------------------------------
   这一排不再写死 3 个示例项目，而是按「实际上传的作品」渲染：
     WorksStore.all()  = assets/works-index.js 的出厂 19 个 + 管理页上传 / 隐藏后的结果
   每张卡就是该项目的适配规范入口，一屏 3 张、每 15s 前进一张（assets/carousel.js）。

   分类 -> 设备胶囊 / 适配要点 的映射与 works.html 的筛选分类一一对应；
   新增作品只要带 cat，卡片就会自动补上对应的适配要点。
   ========================================================================== */
(function (global) {
  'use strict';

  var DEVICE = {
    app:    { label: '移动端', mod: 'mobile',  note: 'iOS / Android 双端，竖屏为主，触控优先' },
    pc:     { label: 'PC 端',  mod: 'desktop', note: '桌面浏览器，多列栅格，键鼠交互为主' },
    screen: { label: '大屏',   mod: 'screen',  note: '1920×1080，等比缩放，远距离可视优先' },
    promo:  { label: '活动页', mod: 'promo',   note: '移动端单列长页，480 宽出图，一屏只讲一个卖点' },
    banner: { label: '宣传图', mod: 'banner',  note: '固定版式出图，按渠道尺寸等比适配' },
    ai:     { label: '视频',   mod: 'ai',      note: '16:9 横屏成片，字幕与安全区位置统一' }
  };

  /* 分类缺失时的兜底（用户新增作品理论上不会发生，防护一下） */
  var FALLBACK = { label: '项目', mod: 'mobile', note: '跟随所属设备，按项目单独适配' };

  /* 有独立规范页的项目：这里登记过的作品，卡片直链 spec/<slug>.html */
  var SPEC_PAGES = {
    'fitness-app': 'spec/fitness-app.html',
    'dashboard-bi': 'spec/dashboard-bi.html',
    'city-screen': 'spec/city-screen.html'
  };

  var root = document.querySelector('[data-spec-carousel]');
  var track = root && root.querySelector('[data-carousel-track]');
  if (!root || !track) return;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function subLabel(item) {
    var store = global.WorksStore;
    if (!store || !item.cat || !item.sub) return '';
    var group = store.TAXONOMY[item.cat];
    return (group && group.subs && group.subs[item.sub]) || '';
  }

  function card(item, index, total) {
    var dev = DEVICE[item.cat] || FALLBACK;
    var sub = subLabel(item);
    var spec = SPEC_PAGES[item.slug];
    var link = document.createElement('a');

    link.className = 'plspec-card carousel__slide glass glass--soft glass--d60';
    link.href = spec || item.href;
    link.setAttribute('role', 'group');
    link.setAttribute('aria-roledescription', 'slide');
    link.setAttribute('aria-label', (index + 1) + ' / ' + total);
    link.innerHTML =
      '<span class="plspec-card__device plspec-card__device--' + dev.mod + '">' +
        esc(dev.label) +
      '</span>' +
      '<h3 class="plspec-card__title">' + esc(item.title) + '</h3>' +
      '<p class="plspec-card__desc">' + esc(dev.note + (sub ? ' · ' + sub : '')) + '</p>' +
      '<span class="plspec-card__more">' + (spec ? '查看项目规范' : '查看项目详情') + '</span>';

    return link;
  }

  function render() {
    var store = global.WorksStore;
    var items = store ? store.all() : [];

    /* 拿不到数据（works-index.js 没加载 / 被拦）时保留 HTML 里的静态 3 张，
       轮播照跑，页面不会空一块。 */
    if (items.length) {
      track.innerHTML = '';
      for (var i = 0; i < items.length; i += 1) {
        track.appendChild(card(items[i], i, items.length));
      }
    }

    if (global.Carousel) global.Carousel.init(root);
  }

  render();
}(window));
