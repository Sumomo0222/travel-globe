/* ============================================================
   环球旅行地图 · 总控
   筛选(年份/大洲/主题) × 顶部统计 × 时间轴 ⇄ 地球双向联动
   悬停提示卡 / 国家回执 / 移动端抽屉
   ============================================================ */
(function () {
  'use strict';

  const ATLAS = window.ATLAS;
  const $ = s => document.querySelector(s);

  const el = {
    loader: $('#loader'),
    statCountries: $('#stat-countries'),
    statCities: $('#stat-cities'),
    statDistance: $('#stat-distance'),
    chipsYear: $('#chips-year'),
    chipsContinent: $('#chips-continent'),
    chipsTheme: $('#chips-theme'),
    filters: $('#filters'),
    timeline: $('#timeline'),
    timelineBody: $('#timeline-body'),
    sheetHandle: $('#sheet-handle'),
    btnReset: $('#btn-reset'),
    btnRotate: $('#btn-rotate'),
    btnSheet: $('#btn-sheet'),
    tooltip: $('#tooltip'),
    toast: $('#country-toast'),
    canvas: $('#globe'),
  };

  const state = { year: new Set(), continent: new Set(), theme: new Set(), active: null, pinned: false };
  let globe = null;
  let toastTimer = null;
  let firstDraw = true;

  if (location.protocol === 'file:') {
    el.loader.querySelector('p').textContent = '请通过本地服务器打开：python3 -m http.server';
  }

  /* ================= 筛选 ================= */
  const CONTINENTS = ['亚洲', '欧洲', '非洲', '北美洲', '南美洲', '大洋洲'];

  function buildChips() {
    const yearChips = [['全部', null], ...ATLAS.years.map(y => [String(y), y])];
    el.chipsYear.innerHTML = yearChips.map(([label, val]) =>
      `<button class="chip" data-val="${val === null ? '' : val}">${label}</button>`).join('');
    el.chipsContinent.innerHTML = CONTINENTS.map(c =>
      `<button class="chip" data-val="${c}">${c}</button>`).join('');
    el.chipsTheme.innerHTML = ATLAS.themes.map(t =>
      `<button class="chip" data-val="${t}">${t}</button>`).join('');
  }

  function bindChips(container, set, numeric) {
    const norm = v => (numeric ? Number(v) : v);
    container.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const v = chip.dataset.val;
      if (v === '') { set.clear(); }
      else if (set.has(norm(v))) set.delete(norm(v));
      else set.add(norm(v));
      refresh();
    });
    container._sync = () => {
      container.querySelectorAll('.chip').forEach(c => {
        const v = c.dataset.val;
        c.classList.toggle('on', v === '' ? set.size === 0 : set.has(norm(v)));
      });
    };
  }

  function filteredTrips() {
    return ATLAS.trips
      .filter(t => state.year.size === 0 || state.year.has(t.year))
      .map(t => Object.assign({}, t, {
        cities: t.cities.filter(c =>
          (state.continent.size === 0 || state.continent.has(c.continent)) &&
          (state.theme.size === 0 || c.themes.some(th => state.theme.has(th)))
        )
      }))
      .filter(t => t.cities.length > 0);
  }

  /* ================= 统计 ================= */
  function fmtKm(km) {
    if (km >= 100000) return (km / 10000).toFixed(0) + '万';
    if (km >= 10000) return (km / 10000).toFixed(1) + '万';
    return km.toLocaleString('zh-CN');
  }

  function updateStats(trips) {
    const cities = trips.flatMap(t => t.cities);
    const countries = new Set(cities.map(c => c.countryEn));
    let km = 0;
    trips.forEach(t => {
      for (let i = 1; i < t.cities.length; i++) km += ATLAS.distance(t.cities[i - 1], t.cities[i]);
    });
    el.statCountries.textContent = countries.size;
    el.statCities.textContent = cities.length;
    el.statDistance.textContent = fmtKm(Math.round(km));
    el.statDistance.parentElement.title = Math.round(km).toLocaleString('zh-CN') + ' 公里';
  }

  /* ================= 时间轴 ================= */
  function renderTimeline(trips) {
    const byYear = new Map();
    trips.forEach(t => {
      if (!byYear.has(t.year)) byYear.set(t.year, []);
      byYear.get(t.year).push(t);
    });
    const years = [...byYear.keys()].sort((a, b) => b - a);

    el.timelineBody.innerHTML = years.map(y => {
      const color = ATLAS.yearColors[y] || '#E9B44C';
      const tripsHtml = byYear.get(y).map(t => {
        const km = Math.round(t.cities.slice(1).reduce((s, c, i) => s + ATLAS.distance(t.cities[i], c), 0));
        const citiesHtml = t.cities.map(c => `
          <button class="city-item" data-city="${c.name}" style="--trip-color:${color}">
            <i class="dot"></i><span class="c-date">${esc(c.date)}</span>
            <span class="c-name">${esc(c.name)}</span>
            <span class="c-country">${esc(c.country)}</span>
            <span class="c-weather">${esc(c.weather.split(' ')[0])}</span>
          </button>`).join('');
        return `
          <div class="trip-block" style="--trip-color:${color}">
            <button class="trip-title" data-trip="${t.id}">
              <span class="t-name">${esc(t.title)}</span>
              <span class="t-region">${esc(t.region)}</span>
            </button>
            <p class="t-meta">${esc(t.dates)} · ${km.toLocaleString('zh-CN')} km · 进入故事 ↗</p>
            ${citiesHtml}
          </div>`;
      }).join('');
      return `
        <div class="year-group">
          <div class="year-head" style="--year-color:${color}"><b>${y}</b><span>${byYear.get(y).length} 段旅程</span></div>
          ${tripsHtml}
        </div>`;
    }).join('') || '<p style="color:var(--faint);padding:20px;text-align:center">当前筛选下没有旅程 — 试着放宽条件 ✦</p>';
  }

  function bindTimeline() {
    el.timelineBody.addEventListener('click', e => {
      const tripBtn = e.target.closest('.trip-title');
      if (tripBtn) { Story.open(tripBtn.dataset.trip); return; }
      const cityBtn = e.target.closest('.city-item');
      if (cityBtn) {
        const c = ATLAS.cities.find(x => x.name === cityBtn.dataset.city);
        if (c) selectCity(c, { fly: true, openSheet: false });
      }
    });
    el.timelineBody.addEventListener('mouseover', e => {
      const btn = e.target.closest('.city-item');
      if (!btn || !globe) return;
      const c = ATLAS.cities.find(x => x.name === btn.dataset.city);
      if (c && c._visible) globe.hoverCity = c;
    });
    el.timelineBody.addEventListener('mouseout', () => { if (globe) globe.hoverCity = null; });
  }

  function highlightTimeline(city) {
    el.timelineBody.querySelectorAll('.city-item.active').forEach(n => n.classList.remove('active'));
    if (!city) return;
    const node = el.timelineBody.querySelector(`.city-item[data-city="${city.name}"]`);
    if (node) {
      node.classList.add('active');
      node.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  /* ================= 提示卡 ================= */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function fillTooltip(c) {
    el.tooltip.querySelector('.tip-photo').src = c.photo;
    el.tooltip.querySelector('.tip-photo').alt = c.name;
    el.tooltip.querySelector('.tip-name').textContent = c.name;
    el.tooltip.querySelector('.tip-latin').textContent = `${c.latin} · ${c.country}`;
    el.tooltip.querySelector('.tip-date').textContent = `${c.trip.year}.${c.date}`;
    el.tooltip.querySelector('.tip-weather').textContent = c.weather;
    el.tooltip.querySelector('.tip-themes').innerHTML = c.themes.map(t => `<em>${esc(t)}</em>`).join('');
    el.tooltip.querySelector('.tip-note').textContent = c.note;
    el.tooltip.querySelector('footer').textContent = state.pinned ? '✦ 进入旅程故事' : '点击查看细节';
  }

  function placeTooltip(x, y) {
    const pane = el.canvas.parentElement.getBoundingClientRect();
    const tw = el.tooltip.offsetWidth, th = el.tooltip.offsetHeight;
    let px = x + 18, py = y - 20;
    if (px + tw > pane.width - 12) px = x - tw - 18;
    if (py + th > pane.height - 12) py = pane.height - th - 12;
    if (py < 8) py = 8;
    el.tooltip.style.left = px + 'px';
    el.tooltip.style.top = py + 'px';
  }

  function showTooltip(c, x, y, pinned) {
    state.pinned = !!pinned;
    fillTooltip(c);
    el.tooltip.hidden = false;
    el.tooltip.classList.toggle('pinned', !!pinned);
    placeTooltip(x, y);
  }
  function hideTooltip(force) {
    if (state.pinned && !force) return;
    el.tooltip.hidden = true;
    state.pinned = false;
  }

  /* 点击提示卡 → 打开故事 */
  el.tooltip.addEventListener('click', () => {
    if (state.pinned && state.active) Story.open(state.active.trip.id);
  });

  /* ================= 城市选中 ================= */
  function selectCity(c, { fly = true } = {}) {
    state.active = c;
    globe.setActive(c);
    if (fly) globe.flyToCity(c);
    highlightTimeline(c);
    if (c._xy) showTooltip(c, c._xy[0], c._xy[1], true);
    if (window.innerWidth <= 960) el.timeline.classList.remove('open');
  }

  /* ================= 国家回执 ================= */
  function showCountry(info) {
    clearTimeout(toastTimer);
    if (!info) { el.toast.hidden = true; return; }
    if (info.visited) {
      el.toast.innerHTML = `
        <b>🧭 ${esc(info.zh)} · ${esc(info.continent)}</b>
        <p>已到访 ${info.cities.length} 座城市 — 点击城市名飞往</p>
        <div class="ct-cities">${info.cities.map(c => `<i data-city="${esc(c.name)}">${esc(c.name)}</i>`).join('')}</div>`;
      el.toast.querySelectorAll('i').forEach(n => {
        n.onclick = () => {
          const c = ATLAS.cities.find(x => x.name === n.dataset.city);
          if (c) { selectCity(c); el.toast.hidden = true; }
        };
      });
    } else {
      el.toast.innerHTML = `<b>✳ ${esc(info.nameEn)}</b><p>这里还没有足迹 — 留给未来的某一次出发</p>`;
    }
    el.toast.hidden = false;
    toastTimer = setTimeout(() => { el.toast.hidden = true; }, 5000);
  }

  /* ================= 刷新 ================= */
  function refresh() {
    const trips = filteredTrips();
    globe.setTrips(trips);
    updateStats(trips);
    renderTimeline(trips);
    el.chipsYear._sync && el.chipsYear._sync();
    el.chipsContinent._sync && el.chipsContinent._sync();
    el.chipsTheme._sync && el.chipsTheme._sync();
    if (state.active && !trips.some(t => t.cities.includes(state.active))) {
      state.active = null; globe.setActive(null); highlightTimeline(null); hideTooltip(true);
    }
  }

  /* ================= 移动端抽屉 ================= */
  function bindSheet() {
    el.btnSheet.addEventListener('click', () => el.timeline.classList.toggle('open'));
    let startY = 0, dragging = false;
    el.sheetHandle.addEventListener('pointerdown', e => {
      dragging = true; startY = e.clientY;
      el.sheetHandle.setPointerCapture(e.pointerId);
    });
    el.sheetHandle.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dy = e.clientY - startY;
      const open = el.timeline.classList.contains('open');
      if (!open && dy < -34) el.timeline.classList.add('open');
      if (open && dy > 34) el.timeline.classList.remove('open');
    });
    el.sheetHandle.addEventListener('pointerup', () => { dragging = false; });
    document.addEventListener('click', e => {
      if (el.timeline.classList.contains('open') &&
          !el.timeline.contains(e.target) && !el.btnSheet.contains(e.target) &&
          window.innerWidth <= 960) el.timeline.classList.remove('open');
    });
  }

  /* ================= 启动 ================= */
  async function boot() {
    buildChips();
    bindChips(el.chipsYear, state.year, true);
    bindChips(el.chipsContinent, state.continent);
    bindChips(el.chipsTheme, state.theme);
    bindTimeline();
    bindSheet();

    globe = new Globe(el.canvas, {
      onHoverCity(c, x, y) {
        if (c) showTooltip(c, x, y, false);
        else hideTooltip(false);
      },
      onSelectCity(c) {
        if (state.active === c) { Story.open(c.trip.id); return; }  // 再点一次 → 故事
        selectCity(c);
      },
      onSelectArc(trip) { Story.open(trip.id); },
      onCountry(info) { showCountry(info); },
    });

    try {
      await globe.init('data/countries-110m.json');
    } catch (err) {
      el.loader.querySelector('p').textContent = '地图数据加载失败，请通过 HTTP 服务器访问本页';
      console.error(err);
      return;
    }

    refresh();

    // 首次飞行动画：环视一圈后回到亚欧
    if (firstDraw) {
      firstDraw = false;
      globe.rotation = [-105, -28];
    }

    el.btnReset.addEventListener('click', () => { globe.resetView(); state.active = null; globe.setActive(null); highlightTimeline(null); hideTooltip(true); });
    el.btnRotate.addEventListener('click', () => {
      const on = el.btnRotate.classList.toggle('is-on');
      globe.setAutoRotate(on);
      el.btnRotate.setAttribute('aria-pressed', on);
    });

    Story.fromHash();
    setTimeout(() => el.loader.classList.add('hide'), 400);
  }

  boot();

  /* 调试句柄（自动化测试用） */
  window.__debug = { get globe() { return globe; }, state };
})();
