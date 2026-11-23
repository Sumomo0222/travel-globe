/* ============================================================
   环球旅行地图 · 沉浸式故事页
   #/story/<trip-id> 路由 · Hero 大图 · 章节交错排版
   滚动进度条 · 章节渐显 · 上一程 / 下一程
   ============================================================ */
window.Story = (function () {
  'use strict';

  const ATLAS = window.ATLAS;
  const root = document.getElementById('story');
  const scroll = document.getElementById('story-scroll');
  const bar = document.getElementById('story-bar');
  const crumbs = document.getElementById('story-crumbs');
  let current = null;
  let observer = null;

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function open(tripId, push = true) {
    const trip = ATLAS.trips.find(t => t.id === tripId);
    if (!trip) return false;
    current = trip;
    render(trip);
    root.hidden = false;
    document.body.style.overflow = 'hidden';
    scroll.scrollTop = 0;
    if (push) history.pushState({ story: tripId }, '', `#/story/${tripId}`);
    crumbs.textContent = `ARCHIVE NO.${String(trip.no).padStart(2, '0')} / ${ATLAS.trips.length}`;
    return true;
  }

  function close() {
    if (root.hidden) return;
    root.hidden = true;
    document.body.style.overflow = '';
    current = null;
    if (observer) observer.disconnect();
    if (location.hash.startsWith('#/story/')) history.pushState('', '', location.pathname + location.search);
  }

  function fromHash() {
    const m = location.hash.match(/^#\/story\/([\w-]+)/);
    return m ? open(m[1], false) : false;
  }

  function render(trip) {
    const color = ATLAS.yearColors[trip.year] || '#E9B44C';
    const countries = [...new Set(trip.cities.map(c => c.country))];
    const km = Math.round(trip.cities.slice(1).reduce((s, c, i) => s + ATLAS.distance(trip.cities[i], c), 0));

    const chapters = trip.cities.map((c, i) => `
      <section class="s-chapter" style="--ch-color:${color}">
        <div class="s-ch-copy">
          <p class="s-ch-no">CHAPTER ${String(i + 1).padStart(2, '0')} · 第${['一', '二', '三', '四'][i] || i + 1}站</p>
          <h3 class="s-ch-name">${esc(c.name)}</h3>
          <span class="s-ch-latin">${esc(c.latin)} · ${esc(c.country)}</span>
          <div class="s-ch-meta">
            <span>🗓 ${trip.year}.${esc(c.date)} · 停留 ${c.days} 天</span>
            <span>${esc(c.weather)}</span>
          </div>
          <p class="s-ch-text">${esc(c.story)}</p>
          <ul class="s-ch-high">${c.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
        </div>
        <figure class="s-ch-photo" data-cap="${esc(c.latin)} · ${trip.year}.${esc(c.date)}">
          <img src="${c.photo}" alt="${esc(c.name)}" loading="lazy">
        </figure>
      </section>`).join('');

    const idx = ATLAS.trips.indexOf(trip);
    const prev = ATLAS.trips[idx - 1], next = ATLAS.trips[idx + 1];

    scroll.innerHTML = `
      <header class="s-hero">
        <div class="s-hero-bg" style="background-image:url('${trip.cover}')"></div>
        <p class="s-no">旅程档案 · JOURNEY NO.${String(trip.no).padStart(2, '0')}</p>
        <h2>${esc(trip.title)}<span style="color:${color}">.</span></h2>
        <p class="s-latin">${esc(trip.latin)} — ${esc(trip.region)}</p>
        <p class="s-summary">${esc(trip.summary)}</p>
        <div class="s-stats">
          <div><b>${trip.year}</b><span>年份 YEAR</span></div>
          <div><b>${countries.length}</b><span>国家 COUNTRIES</span></div>
          <div><b>${trip.cities.length}</b><span>城市 CITIES</span></div>
          <div><b>${km.toLocaleString()}</b><span>里程 KM</span></div>
          <div><b>${trip.days}</b><span>天数 DAYS</span></div>
        </div>
      </header>
      <div class="s-chapters">${chapters}</div>
      <nav class="s-end">
        <button id="s-prev" ${prev ? '' : 'disabled'}>← ${prev ? `${prev.year} ${prev.title}` : '已是最早一程'}</button>
        <button id="s-home">回到地球地图</button>
        <button id="s-next" class="s-next" ${next ? '' : 'disabled'}><b>NEXT JOURNEY</b>${next ? `${next.year} ${next.title} →` : '已是最新一程'}</button>
      </nav>`;

    // 章节渐显
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('reveal'); observer.unobserve(e.target); } });
    }, { threshold: 0.12 });
    scroll.querySelectorAll('.s-chapter').forEach(el => observer.observe(el));

    document.getElementById('s-prev').onclick = () => prev && open(prev.id);
    document.getElementById('s-next').onclick = () => next && open(next.id);
    document.getElementById('s-home').onclick = close;
  }

  /* 进度条 + Esc */
  scroll.addEventListener('scroll', () => {
    const max = scroll.scrollHeight - scroll.clientHeight;
    bar.style.width = (max > 0 ? scroll.scrollTop / max * 100 : 0) + '%';
  }, { passive: true });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !root.hidden) close();
  });

  window.addEventListener('popstate', () => {
    const m = location.hash.match(/^#\/story\/([\w-]+)/);
    if (m) open(m[1], false);
    else close();
  });

  return { open, close, fromHash };
})();
