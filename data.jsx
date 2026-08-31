const PROTOTYPE_RESOURCES = [
  {
    id:"V-20418",type:"视频",title:"滇南民歌田野记录",source:"云南民族文化影像馆",
    desc:"记录节庆场景中的集体演唱、领唱方式与青年参与过程。",
    time:"03:20–04:42",rights:"教学展示可用",download:"可下载片段",
    tags:["云南","民歌","社区传承"],chapter:"研究背景",selected:true,relevance:96
  },
  {
    id:"I-7831",type:"图片",title:"彝族月琴与演奏场景",source:"中华民族文化图片库",
    desc:"呈现传统乐器形制与真实演奏环境，可用于展示音乐与生活空间的关系。",
    time:"高清图像",rights:"可嵌入课件",download:"可下载",
    tags:["彝族","月琴","演奏"],chapter:"传统音乐形态",selected:true,relevance:94
  },
  {
    id:"D-1902",type:"文献",title:"民族音乐传承的社区机制",source:"民族艺术研究",
    desc:"从节庆、仪式与家庭教育三个层面讨论地方音乐知识的延续。",
    time:"第32–36页",rights:"可摘录引用",download:"原文受控",
    tags:["传承机制","社区","教育"],chapter:"传承机制",selected:true,relevance:92
  },
  {
    id:"A-0155",type:"音频",title:"白族大本曲唱段",source:"民族音乐专题库",
    desc:"包含完整唱段与伴奏片段，可对比旋律、节奏和唱腔特征。",
    time:"12:14–13:05",rights:"教学播放可用",download:"可下载片段",
    tags:["白族","大本曲","唱腔"],chapter:"传统音乐形态",selected:false,relevance:89
  },
  {
    id:"O-0044",type:"口述",title:"传承人口述：村寨中的学艺方式",source:"中华民族文化口述史",
    desc:"传承人讲述从家庭启蒙到节庆实践的学习路径与代际关系。",
    time:"访谈节选 06",rights:"可预览引用",download:"站内链接",
    tags:["口述史","传承人","学艺"],chapter:"传承机制",selected:true,relevance:88
  },
  {
    id:"V-3301",type:"视频",title:"新媒体中的民族音乐传播",source:"民族文化数字专题",
    desc:"案例展示短视频、校园社团和数字展演对传统音乐传播的影响。",
    time:"08:40–10:16",rights:"教学展示可用",download:"可下载片段",
    tags:["新媒体","当代传播","青年"],chapter:"当代创新",selected:true,relevance:86
  },
  {
    id:"I-0919",type:"图片",title:"节庆中的集体演唱",source:"民族节庆影像库",
    desc:"多年龄群体共同参与的现场照片，支持社区参与和代际传承论点。",
    time:"高清图像",rights:"可嵌入课件",download:"可下载",
    tags:["节庆","集体演唱","社区"],chapter:"研究背景",selected:false,relevance:84
  },
  {
    id:"D-2881",type:"文献",title:"非遗保护与音乐教育",source:"民族教育研究",
    desc:"讨论学校教育、社区实践与数字平台协同保护传统音乐的路径。",
    time:"第18–25页",rights:"可摘录引用",download:"原文受控",
    tags:["非遗","音乐教育","数字化"],chapter:"当代创新",selected:false,relevance:82
  }
];

const PROTOTYPE_CHAPTERS = [
  {id:"c1",no:"01",title:"研究背景",goal:"说明主题范围、研究价值与馆藏证据基础",status:"完整",state:"done"},
  {id:"c2",no:"02",title:"传统音乐形态",goal:"对比乐器、唱腔与节庆场景中的音乐表现",status:"完整",state:"done"},
  {id:"c3",no:"03",title:"传承机制",goal:"分析家庭、社区、传承人和教育场景中的代际传递",status:"待补1项",state:"gap"},
  {id:"c4",no:"04",title:"当代创新",goal:"讨论新媒体、校园传播与数字化保护的作用",status:"完整",state:"done"},
  {id:"c5",no:"05",title:"结论与启示",goal:"归纳传统延续与当代转化之间的关系",status:"待生成",state:"idle"}
];

const PROTOTYPE_ARTIFACTS = [
  {id:"art-1",title:"云南少数民族音乐传承与当代发展",type:"PPT",pages:"12页",updated:"刚刚",version:"V1",status:"校验通过"},
  {id:"art-2",title:"端午习俗的地域差异与共同记忆",type:"课程论文",pages:"5,200字",updated:"2026-08-28",version:"V3",status:"草稿"},
  {id:"art-3",title:"传统织染技艺的材料与审美",type:"PPT",pages:"16页",updated:"2026-08-21",version:"V2",status:"校验通过"}
];

Object.assign(window,{PROTOTYPE_RESOURCES,PROTOTYPE_CHAPTERS,PROTOTYPE_ARTIFACTS});