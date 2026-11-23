# 环球旅行地图 · 私人旅行档案

一座可旋转的 **3D 旅行地球**：记录去过的国家与城市，航线按时间顺序动态连线，
悬停地点可看照片、日期、天气与旅行笔记；点击航线进入沉浸式旅行故事页。
整体是一份「午夜航海档案」风格的私人旅行档案，适配桌面与手机。

**在线访问：https://sumomo0222.github.io/travel-globe/**

## 功能

- 🌍 3D 地球（d3-geo 正交投影 + Canvas）：拖拽旋转 / 滚轮缩放 / 双指捏合 / 闲置自动自转 / 惯性
- ✈️ 大圆航线按旅程与时间顺序连线，按年份配色，彗星掠过动画，逐段点亮
- 🖱 悬停城市 → 照片 / 日期 / 天气 / 旅行笔记提示卡；点击城市 → 飞行定位并在时间轴同步高亮
- 🧭 点击国家 → 已到访国家回执（城市列表可跳转）；未到访国家显示「留给未来的出发」
- 📊 顶部统计：去过的国家数 / 城市数 / 总里程（随筛选实时重算）
- 🗂 时间轴侧栏与地图双向联动；移动端收为底部抽屉（把手拖拽 / 按钮开合）
- 🔎 按年份 / 大洲 / 旅行主题多选筛选
- 📖 点击航线或旅程标题 → 沉浸式故事页（档案编号、Hero 大图、章节交错排版、上一程/下一程，`#/story/<id>` 路由可直达）

## 本地运行

页面需通过 HTTP 访问（地图数据用 fetch 加载）：

```bash
cd travel-globe
python3 -m http.server 4180
# 打开 http://localhost:4180
```

## 换成你自己的旅行数据

只需编辑 **`js/data.js`**，字段结构一目了然：

```js
{
  id: 'jp-2019', no: 1,                  // 旅程 id 与档案编号
  title: '红叶与温泉', region: '日本本州',
  latin: 'MOMIJI & ONSEN, JAPAN',        // 故事页英文副标
  year: 2019, dates: '2019.11.08 — 11.18', days: 11,
  summary: '……', cover: 'photos/kyoto.jpg',
  cities: [{
    name: '东京', latin: 'TOKYO',
    country: '日本', countryEn: 'Japan', // countryEn 与世界地图命名一致，用于国家高亮
    continent: '亚洲',
    coord: [35.6762, 139.6503],          // 纬度, 经度
    date: '11.08', days: 4,
    themes: ['城市漫游', '美食之旅'],
    weather: '☀️ 16°C · 晴',
    photo: 'photos/tokyo.jpg',
    note: '……',                          // 悬停提示卡短笔记
    story: '……',                         // 故事页章节正文
    highlights: ['新宿霓虹初体验', '深夜拉面店']
  }]
}
```

- 年份配色在 `YEAR_COLORS` 里调整；主题在 `THEMES` / `THEME_ICONS` 里增删（自动生成筛选 chips）
- 照片放进 `photos/` 即可（本地 37 张示例照片来自公开网络检索，仅作占位——建议替换为你自己的照片）

## 部署

纯静态站点，任意静态托管皆可：

- **GitHub Pages**（本项目用法）：
  ```bash
  gh repo create travel-globe --public --source=. --push
  gh api -X POST repos/<user>/travel-globe/pages -f "source[branch]=main" -f "source[path]=/"
  ```
- **Vercel / Netlify**：导入仓库或直接拖拽目录，零配置。

## 技术栈

无框架、无构建：原生 HTML/CSS/JS + [d3](https://d3js.org)（正交投影/大圆插值）+
[topojson-client](https://github.com/topojson/topojson-client) + Natural Earth 110m 世界地图数据。
三者为本地文件（`vendor/`、`data/`），离线也可运行；仅标题字体走 Google Fonts（离线自动回退系统衬线）。

## 目录

```
index.html          页面骨架
css/style.css       午夜航海档案视觉体系
js/data.js          旅行数据层（12 段旅程 / 37 城 / 20 国）
js/globe.js         3D 地球引擎（旋转/缩放/拾取/航线动画）
js/app.js           筛选/统计/时间轴/联动/移动端抽屉
js/story.js         沉浸式故事页
vendor/ data/       本地依赖与地图数据
photos/             城市照片
fetch_photos.sh     照片批量下载脚本（可重跑）
```
