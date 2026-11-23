/* ============================================================
   环球旅行地图 · 3D 地球引擎
   d3-geo 正交投影 + Canvas 2D
   拖拽旋转 / 滚轮缩放 / 双指捏合 / 惯性 / 自动自转
   大圆航线动画（按年份配色 + 彗星掠过 + 逐段点亮）
   城市标记 / 去过国家高亮 / 点击拾取（城市·航线·国家）
   ============================================================ */
window.Globe = (function () {
  'use strict';

  const TAU = Math.PI * 2;
  const DEG = Math.PI / 180;
  /* 数据层存 [纬度, 经度]；d3 全系 API 需要 [经度, 纬度]，此处统一转换 */
  const llOf = c => [c.coord[1], c.coord[0]];

  class Globe {
    constructor(canvas, cb = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.cb = cb;
      this.projection = d3.geoOrthographic().clipAngle(90).precision(0.3);
      this.path = d3.geoPath(this.projection, this.ctx);
      this.graticule = d3.geoGraticule10();
      this.rotation = [-105, -28];   // 初始视角：亚欧
      this.scale = 0;
      this.baseScale = 0;
      this.minScale = 0;
      this.maxScale = 0;
      this.trips = [];
      this.arcs = [];
      this.markers = [];
      this.visited = new Map();      // countryEn -> {zh, continent, cities[]}
      this.hoverCity = null;
      this.activeCity = null;
      this.hoverArc = null;
      this.dragging = false;
      this.spin = 0;                 // 惯性
      this.autoRotate = true;
      this.lastInteract = 0;
      this.flyAnim = null;
      this.pointers = new Map();
      this.pinDist = 0;
      this.world = null;
      this._raf = null;
      this._time = 0;

      this._bind();
      this._resize();
      new ResizeObserver(() => this._resize()).observe(canvas.parentElement || canvas);
      this._loop = this._loop.bind(this);
      requestAnimationFrame(this._loop);
    }

    /* ---------- 初始化：加载世界地图 ---------- */
    async init(worldUrl) {
      const res = await fetch(worldUrl);
      if (!res.ok) throw new Error('world data ' + res.status);
      const topo = await res.json();
      this.world = topo;
      this.land = topojson.feature(topo, topo.objects.countries).features;
      this.borders = topojson.mesh(topo, topo.objects.countries, (a, b) => a !== b);
      return this;
    }

    /* ---------- 数据 ---------- */
    setTrips(trips) {
      this.trips = trips;
      const now = performance.now();
      this.arcs = [];
      trips.forEach((t, ti) => {
        const cs = t.cities;
        for (let i = 0; i < cs.length - 1; i++) {
          const interp = d3.geoInterpolate(llOf(cs[i]), llOf(cs[i + 1]));
          const N = 64;
          this.arcs.push({
            trip: t, from: cs[i], to: cs[i + 1],
            coords: d3.range(N + 1).map(k => interp(k / N)),
            color: ATLAS.yearColors[t.year] || '#F2C063',
            t0: now + ti * 130 + i * 170,
            pts: []
          });
        }
      });
      this.markers = trips.flatMap(t => t.cities);
      this.visited = new Map();
      trips.forEach(t => t.cities.forEach(c => {
        const v = this.visited.get(c.countryEn) || { zh: c.country, continent: c.continent, cities: [] };
        v.cities.push(c);
        this.visited.set(c.countryEn, v);
      }));
      if (this.activeCity && !this.markers.includes(this.activeCity)) this.activeCity = null;
    }

    setActive(city) { this.activeCity = city || null; }
    setAutoRotate(v) { this.autoRotate = v; }

    /* ---------- 视角控制 ---------- */
    flyToCoord(coord, targetScale) {
      const t0 = performance.now();
      const from = [...this.rotation];
      const to = [-coord[1], -coord[0]];
      // 经度走最短路径
      let dl = (to[0] - from[0]) % 360;
      if (dl > 180) dl -= 360; if (dl < -180) dl += 360;
      const toR = [from[0] + dl, to[1]];
      const s0 = this.scale, s1 = targetScale || Math.max(this.scale, this.baseScale * 1.55);
      this.flyAnim = { t0, dur: 1100, from, to: toR, s0, s1 };
      this.spin = 0;
    }
    flyToCity(city) { this.flyToCoord(city.coord); }
    resetView() { this.flyToCoord([28, 105], this.baseScale); }  // [纬度, 经度] → 居中 (105°E, 28°N)

    /* ---------- 交互 ---------- */
    _bind() {
      const el = this.canvas;
      el.style.touchAction = 'none';
      el.addEventListener('pointerdown', e => {
        try { el.setPointerCapture(e.pointerId); } catch (_) {}
        this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        this.dragging = true;
        this.spin = 0;
        this.flyAnim = null;
        this.lastInteract = performance.now();
        if (this.pointers.size === 2) {
          const [a, b] = [...this.pointers.values()];
          this.pinDist = Math.hypot(a.x - b.x, a.y - b.y);
        }
      });
      el.addEventListener('pointermove', e => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        this._mx = x; this._my = y;
        if (this.pointers.has(e.pointerId)) {
          const p = this.pointers.get(e.pointerId);
          const dx = e.clientX - p.x, dy = e.clientY - p.y;
          p.x = e.clientX; p.y = e.clientY;
          this.lastInteract = performance.now();
          if (this.pointers.size === 2) {
            const [a, b] = [...this.pointers.values()];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (this.pinDist > 0) this._zoom(Math.pow(d / this.pinDist, 1.4));
            this.pinDist = d;
          } else if (this.dragging) {
            const k = 0.24 * (this.baseScale / this.scale);
            this.rotation[0] += dx * k;
            this.rotation[1] = Math.max(-89, Math.min(89, this.rotation[1] - dy * k));
            this.spin = Math.max(-6, Math.min(6, dx * k * 0.55));
          }
        } else {
          // 悬停拾取
          const hit = this._pick(x, y);
          this.hoverCity = hit && hit.type === 'city' ? hit.city : null;
          this.hoverArc = hit && hit.type === 'arc' ? hit.arc : null;
          el.style.cursor = hit ? 'pointer' : (this._overLand(x, y) ? 'grab' : 'default');
          if (this.cb.onHoverCity) this.cb.onHoverCity(this.hoverCity, x, y);
        }
      });
      const up = e => {
        if (this.pointers.has(e.pointerId)) {
          const p = this.pointers.get(e.pointerId);
          const moved = Math.hypot(e.clientX - p.x, e.clientY - p.y);
          this.pointers.delete(e.pointerId);
          if (this.pointers.size === 0) {
            this.dragging = false;
            this.lastInteract = performance.now();
            if (moved < 5 && e.type === 'pointerup') this._click(e);
          }
        }
      };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('pointerleave', () => {
        if (this.hoverCity && this.cb.onHoverCity) this.cb.onHoverCity(null, 0, 0);
        this.hoverCity = null; this.hoverArc = null;
      });
      el.addEventListener('wheel', e => {
        e.preventDefault();
        this.lastInteract = performance.now();
        this.flyAnim = null;
        this._zoom(Math.exp(-e.deltaY * 0.0011));
      }, { passive: false });
      el.addEventListener('dblclick', e => { e.preventDefault(); this._zoom(1.6); });
    }

    _zoom(f) {
      this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * f));
    }

    _click(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const ll = this.projection.invert([x, y]);
      // 通用点击回调（编辑器「地图选点」用）
      if (this.cb.onPoint) this.cb.onPoint(ll && isFinite(ll[0]) ? ll : null, { x, y });
      const hit = this._pick(x, y);
      if (hit && hit.type === 'city') { this.cb.onSelectCity && this.cb.onSelectCity(hit.city); return; }
      if (hit && hit.type === 'arc') { this.cb.onSelectArc && this.cb.onSelectArc(hit.arc.trip); return; }
      // 国家拾取
      if (!ll || !isFinite(ll[0]) || !this.world) { this.cb.onCountry && this.cb.onCountry(null); return; }
      const f = this.land.find(ft => d3.geoContains(ft, ll));
      if (!f) { this.cb.onCountry && this.cb.onCountry(null); return; }
      const en = f.properties.name;
      const v = this.visited.get(en);
      this.cb.onCountry && this.cb.onCountry({
        nameEn: en, visited: !!v,
        zh: v ? v.zh : null, continent: v ? v.continent : null, cities: v ? v.cities : []
      });
    }

    _pick(x, y) {
      // 城市
      let best = null, bd = 15;
      for (const c of this.markers) {
        if (!c._visible || !c._xy) continue;
        const d = Math.hypot(c._xy[0] - x, c._xy[1] - y);
        if (d < bd) { bd = d; best = { type: 'city', city: c }; }
      }
      if (best) return best;
      // 航线（对折线段做距离检测）
      let ba = null, bad = 7;
      for (const a of this.arcs) {
        if (!a.pts.length) continue;
        for (let i = 0; i < a.pts.length - 1; i++) {
          const d = _distSeg(a.pts[i], a.pts[i + 1], x, y);
          if (d < bad) { bad = d; ba = a; }
        }
      }
      if (ba) return { type: 'arc', arc: ba };
      return null;
    }

    _overLand(x, y) {
      if (!this.world) return false;
      const ll = this.projection.invert([x, y]);
      if (!ll) return false;
      return this.land.some(ft => d3.geoContains(ft, ll));
    }

    /* ---------- 画布尺寸 ---------- */
    _resize() {
      const parent = this.canvas.parentElement;
      const w = parent ? parent.clientWidth : 800;
      const h = parent ? parent.clientHeight : 600;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.max(1, w * dpr);
      this.canvas.height = Math.max(1, h * dpr);
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.w = w; this.h = h;
      this.baseScale = Math.min(w, h) * 0.46;
      if (!this.scale) this.scale = this.baseScale * 1.02;
      else this.scale = Math.max(this.scale, this.baseScale * 0.8);
      this.minScale = this.baseScale * 0.72;
      this.maxScale = this.baseScale * 5.5;
      this.projection.translate([w / 2, h / 2]);
      this._makeStars();
    }

    _makeStars() {
      const c = document.createElement('canvas');
      c.width = this.w; c.height = this.h;
      const x = c.getContext('2d');
      const n = Math.round(this.w * this.h / 5200);
      this._tw = [];
      for (let i = 0; i < n; i++) {
        const sx = Math.random() * this.w, sy = Math.random() * this.h;
        const r = Math.random() * 1.1 + 0.2, al = Math.random() * 0.55 + 0.08;
        x.beginPath(); x.arc(sx, sy, r, 0, TAU);
        x.fillStyle = `rgba(210,225,255,${al})`; x.fill();
        if (i % 9 === 0) this._tw.push({ x: sx, y: sy, r: r + 0.3, ph: Math.random() * TAU });
      }
      this._stars = c;
    }

    /* ---------- 渲染主循环 ---------- */
    _loop(now) {
      this._raf = requestAnimationFrame(this._loop);
      this._time = now;
      const dt = Math.min(50, now - (this._pt || now)); this._pt = now;

      // 惯性
      if (!this.dragging && Math.abs(this.spin) > 0.01) {
        this.rotation[0] += this.spin;
        this.spin *= Math.pow(0.936, dt / 16.7);
      }
      // 自动自转
      if (this.autoRotate && !this.dragging && !this.flyAnim &&
          Math.abs(this.spin) < 0.05 && now - this.lastInteract > 3600) {
        this.rotation[0] -= 0.0018 * dt;
      }
      // 飞行动画
      if (this.flyAnim) {
        const a = this.flyAnim;
        let t = (now - a.t0) / a.dur;
        if (t >= 1) { t = 1; this.flyAnim = null; }
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        this.rotation[0] = a.from[0] + (a.to[0] - a.from[0]) * e;
        this.rotation[1] = a.from[1] + (a.to[1] - a.from[1]) * e;
        this.scale = a.s0 + (a.s1 - a.s0) * e;
      }
      this._draw(now);
    }

    _draw(now) {
      const { ctx, w, h } = this;
      const r = this.scale;
      const cx = w / 2, cy = h / 2;
      this.projection.rotate(this.rotation).scale(r);
      const center = [-this.rotation[0], -this.rotation[1]];

      ctx.clearRect(0, 0, w, h);
      // 星空
      if (this._stars) ctx.drawImage(this._stars, 0, 0, w, h);
      for (const s of (this._tw || [])) {
        const al = 0.25 + 0.35 * Math.abs(Math.sin(now / 900 + s.ph));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU);
        ctx.fillStyle = `rgba(220,235,255,${al})`; ctx.fill();
      }

      // 大气层辉光
      let g = ctx.createRadialGradient(cx, cy, r * 0.96, cx, cy, r * 1.24);
      g.addColorStop(0, 'rgba(96,150,255,0.22)');
      g.addColorStop(0.45, 'rgba(80,120,230,0.07)');
      g.addColorStop(1, 'rgba(70,110,220,0)');
      ctx.beginPath(); ctx.arc(cx, cy, r * 1.24, 0, TAU);
      ctx.fillStyle = g; ctx.fill();

      // 海洋
      g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.32, r * 0.1, cx, cy, r * 1.02);
      g.addColorStop(0, '#182C55');
      g.addColorStop(0.62, '#0E1B3A');
      g.addColorStop(1, '#060B1D');
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU);
      ctx.fillStyle = g; ctx.fill();

      // 经纬网
      ctx.beginPath(); this.path(this.graticule);
      ctx.strokeStyle = 'rgba(160,185,235,0.06)'; ctx.lineWidth = 0.5; ctx.stroke();

      // 陆地（未到访）
      ctx.beginPath();
      for (const f of this.land) {
        if (this.visited.has(f.properties.name)) continue;
        this.path(f);
      }
      ctx.fillStyle = '#1D2C52';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140,170,225,0.22)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // 去过的国家（金色高亮）
      if (this.visited.size) {
        ctx.beginPath();
        for (const f of this.land) if (this.visited.has(f.properties.name)) this.path(f);
        ctx.fillStyle = 'rgba(242,192,99,0.33)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(246,205,124,0.85)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // 国界
      ctx.beginPath(); this.path(this.borders);
      ctx.strokeStyle = 'rgba(150,180,235,0.16)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // 球体边缘
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU);
      ctx.strokeStyle = 'rgba(150,185,255,0.28)';
      ctx.lineWidth = 1;
      ctx.stroke();

      this._drawArcs(now);
      this._drawMarkers(now);
    }

    _drawArcs(now) {
      const { ctx } = this;
      for (const arc of this.arcs) {
        const prog = Math.min(1, Math.max(0, (now - arc.t0) / 620));
        if (prog <= 0) continue;
        const e = 1 - Math.pow(1 - prog, 3);
        const n = Math.max(2, Math.round(arc.coords.length * e));
        const coords = arc.coords.slice(0, n);
        const geo = { type: 'LineString', coordinates: coords };

        // 记录屏幕折线用于拾取
        arc.pts = coords.map(p => this.projection(p)).filter(p => p && isFinite(p[0]));

        // 底层柔光
        ctx.beginPath(); this.path(geo);
        ctx.strokeStyle = _alpha(arc.color, 0.16);
        ctx.lineWidth = 4; ctx.stroke();

        // 主虚线（流动）
        ctx.beginPath(); this.path(geo);
        ctx.strokeStyle = arc.hovered === true || this.hoverArc === arc ? _mix(arc.color, '#ffffff', 0.4) : _alpha(arc.color, 0.92);
        ctx.lineWidth = this.hoverArc === arc ? 2.2 : 1.5;
        ctx.setLineDash([2.5, 6.5]);
        ctx.lineDashOffset = -(now / 46) % 9;
        ctx.stroke();
        ctx.setLineDash([]);

        // 彗星
        if (prog >= 1) {
          const ph = ((now / 10500) + arc.coords.length * 0.137) % 1;
          const p = arc.coords[Math.floor(ph * (arc.coords.length - 1))];
          const front = d3.geoDistance(p, [-this.rotation[0], -this.rotation[1]]) < Math.PI / 2;
          const xy = this.projection(p);
          if (front && xy && isFinite(xy[0])) {
            const gl = ctx.createRadialGradient(xy[0], xy[1], 0, xy[0], xy[1], 9);
            gl.addColorStop(0, _alpha(arc.color, 0.9));
            gl.addColorStop(1, _alpha(arc.color, 0));
            ctx.beginPath(); ctx.arc(xy[0], xy[1], 9, 0, TAU);
            ctx.fillStyle = gl; ctx.fill();
            ctx.beginPath(); ctx.arc(xy[0], xy[1], 2.4, 0, TAU);
            ctx.fillStyle = '#FFF7E6'; ctx.fill();
          }
        }
      }
    }

    _drawMarkers(now) {
      const { ctx } = this;
      const center = [-this.rotation[0], -this.rotation[1]];
      const list = [...this.markers];
      // 活跃/悬停城市最后绘制
      list.sort((a, b) => (a === this.activeCity || a === this.hoverCity ? 1 : 0) - (b === this.activeCity || b === this.hoverCity ? 1 : 0));

      for (const c of list) {
        const ll = llOf(c);
        const front = d3.geoDistance(ll, center) < Math.PI / 2 - 0.01;
        c._visible = front;
        const xy = this.projection(ll);
        if (!front || !xy || !isFinite(xy[0])) { c._xy = null; continue; }
        c._xy = xy;
        const col = ATLAS.yearColors[c.trip.year] || '#F2C063';
        const isActive = c === this.activeCity, isHover = c === this.hoverCity;

        // 脉冲圈
        const ph = (((now / 1700) + c.coord[0] * 0.05) % 1 + 1) % 1;
        ctx.beginPath(); ctx.arc(xy[0], xy[1], 4 + ph * 15, 0, TAU);
        ctx.strokeStyle = _alpha(col, 0.5 * (1 - ph));
        ctx.lineWidth = 1.2; ctx.stroke();

        // 光晕
        const gl = ctx.createRadialGradient(xy[0], xy[1], 0, xy[0], xy[1], 13);
        gl.addColorStop(0, _alpha(col, 0.75));
        gl.addColorStop(1, _alpha(col, 0));
        ctx.beginPath(); ctx.arc(xy[0], xy[1], 13, 0, TAU);
        ctx.fillStyle = gl; ctx.fill();

        // 核心
        ctx.beginPath(); ctx.arc(xy[0], xy[1], isActive || isHover ? 4.6 : 3.1, 0, TAU);
        ctx.fillStyle = '#FFF6E0'; ctx.fill();
        ctx.beginPath(); ctx.arc(xy[0], xy[1], isActive || isHover ? 6.4 : 4.6, 0, TAU);
        ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.stroke();

        if (isActive || isHover) {
          ctx.beginPath(); ctx.arc(xy[0], xy[1], 12 + Math.sin(now / 320) * 1.4, 0, TAU);
          ctx.strokeStyle = _alpha('#FFFFFF', 0.75);
          ctx.lineWidth = 1; ctx.stroke();
          // 标签
          const label = `${c.name} · ${c.country}`;
          ctx.font = '11px "IBM Plex Mono","PingFang SC",monospace';
          const tw = ctx.measureText(label).width;
          const lx = Math.min(Math.max(xy[0] - tw / 2, 8), this.w - tw - 8);
          const ly = xy[1] - 18 < 24 ? xy[1] + 26 : xy[1] - 18;
          ctx.fillStyle = 'rgba(7,11,24,0.82)';
          _roundRect(ctx, lx - 6, ly - 11, tw + 12, 18, 4); ctx.fill();
          ctx.strokeStyle = _alpha(col, 0.5); ctx.lineWidth = 1;
          _roundRect(ctx, lx - 6, ly - 11, tw + 12, 18, 4); ctx.stroke();
          ctx.fillStyle = '#F5EFE2';
          ctx.fillText(label, lx, ly + 2);
        }
      }
    }
  }

  /* ---------- 工具 ---------- */
  function _distSeg(a, b, px, py) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const l2 = dx * dx + dy * dy;
    let t = l2 ? ((px - a[0]) * dx + (py - a[1]) * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(a[0] + t * dx - px, a[1] + t * dy - py);
  }
  function _alpha(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
  }
  function _mix(h1, h2, t) {
    const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
    const r = Math.round(((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t);
    const g = Math.round(((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t);
    const bl = Math.round((a & 255) * (1 - t) + (b & 255) * t);
    return `#${(r << 16 | g << 8 | bl).toString(16).padStart(6, '0')}`;
  }
  function _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  return Globe;
})();
