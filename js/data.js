/* ============================================================
   环球旅行地图 · 数据层
   12 段旅程 · 37 座城市 · 20 个国家 · 2019—2026
   —— 替换成你自己的旅行数据，只需照抄下面的字段结构 ——
   ============================================================ */
window.ATLAS = (function () {
  'use strict';

  /* 年份 → 航线颜色（午夜航海档案配色） */
  const YEAR_COLORS = {
    2019: '#F2C063',
    2021: '#F08A5D',
    2022: '#E7626F',
    2023: '#C86BA8',
    2024: '#7D8CFF',
    2025: '#4FA8E8',
    2026: '#45C4A0'
  };

  /* 主题体系（筛选 chips 与图标） */
  const THEMES = ['城市漫游', '自然风光', '人文古迹', '美食之旅', '海岛与海', '探险徒步'];
  const THEME_ICONS = {
    '城市漫游': 'M3 21h18M5.5 21V9.5l5-2.6V21M10.5 21V4.6l6.5 2.8V21',
    '自然风光': 'M2.5 20h19M4 20l6.6-13.6L15 14l2.6-4.4L21 20',
    '人文古迹': 'M4 6.4c2.2.9 4.6 1.3 8 1.3s5.8-.4 8-1.3M6.2 6.6V20M17.8 6.6V20M4.5 11.5h15',
    '美食之旅': 'M4 12.5h16a8 8 0 0 1-16 0zM4.5 16.5h15M9.5 8.5c0-1.6 1-1.6 1-3.2M13.5 8.5c0-1.6 1-1.6 1-3.2',
    '海岛与海': 'M2 9c2.2-2.6 4.8-2.6 7 0s4.8 2.6 7 0 3.3-1.8 6 .4M2 15c2.2-2.6 4.8-2.6 7 0s4.8 2.6 7 0 3.3-1.8 6 .4',
    '探险徒步': 'M4 20l4-8 4 4 4-9 4 13M9 12l3-3 3 3'
  };

  const trips = [
    {
      id: 'jp-2019', no: 1,
      title: '红叶与温泉', region: '日本本州',
      latin: 'MOMIJI & ONSEN, JAPAN',
      year: 2019, dates: '2019.11.08 — 11.18', days: 11,
      summary: '第一次真正意义上的独自远行。追着枫叶前线从东京一路向西，在京都的古寺里学会放慢脚步，最后在大阪的烟火气里收尾。旅程不长，却让「出发」从此变成习惯。',
      cover: 'photos/kyoto.jpg',
      cities: [
        {
          name: '东京', latin: 'TOKYO', country: '日本', countryEn: 'Japan', continent: '亚洲',
          coord: [35.6762, 139.6503], date: '11.08', days: 4,
          themes: ['城市漫游', '美食之旅'],
          weather: '☀️ 16°C · 晴',
          photo: 'photos/tokyo.jpg',
          note: '深夜的新宿像一台不肯熄灯的机器。我在面馆里吃了一碗热腾腾的拉面，看着窗外人流，忽然觉得独自旅行也没有那么可怕。',
          story: '落地那晚东京下过一场小雨。我揣着地图从新宿站硬着头皮往外走，出口找错三次，却在第四次拐进了一条挂满红灯笼的小巷。拉面店的老板只会三个英文单词，我们靠比划聊了一小时。这座城市用一种奇妙的节奏告诉我：迷路也是行程的一部分。',
          highlights: ['新宿霓虹初体验', '深夜拉面店', '涩谷十字路口']
        },
        {
          name: '京都', latin: 'KYOTO', country: '日本', countryEn: 'Japan', continent: '亚洲',
          coord: [35.0116, 135.7681], date: '11.12', days: 3,
          themes: ['人文古迹'],
          weather: '⛅ 13°C · 多云',
          photo: 'photos/kyoto.jpg',
          note: '清水寺的枫叶红得刚刚好。清晨六点的石阶上只有扫地僧人和我，钟声响起的那一刻，整座城市好像还没醒。',
          story: '从东京到京都，列车窗外的稻田慢慢换成了山影。我把清晨留给了清水寺，把午后留给了哲学之道，把夜晚留给了鸭川边的长椅。枫叶落在肩上的时候，我第一次理解了「惜别」这个词——原来红叶最动人的不是颜色，而是它落下来的速度。',
          highlights: ['清水寺晨钟', '哲学之道落枫', '鸭川夜景']
        },
        {
          name: '大阪', latin: 'OSAKA', country: '日本', countryEn: 'Japan', continent: '亚洲',
          coord: [34.6937, 135.5023], date: '11.15', days: 4,
          themes: ['美食之旅'],
          weather: '☀️ 15°C · 晴',
          photo: 'photos/osaka.jpg',
          note: '道顿堀的章鱼烧排了四十分钟，值得。大阪人的热情和关西腔让人完全不觉得自己是外人，这四天几乎是用胃在记录城市。',
          story: '如果说京都是一部需要静心阅读的散文集，大阪就是一锅热气腾腾的关东煮。道顿堀的巨型螃蟹招牌下，我吃了章鱼烧、串炸、大阪烧，胃被塞到极限仍然停不下来。最后一晚在河边看霓虹倒影，给这趟旅程画上了一个饱嗝连连的句号。',
          highlights: ['道顿堀章鱼烧', '黑门市场早市', '心斋桥扫街']
        }
      ]
    },
    {
      id: 'yunnan-2021', no: 2,
      title: '云之南 · 盛夏高原', region: '中国云南',
      latin: 'SUMMER IN YUNNAN, CHINA',
      year: 2021, dates: '2021.07.16 — 07.25', days: 10,
      summary: '被闷在家的第二年夏天，决定去高原上透气。从成都的市井烟火出发，一路爬升到苍山洱海，最后在丽江古城的屋檐下躲雨。离天空很近的十天。',
      cover: 'photos/dali.jpg',
      cities: [
        {
          name: '成都', latin: 'CHENGDU', country: '中国', countryEn: 'China', continent: '亚洲',
          coord: [30.5728, 104.0668], date: '07.16', days: 3,
          themes: ['美食之旅'],
          weather: '🌦 24°C · 阵雨',
          photo: 'photos/chengdu.jpg',
          note: '雨天的茶馆最热闹。盖碗茶十块钱续一天，老人们打牌、掏耳朵，我在旁边坐着看了一下午，什么景点都没去，却觉得值回票价。',
          story: '成都把「慢」过成了一门手艺。人民公园的鹤鸣茶社里，掺茶师傅的长嘴铜壶划出一道弧线，滚水稳稳落进盖碗。我学着本地人的样子翘着腿喝茶，雨点敲在竹椅上。晚上钻进一条苍蝇馆子扎堆的小巷，兔头和冒菜轮番上阵——原来巴适的意思，是时间在这里愿意等你。',
          highlights: ['鹤鸣茶社', '苍蝇馆子冒菜', '雨中宽窄巷子']
        },
        {
          name: '大理', latin: 'DALI', country: '中国', countryEn: 'China', continent: '亚洲',
          coord: [25.6065, 100.2676], date: '07.19', days: 2,
          themes: ['自然风光'],
          weather: '☀️ 22°C · 晴',
          photo: 'photos/dali.jpg',
          note: '租了一辆小电驴环洱海，风把所有烦恼都吹进了湖里。苍山十九峰在云里时隐时现，像一幅永远画不完的水墨。',
          story: '从成都飞到大理，温度骤降五度，心却一下子敞亮了。环海西路的白桌子是摆拍的，但海西的风是真的。我在才村码头看日落把洱海染成金色，夜里古城的民谣声飘过屋檐。两太短，短到离开时已经开始盘算下次带谁来。',
          highlights: ['环洱海骑行', '才村码头日落', '古城民谣夜']
        },
        {
          name: '丽江', latin: 'LIJIANG', country: '中国', countryEn: 'China', continent: '亚洲',
          coord: [26.8721, 100.2300], date: '07.21', days: 4,
          themes: ['人文古迹'],
          weather: '⛅ 21°C · 多云',
          photo: 'photos/lijiang.jpg',
          note: '玉龙雪山在古城的巷口就能望见。清晨的四方街石板路还带着水汽，纳西族奶奶背着背篓慢慢走过，比任何闹钟都治愈。',
          story: '丽江的关键词是「光影」。清晨的古城属于石板路与流水，正午属于狮子山上俯瞰的全景，傍晚则属于玉龙雪山被夕阳点燃的瞬间。我在一家纳西族院子改建的客栈住了四天，学会了在摇椅上无所事事——高原的日子，就该这样虚度。',
          highlights: ['狮子山全景', '玉龙雪山夕照', '纳西老院客栈']
        }
      ]
    },
    {
      id: 'morocco-2022', no: 3,
      title: '撒哈拉的门', region: '摩洛哥',
      latin: 'GATE TO THE SAHARA, MOROCCO',
      year: 2022, dates: '2022.03.26 — 04.04', days: 10,
      summary: '从马拉喀什的红色迷宫出发，穿过非斯上千年不熄的染缸，最终在梅祖卡的沙丘上等到了此生最震撼的一场星空。北非是一封写给感官的情书。',
      cover: 'photos/merzouga.jpg',
      cities: [
        {
          name: '马拉喀什', latin: 'MARRAKECH', country: '摩洛哥', countryEn: 'Morocco', continent: '非洲',
          coord: [31.6295, -7.9811], date: '03.26', days: 3,
          themes: ['人文古迹', '美食之旅'],
          weather: '☀️ 26°C · 晴',
          photo: 'photos/marrakech.jpg',
          note: '杰马夫纳广场的黄昏像一场永不散场的戏剧：耍蛇人、果汁摊、说书人同时开场。库图比亚塔在暮色里亮起来，空气里全是孜然和橙汁的味道。',
          story: '马拉喀什的一切都是浓烈的：赭红色的城墙、堆成小山的香料、突然凑近说「你好中国」的小贩。第一天我紧绷得像根弦，第三天已经学会砍价到一半再笑着说再见。傍晚爬上某间咖啡馆的天台，看广场从喧闹白昼切换成千灯之夜，忽然就懂了为什么人们叫它「红色之城」。',
          highlights: ['杰马夫纳广场夜市', '马约尔花园蓝', '老城天台日落']
        },
        {
          name: '非斯', latin: 'FES', country: '摩洛哥', countryEn: 'Morocco', continent: '非洲',
          coord: [34.0331, -5.0003], date: '03.29', days: 3,
          themes: ['人文古迹'],
          weather: '⛅ 22°C · 多云',
          photo: 'photos/fes.jpg',
          note: '在九千条巷子的古城里请了一位持牌向导，事后证明无比正确。叔阿拉皮革染坊的气味浓烈到终生难忘——用薄荷抵着鼻子也要看完。',
          story: '非斯老城是一部活着的中世纪手稿。巷子窄到两人错身要侧肩，驮货的驴按着自己的铃铛开路。染坊里上百口石缸像打翻的调色盘，工人们赤脚踩在染液里，动作和一千年前的壁画没有分别。傍晚在制革人 union 的天台喝薄荷茶，整个老城在脚下铺开，历史忽然有了气味和体温。',
          highlights: ['Chouara 染坊', '九千巷迷城', '布日卢蓝门']
        },
        {
          name: '梅祖卡', latin: 'MERZOUGA', country: '摩洛哥', countryEn: 'Morocco', continent: '非洲',
          coord: [31.0802, -4.0134], date: '04.01', days: 3,
          themes: ['探险徒步'],
          weather: '🌙 30°C · 昼热夜凉',
          photo: 'photos/merzouga.jpg',
          note: '骆驼队把我送进尔格切比沙丘深处。夜里躺在沙丘顶上，银河亮到吓人，流星多到许愿来不及——那晚我们只顾着喊「又一颗！」。',
          story: '离开非斯，柏柏尔司机阿祖一路把我们往沙漠深处送，风景从绿洲变成黑石高原，最后是大海一样无边的沙。日落时爬上 150 米的沙丘，风把沙脊吹成锋利的刀刃。夜里的撒哈拉冷得像另一个星球，裹着毯子看银河从头顶缓缓转过一个弧度。原来「震撼」这个词，是留给这种时刻的。',
          highlights: ['骆驼队进沙漠', '沙丘顶银河', '柏柏尔鼓火晚会']
        }
      ]
    },
    {
      id: 'nordic-2022', no: 4,
      title: '极光与峡湾', region: '冰岛 · 挪威',
      latin: 'AURORA & FJORDS, NORDIC',
      year: 2022, dates: '2022.10.02 — 10.12', days: 11,
      summary: '秋天的北欧是一场绿色的火焰。在雷克雅未克的夜里追到极光，在卑尔根的雨里读懂峡湾，最后在奥斯陆的设计街区里回暖。冷的地方，人反而滚烫。',
      cover: 'photos/reykjavik.jpg',
      cities: [
        {
          name: '雷克雅未克', latin: 'REYKJAVIK', country: '冰岛', countryEn: 'Iceland', continent: '欧洲',
          coord: [64.1466, -21.9426], date: '10.02', days: 4,
          themes: ['探险徒步', '自然风光'],
          weather: '🌌 -2°C · 极光晴夜',
          photo: 'photos/reykjavik.jpg',
          note: '第三晚 KP 指数爆发，整片天空的绿色帷幔开始流动。全城的车都往海边开，大家默契地不开远光灯——没有人舍得惊扰这场演出。',
          story: '追极光是门玄学：前两晚阴云密布，我在车里抱着保温杯怀疑人生。第三晚预报晴，出城十公里，绿色忽然从天际线渗出来，随后像水波一样铺满头顶。回到城里已经凌晨两点，哈帕音乐厅的玻璃幕墙映着残存的绿光。冰岛教会我的事：值得的东西，都值得等。',
          highlights: ['极光爆发夜', '哈尔格林姆教堂', '黄金圈一日']
        },
        {
          name: '卑尔根', latin: 'BERGEN', country: '挪威', countryEn: 'Norway', continent: '欧洲',
          coord: [60.3913, 5.3221], date: '10.06', days: 3,
          themes: ['自然风光'],
          weather: '🌦 8°C · 雨夹晴',
          photo: 'photos/bergen.jpg',
          note: '卑尔根一年下三百天雨，但雨停的十分钟里，布吕根的彩色木屋会同时倒映进海面。鱼市老板请我尝了一块烟熏三文鱼，说是「雨的补偿」。',
          story: '卑尔根把天气当作性格：一分钟暴雨，一分钟彩虹。我乘 Floibanen 缆车登上弗洛伊恩山，云隙光扫过七山之间的红色屋顶；下山后在布吕根的汉萨同盟木屋里躲雨，木头缝隙里全是四百年的咸腥味。这里的雨不是坏天气，是峡湾的呼吸。',
          highlights: ['弗洛伊恩山顶', '布吕根木屋群', '鱼市烟熏三文鱼']
        },
        {
          name: '奥斯陆', latin: 'OSLO', country: '挪威', countryEn: 'Norway', continent: '欧洲',
          coord: [59.9139, 10.7522], date: '10.09', days: 3,
          themes: ['城市漫游'],
          weather: '☀️ 6°C · 晴',
          photo: 'photos/oslo.jpg',
          note: '歌剧院的白色斜坡可以一路走到屋顶。夕阳下我坐在屋脊上看峡湾里的游轮进港，北欧的设计感原来是把「克制」做到极致。',
          story: '从峡湾小镇来到首都，节奏慢了半拍却精致了一个刻度。歌剧院的屋顶是全城最好的免费座位，蒙克博物馆里的《呐喊》比想象中小，却安静得震耳。维格兰雕塑公园里，那座被千只手围抱的婴儿柱让人久久挪不开眼。北欧的高冷外壳下，藏着对普通人生活的巨大温柔。',
          highlights: ['歌剧院屋顶', '蒙克博物馆', '维格兰公园']
        }
      ]
    },
    {
      id: 'mediterranean-2023', no: 5,
      title: '地中海之夏', region: '意大利 · 希腊',
      latin: 'LA DOLCE VITA, MEDITERRANEAN',
      year: 2023, dates: '2023.06.17 — 06.30', days: 14,
      summary: '把两个假期拼成十四天，从罗马的千年石头走到圣托里尼的蓝白尽头。这次旅行验证了一个真理：地中海的阳光和碳水，是治愈一切的处方。',
      cover: 'photos/santorini.jpg',
      cities: [
        {
          name: '罗马', latin: 'ROMA', country: '意大利', countryEn: 'Italy', continent: '欧洲',
          coord: [41.9028, 12.4964], date: '06.17', days: 3,
          themes: ['人文古迹'],
          weather: '☀️ 30°C · 晴',
          photo: 'photos/rome.jpg',
          note: '斗兽场 bought 的日落票人少一半。夕阳从拱门斜射进来时，两千年的石头忽然有了温度。许愿池人山人海，我还是背身丢进了硬币。',
          story: '罗马是一座把历史当日常的城市：公交车驶过千年遗迹，野猫睡在帝国广场的断柱上。我在斗兽场顶层看落日把石缝染成蜂蜜色，在万神殿的穹顶光柱下站了整整十分钟。第三天脚底板宣告罢工，但谁在乎呢—— TREVI 喷泉的硬币已经丢下，回来这件事从此有了契约。',
          highlights: ['斗兽场落日', '万神殿光柱', '特雷维喷泉硬币']
        },
        {
          name: '佛罗伦萨', latin: 'FIRENZE', country: '意大利', countryEn: 'Italy', continent: '欧洲',
          coord: [43.7696, 11.2558], date: '06.20', days: 4,
          themes: ['人文古迹', '美食之旅'],
          weather: '☀️ 31°C · 晴',
          photo: 'photos/florence.jpg',
          note: '登圣母百花大教堂的 463 级台阶，值。傍晚在米开朗基罗广场看全城变金，然后下去吃了一块五公斤重的牛排——两个人吃的那种。',
          story: '佛罗伦萨的每一天都被艺术填满又放空。乌菲兹的走廊里，波提切利的维纳斯踏着贝壳向我漂来；老桥上金匠铺的橱窗闪着细光。但这座城最动人的在街头：一口下去会爆汁的 Lampredotto 牛肚包，皮 Scrapetto 广场傍晚起舞的人们。文艺复兴不只在美术馆，它在空气里。',
          highlights: ['乌菲兹美术馆', '米开朗基罗广场日落', '百年牛肚包']
        },
        {
          name: '圣托里尼', latin: 'SANTORINI', country: '希腊', countryEn: 'Greece', continent: '欧洲',
          coord: [36.3932, 25.4615], date: '06.24', days: 3,
          themes: ['海岛与海'],
          weather: '☀️ 28°C · 海风',
          photo: 'photos/santorini.jpg',
          note: '伊亚的日落需要提前一小时占位，全世界的人安静地挤在白墙上，看太阳把爱琴海烧成一整片熔金。那一刻没有人说话。',
          story: '渡轮从雅典驶来，圣托里尼的悬崖像一枚被咬过的月牙浮在海面。我住在费拉的小酒店，每天上午看海，下午迷路，傍晚去伊亚赴那场著名的日落之约。蓝顶教堂、铃铛、白墙上的三角梅——明信片上的东西全是真的，只是比明信片更晒、更慢、更舍不得。',
          highlights: ['伊亚日落占位战', '蓝顶教堂巡礼', '悬崖酒店泳池']
        },
        {
          name: '雅典', latin: 'ATHENS', country: '希腊', countryEn: 'Greece', continent: '欧洲',
          coord: [37.9838, 23.7275], date: '06.27', days: 3,
          themes: ['人文古迹'],
          weather: '☀️ 33°C · 晴热',
          photo: 'photos/athens.jpg',
          note: '为了避开 33 度的高温，清晨六点半就爬上了卫城。帕特农神庙的第一缕阳光打在大理石上，整座城市还在打哈欠，历史已经醒了。',
          story: '雅典是所有西方故事的序章。清晨的卫城几乎没有游客，帕特农的石柱在晨光里泛着蜜色，猫在神庙地基上打盹。下山后钻进普拉卡老城区，爬满三角梅的小巷里藏着最好的希腊酸奶与蜂蜜。夜晚在天台酒吧远眺亮灯的卫城——两千五百年了，它仍然是这座城市的灯塔。',
          highlights: ['卫城清晨', '普拉卡老城', '宪法广场换岗']
        }
      ]
    },
    {
      id: 'andes-2023', no: 6,
      title: '安第斯高原', region: '秘鲁 · 智利',
      latin: 'ANDES & ATACAMA, ANDEAN',
      year: 2023, dates: '2023.09.15 — 09.28', days: 14,
      summary: '海拔三千米以上的十四天：在马丘比丘的晨雾里等待印加的日出，在利马吃掉此生最好的一顿 Ceviche，最后在阿塔卡马的沙漠里看见木星的光环。地球的另一面，原来如此陌生又亲切。',
      cover: 'photos/cusco.jpg',
      cities: [
        {
          name: '库斯科', latin: 'CUSCO', country: '秘鲁', countryEn: 'Peru', continent: '南美洲',
          coord: [-13.5319, -71.9675], date: '09.15', days: 4,
          themes: ['探险徒步'],
          weather: '☀️ 18°C · 高原烈日',
          photo: 'photos/cusco.jpg',
          note: '3400 米的海拔让每级台阶都要喘。古柯茶成了续命水。但清晨推开窗，看到马丘比丘方向的山脊被云撕开的那一刻——高反值得。',
          story: '库斯科的石头会说话：印加人砌的墙缝里插不进一张纸，西班牙人在上面盖了教堂，两层历史就这样叠在一起。凌晨四点出发赶往马丘比丘，晨雾中的古城遗迹随着太阳升高一点点显形，太阳门前的守卫石正对着雪山。回程的火车上，向导哼起盖丘亚歌谣，窗外乌鲁班巴河一路奔腾。',
          highlights: ['马丘比丘晨雾', '太阳门日出', '印加古墙与古柯茶']
        },
        {
          name: '利马', latin: 'LIMA', country: '秘鲁', countryEn: 'Peru', continent: '南美洲',
          coord: [-12.0464, -77.0428], date: '09.19', days: 4,
          themes: ['美食之旅'],
          weather: '🌫 19°C · 海雾微凉',
          photo: 'photos/lima.jpg',
          note: '在 Miraflores 悬崖边的一家小馆子吃到了此生最佳 Ceviche：青柠的酸、辣椒的辣、生鱼的鲜在同一秒炸开。秘鲁把太平洋做成了菜。',
          story: '利马是一座被海雾包裹的城市。巴兰科区的悬崖步道上，恋人们在「情人公园」的长椅下接吻；悬崖下的太平洋灰蓝色地拍打着礁石。这个城市的野心在餐桌上：从街边三块钱的早市果汁，到 ordering 世界五十大餐厅的 Tasting Menu，每一口都在重新定义「南美风味」。',
          highlights: ['Miraflores 悬崖', '巴兰科彩绘墙', '世界级 Ceviche']
        },
        {
          name: '阿塔卡马', latin: 'ATACAMA', country: '智利', countryEn: 'Chile', continent: '南美洲',
          coord: [-22.9087, -68.1993], date: '09.23', days: 5,
          themes: ['探险徒步', '自然风光'],
          weather: '☀️ 22°C · 世界旱极',
          photo: 'photos/atacama.jpg',
          note: '白天在月亮谷看火星地貌，夜里在无光污染的沙漠里用肉眼找到了木星的四颗卫星。这里有些天文台晚上向公众开放，望远镜排队排到了门外。',
          story: '阿塔卡马是地球上最不像地球的地方。月亮谷的盐岩在落日里泛着铁锈红，Tatio 间歇泉在零下五度的黎明喷出白色蒸汽。白天暴晒、夜里严寒，但所有人都心甘情愿——因为沙漠收走了一切光线，然后还给你一整条银河，和一条肉眼可见的「麦哲伦云」。宇宙在这里不藏私。',
          highlights: ['月亮谷日落', 'Tatio 间歇泉', '沙漠天文夜观']
        }
      ]
    },
    {
      id: 'serengeti-2024', no: 7,
      title: '动物大迁徙', region: '东非坦桑尼亚',
      latin: 'GREAT MIGRATION, TANZANIA',
      year: 2024, dates: '2024.02.08 — 02.19', days: 12,
      summary: '在塞伦盖蒂的草原上蹲守了一个迁徙季的尾声：狮群、角马、火烈鸟和乞力马扎罗的雪顶。最后去桑给巴尔的白沙滩上，让心跳慢慢降回陆地时间。',
      cover: 'photos/serengeti.jpg',
      cities: [
        {
          name: '阿鲁沙', latin: 'ARUSHA', country: '坦桑尼亚', countryEn: 'Tanzania', continent: '非洲',
          coord: [-3.3869, 36.683], date: '02.08', days: 3,
          themes: ['探险徒步'],
          weather: '⛅ 26°C · 午后云',
          photo: 'photos/arusha.jpg',
          note: '出发前的清晨，在咖啡庄园远眺了乞力马扎罗的雪顶——据说现在能不能看到全凭运气。司机说：YAHOO，斯瓦希里语的「慢慢来」。',
          story: '阿鲁沙是所有 Safari 的起点小镇。清晨的咖啡庄园里雾气未散，向导基卡检查了三遍越野车的轮胎。第一站塔兰吉雷国家公园，猴面包树群像倒插的巨大蜡烛，大象家族在树下慢悠悠地卷草。第一次看到野生象群的瞬间，车上的六个人同时屏住了呼吸。',
          highlights: ['咖啡庄园晨雾', '塔兰吉雷猴面包树', '第一群野生大象']
        },
        {
          name: '塞伦盖蒂', latin: 'SERENGETI', country: '坦桑尼亚', countryEn: 'Tanzania', continent: '非洲',
          coord: [-2.3333, 34.8333], date: '02.11', days: 4,
          themes: ['自然风光'],
          weather: '☀️ 27°C · 金色草原',
          photo: 'photos/serengeti.jpg',
          note: '清晨五点半出营地，热气球视角下的草原像一块被戳破的金色地毯。角马群过河时掀起的尘土，十分钟后才散。Nature 纪录片没有夸张，是镜头拍不下那种规模。',
          story: '塞伦盖蒂的无边草原上，我们的越野车追着角马大迁徙的尾巴跑了四天。狮群在合欢树的阴影里打盹，猎豹带着两只幼崽侦察远处的羚羊，秃鹫的盘旋暗示着某场刚刚结束的猎杀。住在帐篷营地，夜里能听见鬣狗的笑声从远处滚过。文明的边界在这里退后了一万米，而生命以最原始的方式喧哗。',
          highlights: ['热气球俯瞰草原', '角马渡河尘暴', '帐篷营地的夜']
        },
        {
          name: '桑给巴尔', latin: 'ZANZIBAR', country: '坦桑尼亚', countryEn: 'Tanzania', continent: '非洲',
          coord: [-6.1659, 39.2026], date: '02.15', days: 4,
          themes: ['海岛与海'],
          weather: '☀️ 31°C · 海风咸咸',
          photo: 'photos/zanzibar.jpg',
          note: '石头城的木门上刻满了阿拉伯花纹，巷子里飘着丁香和海盐味。Nungwi 的海水蓝得像果冻，独桅帆船在日落时变成了剪影。',
          story: '从草原飞到海岛，飞机降落时整片印度洋蓝得发光。石头城的老巷需要用脚步丈量：桑给巴尔之门、丁香市场、 Freddie Mercury 的故居。三天后在 Nungwi 白沙滩彻底躺平，浮潜时被一群热带鱼围观。非洲的野性收尾于一场缓慢的日落帆船——斯瓦希里语说 Pole pole（慢慢来），这次我听进去了。',
          highlights: ['石头城老门', 'Nungwi 浮潜', '日落独桅帆船']
        }
      ]
    },
    {
      id: 'rockies-2024', no: 8,
      title: '落基山公路', region: '加拿大 · 美国',
      latin: 'ROCKIES ROAD TRIP, NORTH AMERICA',
      year: 2024, dates: '2024.07.05 — 07.19', days: 15,
      summary: '一场纵贯北美的公路旅行：温哥华的夏日海港、班夫的冰川蓝、旧金山的雾锁金门。方向盘后面的一千五百公里，比任何风景都自由。',
      cover: 'photos/banff.jpg',
      cities: [
        {
          name: '温哥华', latin: 'VANCOUVER', country: '加拿大', countryEn: 'Canada', continent: '北美洲',
          coord: [49.2827, -123.1207], date: '07.05', days: 3,
          themes: ['城市漫游', '美食之旅'],
          weather: '☀️ 22°C · 夏日晴',
          photo: 'photos/vancouver.jpg',
          note: '在斯坦利公园的海堤骑了整圈，一边是森林一边是雪山海港。Gas Town 的蒸汽钟还在咕嘟咕嘟地报时，唐人街的烧腊香把人拽回人间。',
          story: '温哥华把大自然装进了城市生活里。清晨的英吉利湾有人冬泳（七月！），上午的海堤自行车道挤满了轮滑少年，下午我在格兰维尔岛的公共市场里吃到刚出水的生蚝。这座城市对「户外」的理解是日常，不是冒险。公路旅行的第一箱油，加得心满意足。',
          highlights: ['海堤骑行', '格兰维尔岛市场', 'Gas Town 蒸汽钟']
        },
        {
          name: '班夫', latin: 'BANFF', country: '加拿大', countryEn: 'Canada', continent: '北美洲',
          coord: [51.1784, -115.5708], date: '07.08', days: 6,
          themes: ['自然风光', '探险徒步'],
          weather: '☀️ 21°C · 山地爽晴',
          photo: 'photos/banff.jpg',
          note: '露易丝湖的水色不像现实中的颜色——像有人把整个落基山的冰川蓝都倒进了这一个湖里。清晨划独木舟时，湖面雾气刚好散尽。',
          story: '班夫的六天是蓝色的层次课：露易丝湖的乳蓝、梦莲湖的青蓝、Bow 湖的湛蓝。驱车冰原大道时，乌鸦爪冰川就在路边融化成瀑布。清晨五点半爬上 Fairview 山顶看日出把十座雪峰依次点亮，下山后在温泉里泡到手指发皱。落基山用最大的诚意回答了「为什么人类要保护荒野」。',
          highlights: ['露易丝湖独木舟', '冰原大道自驾', '山顶日出十峰']
        },
        {
          name: '旧金山', latin: 'SAN FRANCISCO', country: '美国', countryEn: 'United States of America', continent: '北美洲',
          coord: [37.7749, -122.4194], date: '07.14', days: 5,
          themes: ['城市漫游'],
          weather: '🌫 17°C · 标志性海雾',
          photo: 'photos/sanfrancisco.jpg',
          note: '七月金门大桥的雾是有名的「Fogust」。等到傍晚雾层裂开一条缝，橙红色的桥塔从雾里冒出来的三分钟，全桥的人都举起了手机。',
          story: '开下高速进入旧金山，坡道陡得像过山车。这座城市永远裹着一件雾的外套：九曲花街的绣球花、渔人码头晒太阳的海狮、Mission 区墙面上暴烈的壁画。傍晚雾散的金门大桥是整趟公路旅行的终点仪式——一千五百公里，两箱半油，一座桥收尾，圆满。',
          highlights: ['雾中金门桥', '九曲花街', 'Mission 壁画街']
        }
      ]
    },
    {
      id: 'southpacific-2025', no: 9,
      title: '南十字星下', region: '新西兰 · 澳大利亚',
      latin: 'UNDER SOUTHERN CROSS, OCEANIA',
      year: 2025, dates: '2025.01.20 — 02.02', days: 14,
      summary: '盛夏的南半球：奥克兰的火山海岸、皇后镇的心跳运动、悉尼的白色风帆。第一次在夏天过夏天（北半球的冬天），日历都感觉是倒着走的。',
      cover: 'photos/queenstown.jpg',
      cities: [
        {
          name: '奥克兰', latin: 'AUCKLAND', country: '新西兰', countryEn: 'New Zealand', continent: '大洋洲',
          coord: [-36.8485, 174.7633], date: '01.20', days: 3,
          themes: ['自然风光'],
          weather: '☀️ 24°C · 海风清透',
          photo: 'photos/auckland.jpg',
          note: '登上伊甸山火山口，草坡中间是个巨大的绿坑。千帆之都名不虚传——港口里的桅杆比楼还密，帆船教室的青少年占满了整个海湾。',
          story: '跨过日期变更线落地奥克兰，夏天的空气里全是桉树和海盐味。伊甸山的火山口绿得像被谁修过图，山顶俯瞰整座城被五十座死火山环抱。傍晚在 Mission Bay 海滩吃炸鱼薯条，落日掉进朗伊托托火山的剪影里。南半球的第一晚，我记住了这里光线的角度和北半球完全不同。',
          highlights: ['伊甸山火山口', '千帆码头', 'Mission Bay 落日']
        },
        {
          name: '皇后镇', latin: 'QUEENSTOWN', country: '新西兰', countryEn: 'New Zealand', continent: '大洋洲',
          coord: [-45.0312, 168.6626], date: '01.23', days: 5,
          themes: ['探险徒步', '自然风光'],
          weather: '☀️ 22°C · 湖畔晴',
          photo: 'photos/queenstown.jpg',
          note: '在这里体验了人生第一次跳伞：15000 英尺跃出舱门，Wakatipu 湖蓝成一颗宝石。落地后腿软了半小时，然后在湖边吃了个 Fergburger 平复心情。',
          story: '皇后镇是给胆子大的人准备的游乐场：跳伞、蹦极、喷气快艇、滑翔伞，随便选一样都值回机票。但它的另一面是静的——清晨的瓦卡蒂普湖面像镜子，Ben Lomond 山径走到半山腰就能看完整片湖。跳伞落地后的那个下午，我什么都没做，就坐在湖边看云从山这头搬到那头。极限运动和极致发呆，原来可以发生在同一个下午。',
          highlights: ['15000英尺跳伞', 'Ben Lomond 徒步', 'Fergburger 排队']
        },
        {
          name: '悉尼', latin: 'SYDNEY', country: '澳大利亚', countryEn: 'Australia', continent: '大洋洲',
          coord: [-33.8688, 151.2093], date: '01.28', days: 6,
          themes: ['城市漫游', '海岛与海'],
          weather: '☀️ 26°C · 港湾晴风',
          photo: 'photos/sydney.jpg',
          note: '歌剧院的白帆在夕阳里变成贝壳粉。从环形码头走 Manly 渡轮，海鸥追着船尾飞——这条航线被 Lonely Planet 评为全球最美通勤路线，坐一次就懂了。',
          story: '悉尼把自己活成了一个动词。清晨在邦迪海滩看冲浪者劈开蓝浪，上午沿着Bondi to Coogee 海岸步道暴走，下午的渡轮穿过海港大桥的钢影。歌剧院比想象中更大更白，夜里有月光交响乐。在南半球的最后一夜，我在港口的长椅上坐着，看白色风帆亮起来——「下次再来看看西澳吧」，旅行清单又长了一行。',
          highlights: ['邦迪海滩日出', 'Bondi 海岸步道', '歌剧院月夜']
        }
      ]
    },
    {
      id: 'sea-2025', no: 10,
      title: '暖冬东南亚', region: '泰国 · 新加坡',
      latin: 'WARM WINTER, SOUTHEAST ASIA',
      year: 2025, dates: '2025.12.05 — 12.15', days: 11,
      summary: '趁着年末假期逃去北回归线以南：清迈的灯笼、曼谷的河、新加坡的雨。一场不赶行程、只赶饭点的暖冬之旅，用胃重温了整个东南亚。',
      cover: 'photos/chiangmai.jpg',
      cities: [
        {
          name: '清迈', latin: 'CHIANG MAI', country: '泰国', countryEn: 'Thailand', continent: '亚洲',
          coord: [18.7883, 98.9853], date: '12.05', days: 4,
          themes: ['美食之旅', '人文古迹'],
          weather: '☀️ 27°C · 暖冬干爽',
          photo: 'photos/chiangmai.jpg',
          note: '周日夜市从城门一直排到城尾，芒果糯米饭吃了两次。清晨去素贴山双龙寺，金塔在晨光里亮得睁不开眼，山下的城市还笼着薄雾。',
          story: '清迈的日子被切成两种:白天逛寺庙，晚上逛夜市。古城墙内的三十多座寺庙各有各的金，契迪龙寺的残塔最沧桑。周日夜市是全城的嘉年华，二十泰铢的芒果糯米饭和免费的山泉水一样管够。天灯不是节季才有，但素贴山的云海每天清晨都准时营业——在清迈，连佛都过得很松弛。',
          highlights: ['周日夜市', '素贴山云海', '契迪龙寺残塔']
        },
        {
          name: '曼谷', latin: 'BANGKOK', country: '泰国', countryEn: 'Thailand', continent: '亚洲',
          coord: [13.7563, 100.5018], date: '12.09', days: 3,
          themes: ['城市漫游', '美食之旅'],
          weather: '⛅ 31°C · 午后多云',
          photo: 'photos/bangkok.jpg',
          note: '湄南河的傍晚船票是最划算的观光：郑王庙在夕阳里像一座陶瓷山。夜里的唐人街牌坊下，一整条街的炭火粥摊把冬天煮成了夏天。',
          story: '曼谷用三十九度（体感）的热情欢迎了我。大皇宫的金箔晃眼，卧佛寺的脚底按摩学校排着队，郑王庙的瓷片在下午四点开始发光。但曼谷的灵魂在街头：唐人街 Yaowarat 的炭烤大虾、水门市场砍到一半价的芒果冰。夜市粥摊老板看我拍照，直接往碗里多加了一只虾——「拍照要好看嘛！」',
          highlights: ['郑王庙夕照', '唐人街炭烤虾', '卧佛寺按摩']
        },
        {
          name: '新加坡', latin: 'SINGAPORE', country: '新加坡', countryEn: 'Singapore', continent: '亚洲',
          coord: [1.3521, 103.8198], date: '12.12', days: 3,
          themes: ['城市漫游', '美食之旅'],
          weather: '🌦 29°C · 短阵雨',
          photo: 'photos/singapore.jpg',
          note: '滨海湾的超级树亮灯时下起了雨，躲进树下的玻璃穹顶里，看擎天大树从雨幕里发光。一份海南鸡饭加一杯拉茶，是雨天的标准配置。',
          story: '新加坡是一座被精心修剪的花园，但它的野生味道藏在食阁（Hawker Centre）里。Maxwell 食阁的天天海南鸡饭队伍拐了两个弯，Old Airport Road 的炒粿条锅气十足。雨季的午后常有二十分钟的暴雨，本地人全都熟练地躲进连廊——我跟着躲，顺便学会了「Kopi-C Kosong」这种暗号。旅程的最后一晚，超级树的灯光秀里，雨和灯光同时落下。',
          highlights: ['超级树灯光秀', 'Maxwell 鸡饭', '雨中连廊漫步']
        }
      ]
    },
    {
      id: 'iberia-2026', no: 11,
      title: '伊比利亚春日', region: '葡萄牙 · 西班牙',
      latin: 'IBERIAN SPRING, PORTUGAL & SPAIN',
      year: 2026, dates: '2026.04.03 — 04.14', days: 12,
      summary: '春天最适合伊比利亚：里斯本的老电车叮叮当当爬坡，波尔图的酒香顺着杜罗河飘，巴塞罗那的高迪把整座城市拧成了曲线。十二天，两杯国酒，满墙瓷砖。',
      cover: 'photos/lisbon.jpg',
      cities: [
        {
          name: '里斯本', latin: 'LISBOA', country: '葡萄牙', countryEn: 'Portugal', continent: '欧洲',
          coord: [38.7223, -9.1393], date: '04.03', days: 3,
          themes: ['城市漫游'],
          weather: '☀️ 20°C · 春日晴',
          photo: 'photos/lisbon.jpg',
          note: '28 路电车摇摇晃晃爬上阿尔法玛老城，全车人一起尖叫又大笑。傍晚的圣卢西亚观景台，有人弹法多，唱的全是「Saudade」——那种葡语特有的、想你想得发疼的词。',
          story: '里斯本建在七座山上，于是所有路都通向一个观景台。瓷砖墙把阳光切成蓝白两色，28 路老电车的木座椅吱呀作响。我在阿尔法玛的巷子里迷路三次，每次都被好心的老人指路外加一句「Bom caminho！」。蛋挞店的秘密据说只有三个人知道，我排队两次就吃到了两次——春天在里斯本，运气是标配。',
          highlights: ['28路电车穿越老城', '圣卢西亚法多', '贝伦百年蛋挞']
        },
        {
          name: '波尔图', latin: 'PORTO', country: '葡萄牙', countryEn: 'Portugal', continent: '欧洲',
          coord: [41.1579, -8.6291], date: '04.06', days: 3,
          themes: ['美食之旅', '人文古迹'],
          weather: '⛅ 18°C · 多云间晴',
          photo: 'photos/porto.jpg',
          note: '在杜罗河对岸的酒庄窖里尝了年份波特，甜得像液体的晚霞。莱罗书店的红色旋转楼梯人满为患，但转角处的书架光影还是让我举了半小时相机。',
          story: '波尔图是一座由河流和酒窖定义的城市。里贝拉码头的彩色房子叠成蜂巢，路易一世大桥的上层走地铁下层走行人，两个视角都是明信片。下午横渡到加亚新城，一连逛了三家波特酒庄的酒窖，从 Ruby 喝到 Tawny 再到 Vintage。傍晚坐在河岸边，看游船拖着金色水痕——这一趟， liver 稍微辛苦，但灵魂很甜。',
          highlights: ['波特酒窖品鉴', '莱罗书店旋转梯', '里贝拉河岸日落']
        },
        {
          name: '巴塞罗那', latin: 'BARCELONA', country: '西班牙', countryEn: 'Spain', continent: '欧洲',
          coord: [41.3874, 2.17], date: '04.09', days: 5,
          themes: ['城市漫游', '人文古迹'],
          weather: '☀️ 21°C · 地中海风',
          photo: 'photos/barcelona.jpg',
          note: '圣家堂的彩色玻璃把上午十点的光拆成彩虹。高迪说「直线属于人类，曲线属于上帝」——在这座城市待了五天后，我开始理解这句话的字面意思。',
          story: '巴塞罗那的街道像一场流动的宴席。桂尔公园的马赛克蜥蜴吐着舌头，巴特罗之家的阳台像海浪里探出的骷髅面具，圣家堂的森林立柱撑起了一片会变色的天花板。高迪未完工的圣家堂已经盖了一百四十多年，起重机是这座天际线的常驻嘉宾。兰布拉大道上人来人往，波盖利亚市场的果汁摊像调色盘。旅程的傍晚，我在小巴塞罗那海滩上看人们鼓掌送别落日——地中海式的告别仪式，简单又隆重。',
          highlights: ['圣家堂光之森林', '桂尔公园马赛克', '海滩落日鼓掌']
        }
      ]
    },
    {
      id: 'alps-2026', no: 12,
      title: '阿尔卑斯秋色', region: '法国 · 瑞士',
      latin: 'ALPINE AUTUMN, FRANCE & SWITZERLAND',
      year: 2026, dates: '2026.10.10 — 10.21', days: 12,
      summary: '刚刚结束的最新旅程：巴黎的秋日街头、因特拉肯的双湖秋色、卢塞恩的湖畔木桥。火车、缆车、徒步——阿尔卑斯的秋天，是一场缓慢变色的电影。',
      cover: 'photos/interlaken.jpg',
      cities: [
        {
          name: '巴黎', latin: 'PARIS', country: '法国', countryEn: 'France', continent: '欧洲',
          coord: [48.8566, 2.3522], date: '10.10', days: 3,
          themes: ['城市漫游', '人文古迹'],
          weather: '☀️ 15°C · 秋阳斜照',
          photo: 'photos/paris.jpg',
          note: '十月特罗卡德罗广场的风有点凉，但铁塔整点闪灯的五分钟值回一切。塞纳河左岸的旧书摊正在收摊，绿箱子啪嗒合上的声音像这座城市在打烊前道晚安。',
          story: '秋天的巴黎被镀上一层低饱和的金色。我在奥赛博物馆顶层看了两个小时印象派，出门后发现真实的塞纳河比莫奈画的还要灰蓝。玛黑区的小酒馆里，一份油封鸭配一杯博若莱新酒，邻桌的老先生用英语和我聊了半小时「巴黎人的傲慢其实是害羞」。铁塔整点闪灯时，全广场的人都在倒数——巴黎的浪漫是有仪式感的，它自己知道。',
          highlights: ['奥赛印象派', '玛黑区小酒馆', '铁塔整点闪灯']
        },
        {
          name: '因特拉肯', latin: 'INTERLAKEN', country: '瑞士', countryEn: 'Switzerland', continent: '欧洲',
          coord: [46.6863, 7.8632], date: '10.13', days: 4,
          themes: ['探险徒步', '自然风光'],
          weather: '⛅ 12°C · 高山多云',
          photo: 'photos/interlaken.jpg',
          note: '少女峰齿轨火车爬升三个小时，窗外的秋天从金色草原变成万年雪原。海拔3454米的观景台上，云海就压在脚边——按快门的手是抖的（又冷又激动）。',
          story: '因特拉肯，两湖之间的小镇，是阿尔卑斯的十字路口。第二天清晨乘齿轨火车出发，红色的小火车像一节积木钉在山体上，一路爬进云里。少女峰的「欧洲之巅」观景台外是白得发蓝的阿莱奇冰川，二十三公里长的冰河像一条冻结的大河。下山后在图恩湖边散步，湖水的青色绿得不讲道理。瑞士的美是精确的：连每一片云的位置，都像是被安排好的。',
          highlights: ['少女峰齿轨火车', '阿莱奇冰川', '图恩湖畔散步']
        },
        {
          name: '卢塞恩', latin: 'LUZERN', country: '瑞士', countryEn: 'Switzerland', continent: '欧洲',
          coord: [47.0502, 8.3093], date: '10.17', days: 4,
          themes: ['自然风光', '城市漫游'],
          weather: '🌦 10°C · 湖畔微雨',
          photo: 'photos/lucerne.jpg',
          note: '微雨中的花桥最像中世纪油画，桥顶的三角彩绘被雨水洗得更鲜艳。雨停后登上皮拉图斯山的金色环线缆车，云层在半山腰裂开，湖水蓝得像刚洗过的宝石。',
          story: '卢塞恩是这次旅程的最后一站，也是最安静的一站。清晨的卡佩尔廊桥几乎没有游客，木桥下的天鹅排成一列滑过；雨停后乘金色环线（船+齿轨+缆车）登上皮拉图斯山，云海翻涌如潮。最后一晚，我在罗伊斯河边的长椅上坐了很久，整理这一路拍下的两千多张照片。十二段旅程到这里暂告一段落——但你知道的，下一程永远在路上。',
          highlights: ['卡佩尔廊桥晨雾', '皮拉图斯金色环线', '旅程终站长椅']
        }
      ]
    }
  ];

  /* 便捷访问 */
  const allCities = [];
  trips.forEach(t => t.cities.forEach(c => { c.trip = t; allCities.push(c); }));

  const countries = {};
  allCities.forEach(c => {
    if (!countries[c.countryEn]) countries[c.countryEn] = { zh: c.country, continent: c.continent, count: 0 };
    countries[c.countryEn].count++;
  });

  const years = [...new Set(trips.map(t => t.year))].sort((a, b) => b - a);

  return {
    trips, cities: allCities, countries,
    years, themes: THEMES, themeIcons: THEME_ICONS, yearColors: YEAR_COLORS,
    /* 大圆弧距离 (km) */
    distance(a, b) {
      const R = 6371;
      const [la1, lo1] = a.coord, [la2, lo2] = b.coord;
      const rad = Math.PI / 180;
      const dLat = (la2 - la1) * rad, dLon = (lo2 - lo1) * rad;
      const s = Math.sin(dLat / 2) ** 2 + Math.cos(la1 * rad) * Math.cos(la2 * rad) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(s));
    }
  };
})();
