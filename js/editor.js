/* ============================================================
   环球旅行地图 · 档案管理器（足迹增删改）
   抽屉式管理：旅程 / 城市 的新增、编辑、删除
   地球选点（点击地球直接拾取经纬度）
   自动保存 localStorage · 导出 JSON · 生成 data.js · 恢复默认
   ============================================================ */
window.Editor = (function () {
  'use strict';

  const ATLAS = window.ATLAS;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CONTINENTS = ['亚洲', '欧洲', '非洲', '北美洲', '南美洲', '大洋洲'];

  let onChange = () => {};
  let countryNames = [];
  let pickCb = null;         // 「地球选点」回调
  let root, body;

  function init(o = {}) {
    onChange = o.onChange || onChange;
    countryNames = o.countryNames || [];
    root = document.getElementById('editor');
    body = document.getElementById('ed-body');

    document.getElementById('btn-editor').addEventListener('click', () => {
      if (!root.hidden) { close(); return; }
      const story = document.getElementById('story');
      if (window.Story && !story.hidden) window.Story.close();
      open();
    });
    document.getElementById('ed-close').addEventListener('click', close);
    document.getElementById('ed-add-trip').addEventListener('click', () => tripForm(null));
    document.getElementById('ed-export').addEventListener('click', exportJson);
    document.getElementById('ed-gendata').addEventListener('click', genDataJs);
    document.getElementById('ed-reset').addEventListener('click', resetDefault);

    body.addEventListener('click', e => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const { act, trip: tripId, city: cityName } = btn.dataset;
      const trip = ATLAS.trips.find(t => t.id === tripId);
      if (act === 'edit-trip' && trip) return tripForm(trip);
      if (act === 'del-trip' && trip) {
        if (confirm(`删除旅程「${trip.title}」及其 ${trip.cities.length} 座城市？`)) {
          ATLAS.replaceTrips(ATLAS.trips.filter(t => t !== trip));
          save();
          renderTree();
        }
        return;
      }
      if (act === 'add-city' && trip) return cityForm(trip, null);
      if (act === 'edit-city' && trip) {
        const c = trip.cities.find(x => x.name === cityName);
        if (c) return cityForm(trip, c);
      }
      if (act === 'del-city' && trip) {
        const c = trip.cities.find(x => x.name === cityName);
        if (c && confirm(`删除城市「${c.name}」？`)) {
          trip.cities = trip.cities.filter(x => x !== c);
          save();
          renderTree();
        }
      }
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (pickCb) { endPick(); return; }
        if (!root.hidden) close();
      }
    });
  }

  function open() { root.hidden = false; if (view === 'tree') renderTree(); }
  function close() { endPick(); root.hidden = true; }

  /* ---------- 持久化 ---------- */
  function save() {
    ATLAS.persist();
    ATLAS.rebuildDerived();
    onChange();
    flashSaved();
  }
  let flashTimer = null;
  function flashSaved() {
    const el = document.getElementById('ed-saved');
    if (!el) return;
    el.classList.add('show');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => el.classList.remove('show'), 1600);
  }

  /* ---------- 旅程树 ---------- */
  let view = 'tree';
  function renderTree() {    view = 'tree';
    const trips = [...ATLAS.trips].sort((a, b) => a.year - b.year);
    body.innerHTML = trips.map(t => `
      <div class="ed-trip">
        <div class="ed-trip-row">
          <div class="ed-trip-info">
            <b>No.${String(t.no ?? 0).padStart(2, '0')} ${esc(t.title)}</b>
            <span>${t.year} · ${esc(t.region || '')} · ${t.cities.length} 城</span>
          </div>
          <span class="ed-ops">
            <button class="ed-mini" data-act="add-city" data-trip="${t.id}" title="添加城市">＋城</button>
            <button class="ed-mini" data-act="edit-trip" data-trip="${t.id}" title="编辑旅程">✎</button>
            <button class="ed-mini danger" data-act="del-trip" data-trip="${t.id}" title="删除旅程">✕</button>
          </span>
        </div>
        ${t.cities.map(c => `
          <div class="ed-city-row">
            <span class="ed-city-info">· ${esc(c.name)} <i>${esc(c.country)} ${c.coord[0].toFixed(1)}°, ${c.coord[1].toFixed(1)}°</i></span>
            <span class="ed-ops">
              <button class="ed-mini" data-act="edit-city" data-trip="${t.id}" data-city="${esc(c.name)}" title="编辑城市">✎</button>
              <button class="ed-mini danger" data-act="del-city" data-trip="${t.id}" data-city="${esc(c.name)}" title="删除城市">✕</button>
            </span>
          </div>`).join('')}
      </div>`).join('') || '<p class="ed-empty">还没有旅程 — 点击上方「＋ 新增旅程」开始记录 ✦</p>';
  }

  /* ---------- 旅程表单 ---------- */
  function tripForm(trip) {
    view = 'trip';
    const isNew = !trip;
    const t = trip || { id: 't-' + Date.now().toString(36), no: Math.max(0, ...ATLAS.trips.map(x => x.no || 0)) + 1, title: '', region: '', latin: '', year: new Date().getFullYear(), dates: '', days: 1, summary: '', cover: '', cities: [] };
    body.innerHTML = `
      <div class="ed-form">
        <p class="ed-crumb"><button data-back>‹ 返回列表</button>${isNew ? '新增旅程' : `编辑 · ${esc(trip.title)}`}</p>
        <label>旅程标题 *<input id="f-title" value="${esc(t.title)}" placeholder="如：极光与峡湾"></label>
        <div class="ed-grid2">
          <label>地区 / 国家<input id="f-region" value="${esc(t.region)}" placeholder="冰岛 · 挪威"></label>
          <label>年份 *<input id="f-year" type="number" value="${t.year}"></label>
        </div>
        <label>英文副标<input id="f-latin" value="${esc(t.latin)}" placeholder="AURORA & FJORDS"></label>
        <div class="ed-grid2">
          <label>日期文本<input id="f-dates" value="${esc(t.dates)}" placeholder="2022.10.02 — 10.12"></label>
          <label>天数<input id="f-days" type="number" value="${t.days || 1}"></label>
        </div>
        <label>封面图 (URL 或 photos/xxx.jpg)<input id="f-cover" value="${esc(t.cover)}" placeholder="photos/kyoto.jpg"></label>
        <label>旅程简介<textarea id="f-summary" rows="3">${esc(t.summary)}</textarea></label>
        <div class="ed-form-ops">
          <button class="ed-btn primary" id="f-save">保存旅程</button>
          <button class="ed-btn" data-back>取消</button>
        </div>
      </div>`;
    body.querySelectorAll('[data-back]').forEach(b => b.onclick = () => renderTree());
    $('#f-save').onclick = () => {
      const title = $('#f-title').value.trim();
      const year = parseInt($('#f-year').value, 10);
      if (!title || !year) { alert('请填写旅程标题和年份'); return; }
      t.title = title;
      t.year = year;
      t.region = $('#f-region').value.trim();
      t.latin = $('#f-latin').value.trim();
      t.dates = $('#f-dates').value.trim();
      t.days = parseInt($('#f-days').value, 10) || 1;
      t.cover = $('#f-cover').value.trim();
      t.summary = $('#f-summary').value.trim();
      if (isNew) insertTrip(t);
      save();
      renderTree();
    };
  }

  function insertTrip(t) {
    const trips = ATLAS.trips;
    const i = trips.findIndex(x => x.year > t.year);
    if (i === -1) trips.push(t); else trips.splice(i, 0, t);
  }

  /* ---------- 城市表单 ---------- */
  function cityForm(trip, city) {
    view = 'city';
    const isNew = !city;
    const c = city || {
      name: '', latin: '', country: '', countryEn: '',
      continent: '亚洲', coord: [0, 0], date: '', days: 2,
      themes: [], weather: '', photo: '', note: '', story: '', highlights: []
    };
    const themes = ATLAS.themes;
    body.innerHTML = `
      <div class="ed-form">
        <p class="ed-crumb"><button data-back>‹ 返回列表</button>${isNew ? `在「${esc(trip.title)}」添加城市` : `编辑 · ${esc(city.name)}`}</p>
        <div class="ed-grid2">
          <label>城市名 *<input id="f-name" value="${esc(c.name)}" placeholder="东京"></label>
          <label>英文 / 拼音<input id="f-latin" value="${esc(c.latin)}" placeholder="TOKYO"></label>
        </div>
        <div class="ed-grid2">
          <label>国家（中文）*<input id="f-country" value="${esc(c.country)}" placeholder="日本"></label>
          <label>国家（英文，用于地图高亮）<input id="f-countryEn" list="ed-country-list" value="${esc(c.countryEn)}" placeholder="Japan">
            <datalist id="ed-country-list">${countryNames.map(n => `<option value="${esc(n)}">`).join('')}</datalist>
          </label>
        </div>
        <label>大洲
          <select id="f-continent">${CONTINENTS.map(x => `<option ${x === c.continent ? 'selected' : ''}>${x}</option>`).join('')}</select>
        </label>
        <div class="ed-grid2 coord">
          <label>纬度 *<input id="f-lat" type="number" step="0.0001" value="${c.coord[0]}"></label>
          <label>经度 *<input id="f-lng" type="number" step="0.0001" value="${c.coord[1]}"></label>
        </div>
        <button class="ed-btn wide" id="f-pick">🌍 在地球上选点（点击地球拾取坐标）</button>
        <div class="ed-grid3">
          <label>到访日期<input id="f-date" value="${esc(c.date)}" placeholder="11.08"></label>
          <label>停留天数<input id="f-days" type="number" value="${c.days || 2}"></label>
          <label>天气<input id="f-weather" value="${esc(c.weather)}" placeholder="☀️ 16°C · 晴"></label>
        </div>
        <label>旅行主题（可多选）
          <div class="ed-themes">${themes.map(t2 => `
            <label class="ed-chip ${c.themes.includes(t2) ? 'on' : ''}"><input type="checkbox" value="${t2}" ${c.themes.includes(t2) ? 'checked' : ''}>${t2}</label>`).join('')}
          </div>
        </label>
        <label>照片 (URL 或 photos/xxx.jpg)<input id="f-photo" value="${esc(c.photo)}" placeholder="photos/tokyo.jpg"></label>
        <label>旅行笔记（悬停提示卡）<textarea id="f-note" rows="3" placeholder="两三句当时的感受">${esc(c.note)}</textarea></label>
        <label>故事章节（故事页正文）<textarea id="f-story" rows="5" placeholder="这一站的故事……">${esc(c.story)}</textarea></label>
        <label>高光时刻（用逗号分隔）<input id="f-high" value="${esc((c.highlights || []).join('，'))}" placeholder="景点 A，美食 B，体验 C"></label>
        <div class="ed-form-ops">
          <button class="ed-btn primary" id="f-save">保存城市</button>
          <button class="ed-btn" data-back>取消</button>
        </div>
      </div>`;

    body.querySelectorAll('[data-back]').forEach(b => b.onclick = () => renderTree());
    body.querySelectorAll('.ed-chip input').forEach(i => i.onchange = () => i.closest('.ed-chip').classList.toggle('on', i.checked));

    /* 地球选点 */
    $('#f-pick').onclick = () => {
      startPick(ll => {           // ll = [纬度, 经度]
        $('#f-lat').value = ll[0].toFixed(4);
        $('#f-lng').value = ll[1].toFixed(4);
      });
    };

    $('#f-save').onclick = () => {
      const name = $('#f-name').value.trim();
      const country = $('#f-country').value.trim();
      const lat = parseFloat($('#f-lat').value), lng = parseFloat($('#f-lng').value);
      if (!name || !country) { alert('请填写城市名和国家'); return; }
      if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) { alert('请填写正确的纬度（-90~90）与经度（-180~180），或使用地球选点'); return; }
      if (isNew && trip.cities.some(x => x.name === name)) { alert('该旅程中已有同名城市'); return; }
      const updated = {
        name, latin: $('#f-latin').value.trim() || name,
        country, countryEn: $('#f-countryEn').value.trim() || country,
        continent: $('#f-continent').value,
        coord: [lat, lng],
        date: $('#f-date').value.trim() || '—',
        days: parseInt($('#f-days').value, 10) || 2,
        themes: [...body.querySelectorAll('.ed-chip input:checked')].map(i => i.value),
        weather: $('#f-weather').value.trim() || '—',
        photo: $('#f-photo').value.trim(),
        note: $('#f-note').value.trim(),
        story: $('#f-story').value.trim(),
        highlights: $('#f-high').value.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
      };
      if (city) Object.assign(city, updated);
      else trip.cities.push(updated);
      trip.cities.sort((a, b) => String(a.date).localeCompare(String(b.date)));
      save();
      renderTree();
    };
  }

  /* ---------- 地球选点 ---------- */
  function startPick(cb) {
    pickCb = cb;
    document.getElementById('pick-hint').hidden = false;
    document.body.classList.add('picking');
  }
  function endPick() {
    pickCb = null;
    document.getElementById('pick-hint').hidden = true;
    document.body.classList.remove('picking');
  }
  /* app.js 在地球点击时调用；返回是否已消费该事件 */
  function consumePick(ll) {
    if (!pickCb) return false;
    const cb = pickCb;
    endPick();
    if (ll) cb(ll);
    return true;
  }
  const isPicking = () => !!pickCb;

  /* ---------- 导出 ---------- */
  function download(name, text, type = 'application/json') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }
  function exportJson() {
    download('travel-archive.json', ATLAS.exportJSON());
  }
  function genDataJs() {
    const js = `/* ============================================================
   环球旅行地图 · 数据层（由档案管理器导出于 ${new Date().toLocaleString('zh-CN')}）
   ============================================================ */
window.ATLAS = (function () {
  'use strict';

  const YEAR_COLORS = ${JSON.stringify(ATLAS.yearColors)};

  const THEMES = ${JSON.stringify(ATLAS.themes)};
  const THEME_ICONS = ${JSON.stringify(ATLAS.themeIcons)};

  const trips = ${ATLAS.exportJSON()};

  /* ============ 可变数据层：派生数据 / 本地保存 / 恢复默认 ============ */
  const STORAGE_KEY = 'tg-archive-v1';
  const DEFAULT_TRIPS = trips;
  let _trips = trips, allCities = [], countries = {}, years = [];

  function rebuildDerived() {
    allCities = [];
    countries = {};
    _trips.forEach(t => t.cities.forEach(c => {
      c.trip = t;
      allCities.push(c);
      if (!countries[c.countryEn]) countries[c.countryEn] = { zh: c.country, continent: c.continent, count: 0 };
      countries[c.countryEn].count++;
    }));
    years = [...new Set(_trips.map(t => t.year))].sort((a, b) => b - a);
  }
  rebuildDerived();

  const clean = () => JSON.parse(JSON.stringify(_trips, (k, v) => k === 'trip' ? undefined : v));

  const api = {
    get trips() { return _trips; },
    get cities() { return allCities; },
    get countries() { return countries; },
    get years() { return years; },
    themes: THEMES, themeIcons: THEME_ICONS, yearColors: YEAR_COLORS,
    STORAGE_KEY,
    distance(a, b) {
      const R = 6371;
      const [la1, lo1] = a.coord, [la2, lo2] = b.coord;
      const rad = Math.PI / 180;
      const dLat = (la2 - la1) * rad, dLon = (lo2 - lo1) * rad;
      const s = Math.sin(dLat / 2) ** 2 + Math.cos(la1 * rad) * Math.cos(la2 * rad) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(s));
    },
    replaceTrips(next) { _trips = next; rebuildDerived(); },
    rebuildDerived,
    persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(clean())); } catch (_) {} },
    hasSaved() { try { return !!localStorage.getItem(STORAGE_KEY); } catch (_) { return false; } },
    loadSaved() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const next = JSON.parse(raw);
        if (!Array.isArray(next) || !next.length) return false;
        _trips = next; rebuildDerived(); return true;
      } catch (_) { return false; }
    },
    clearSaved() { try { localStorage.removeItem(STORAGE_KEY); } catch (_) {} },
    resetToDefault() {
      this.clearSaved();
      _trips = JSON.parse(JSON.stringify(DEFAULT_TRIPS));
      rebuildDerived();
    },
    exportJSON() { return JSON.stringify(clean(), null, 2); }
  };

  return api;
})();
`;
    download('data.js', js, 'text/javascript');
  }
  function resetDefault() {
    if (!confirm('恢复为内置示例数据？你在本浏览器保存的修改将被清除。')) return;
    ATLAS.resetToDefault();
    onChange();
    renderTree();
    flashSaved();
  }

  return { init, open, close, consumePick, isPicking, renderTree, endPick };
})();
