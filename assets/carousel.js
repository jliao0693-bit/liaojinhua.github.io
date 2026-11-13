/* ==========================================================================
   12 的个人空间 - 横向卡片轮播（原生 JS，无依赖）
   ----------------------------------------------------------------------------
   一个组件两处复用：
     · 首页「精选作品」：19 张作品卡，卡片直接写在 index.html 里；
     · 设计规范页「项目级规范」：assets/spec-cards.js 按实际作品渲染卡片后，
       再手动调用 Carousel.init(root)（容器标 data-carousel="manual"，
       自动初始化会跳过它，避免抢在渲染之前量尺寸）。

   约定：
     · 一屏张数由 CSS 变量 --carousel-visible 决定（3 / 2 / 1），JS 只量实际卡宽；
     · 首 3 张克隆到末尾，滚到克隆那屏再瞬回第 1 张，循环处不跳帧也不露白；
     · hover / 键盘聚焦 / 滚出视口 / 切后台都会暂停，进度条（纯 CSS 动画）
       跟 setTimeout 停在同一个时刻，恢复后不会各走各的；
     · prefers-reduced-motion 下不自动播放，只留前后按钮（位移瞬切）。
   ========================================================================== */
(function (global) {
  'use strict';

  /* 与 CSS 里最大的 --carousel-visible（桌面 3 张）一致：克隆这一组就够接住
     任何断点下的循环，窄屏只用到其中前几张。 */
  var CLONES = 3;

  function pad(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function init(root) {
    if (!root || root.getAttribute('data-carousel-ready') === '1') return;

    var track = root.querySelector('[data-carousel-track]');
    if (!track) return;

    var slides = [].slice.call(track.children);
    var total = slides.length;
    if (!total) return;

    var prevBtn = root.querySelector('[data-carousel-prev]');
    var nextBtn = root.querySelector('[data-carousel-next]');
    var bar = root.querySelector('[data-carousel-bar]');
    var counter = root.querySelector('[data-carousel-counter]');

    var INTERVAL = parseInt(root.getAttribute('data-carousel-interval'), 10) || 15000;

    var index = 0;
    var step = 0;

    /* 倒计时状态：remaining 是「还要跑多少毫秒」，暂停时按 deadline 折算 */
    var remaining = INTERVAL;
    var deadline = 0;
    var timer = 0;
    var resizeTimer = 0;

    var hovered = false;
    var focused = false;
    var inView = true;
    /* null = 还没跑过 sync()，好让第一次 sync() 一定落到 schedule 分支 */
    var paused = null;

    var reduceMotion = global.matchMedia('(prefers-reduced-motion: reduce)');

    root.setAttribute('data-carousel-ready', '1');
    /* 进度条的时长与 data-carousel-interval 保持同一个来源 */
    root.style.setProperty('--carousel-interval', INTERVAL + 'ms');

    /* --- 结构：把开头几张克隆到末尾，给循环那一步落脚 -------------------- */
    function addClones() {
      var count = Math.min(CLONES, Math.max(total - 1, 0));
      for (var i = 0; i < count; i += 1) {
        var clone = slides[i].cloneNode(true);
        clone.setAttribute('data-clone', '');
        clone.removeAttribute('role');
        clone.removeAttribute('aria-roledescription');
        clone.removeAttribute('aria-label');
        /* inert + aria-hidden：克隆件不进无障碍树，也不会被 Tab 到第二次 */
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('inert', '');
        track.appendChild(clone);
      }
    }

    /* --- 步长：卡片实际宽度 + flex gap ----------------------------------- */
    function measure() {
      var gap = parseFloat(global.getComputedStyle(track).columnGap);
      if (isNaN(gap)) gap = 0;
      step = slides[0].getBoundingClientRect().width + gap;
    }

    function position(animate) {
      if (!animate) track.style.transition = 'none';
      track.style.transform = 'translate3d(' + (-index * step).toFixed(2) + 'px, 0, 0)';
      if (!animate) {
        void track.offsetWidth; /* 强制回流，让 transition:none 立刻生效 */
        track.style.transition = '';
      }
    }

    function updateCounter() {
      if (counter) counter.textContent = pad((index % total) + 1) + ' / ' + total;
    }

    /* --- 进度条：每次推进都从 0 重新播放，和倒计时对齐 ------------------ */
    function restartProgress() {
      if (!bar) return;
      bar.style.animation = 'none';
      void bar.offsetWidth;
      bar.style.animation = '';
    }

    function schedule() {
      global.clearTimeout(timer);
      timer = 0;
      if (paused !== false) return;
      deadline = Date.now() + remaining;
      timer = global.setTimeout(function () {
        timer = 0;
        remaining = INTERVAL;
        advance(1);
      }, remaining);
    }

    /* --- 位移：dir 1 = 下一张，-1 = 上一张 ------------------------------- */
    function advance(dir) {
      if (dir > 0) {
        if (index >= total) { index = 0; position(false); }
        index += 1;
        position(true);
      } else {
        if (index <= 0) { index = total; position(false); }
        index -= 1;
        position(true);
      }
      remaining = INTERVAL;
      restartProgress();
      schedule();
      updateCounter();
    }

    /* 滚到克隆位（index === total）后立刻瞬回 0：两者视觉上是同一屏 */
    track.addEventListener('transitionend', function (event) {
      if (event.target !== track || event.propertyName !== 'transform') return;
      if (index >= total) {
        index = 0;
        position(false);
        updateCounter();
      }
    });

    /* --- 暂停条件：hover / 聚焦 / 离屏 / 后台 / 弱动效偏好 --------------- */
    function sync() {
      var next = hovered || focused || !inView || document.hidden || reduceMotion.matches;
      if (next === paused) return;

      if (next && timer) {
        /* 把已经跑掉的一段从 remaining 里扣掉，恢复时接着走 */
        global.clearTimeout(timer);
        timer = 0;
        remaining = Math.max(0, deadline - Date.now());
      }

      paused = next;
      root.classList.toggle('is-paused', next);
      if (!next) schedule();
    }

    addClones();
    measure();
    position(false);
    updateCounter();
    restartProgress();

    if (prevBtn) prevBtn.addEventListener('click', function () { advance(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { advance(1); });

    root.addEventListener('pointerenter', function () { hovered = true; sync(); });
    root.addEventListener('pointerleave', function () { hovered = false; sync(); });
    root.addEventListener('focusin', function () { focused = true; sync(); });
    root.addEventListener('focusout', function () { focused = false; sync(); });
    document.addEventListener('visibilitychange', sync);

    if ('IntersectionObserver' in global) {
      new global.IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        sync();
      }, { threshold: 0.2 }).observe(root);
    }

    global.addEventListener('resize', function () {
      global.clearTimeout(resizeTimer);
      resizeTimer = global.setTimeout(function () {
        measure();
        position(false);
      }, 160);
    });

    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', sync);
    }

    sync();
  }

  function initAll() {
    var nodes = document.querySelectorAll('[data-carousel]');
    for (var i = 0; i < nodes.length; i += 1) {
      /* data-carousel="manual"：卡片要等脚本渲染，交给渲染方自己调 init */
      if (nodes[i].getAttribute('data-carousel') === 'manual') continue;
      init(nodes[i]);
    }
  }

  global.Carousel = { init: init, initAll: initAll, CLONES: CLONES };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
}(window));
