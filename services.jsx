const PLATFORM_ORIGIN = "https://mzwh.libtop.com";
const PLATFORM_SEARCH_API = `${PLATFORM_ORIGIN}/api/search/all/list`;

function cleanText(value=""){
  return String(value).replace(/\s+/g," ").trim();
}

function extractThemeTitle(topic=""){
  const quoted=topic.match(/[“\"「『](.{4,60}?)[”\"」』]/);
  let value=quoted?.[1]||topic;
  value=value
    .replace(/制作|完成|生成|一个|一份|关于|课程展示|课程论文|研学报告|PPT|ppt|分钟|字左右|要求|请/gi," ")
    .replace(/[，。；：、!?！？()（）]/g," ")
    .replace(/\s+/g,"")
    .trim();
  return (value||"中华民族文化研学主题").slice(0,36);
}

function formatDuration(seconds){
  const value=Number(seconds||0);
  if(!value)return "静态图像";
  const min=Math.floor(value/60);
  const sec=Math.round(value%60);
  return `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function typeFromPrimitive(primitiveType){
  return Number(primitiveType)===3?"图片":Number(primitiveType)===2?"音频":"视频";
}

function normalizePlatformItem(item,index,query){
  const isAlbum=Boolean(item.albumForFront);
  const raw=item.videoForFront||item.albumForFront||{};
  const primitiveType=Number(raw.primitiveType||1);
  const type=typeFromPrimitive(primitiveType);
  const id=String(raw.vid||raw.id||item.contentId||`MZ-${index+1}`);
  const tags=(raw.frontCategoryNames||[]).filter(Boolean).slice(0,6);
  const title=cleanText(raw.title||`${query}相关馆藏`);
  const publisher=cleanText(raw.publisher||"联图云·中华民族文化平台");
  const desc=cleanText(raw.descr||"该记录暂未提供公开简介，请进入联图云详情页核验。");
  const time=isAlbum?`${raw.vidCount||0}项资源`:type==="图片"?"高清图像":formatDuration(raw.duration);
  const detailUrl=type==="图片"
    ?`${PLATFORM_ORIGIN}/imagedetail?vid=${encodeURIComponent(id)}`
    :`${PLATFORM_ORIGIN}/video/${encodeURIComponent(id)}`;
  return {
    id,type,title,source:publisher,desc,time,
    rights:"权限以平台账号为准",download:"站内核验",
    tags:tags.length?tags:[query],selected:index<6,
    relevance:Math.max(72,98-index*2),coverUrl:raw.coverUrl||raw.smallCoverUrl||"",
    detailUrl,searchUrl:`${PLATFORM_ORIGIN}/search?keyword=${encodeURIComponent(query)}`,
    recordType:isAlbum?"资源专辑":"单项资源",publishYear:raw.publishYear||"未标注",
    excerpt:desc,
    aiSummary:`该${type}与“${query}”相关，可作为文化背景、形态特征或传承讨论的站内证据；正式使用前应结合原始内容核验。`,
    dataMode:"live"
  };
}

const VERIFIED_SNAPSHOT_RESOURCES = [
  {
    id:"343641867495145478",type:"视频",title:"布朗族04民歌",source:"云南民族文化音像出版社有限责任公司",
    desc:"历史上，云南人口较少民族的历史文化与生产生活知识，常以民歌演唱的口头形式传承。",
    time:"00:47",coverUrl:"https://mzwh.libtop.com/video_culture/covers/20251231/cover_442181360480681984.jpg",
    tags:["布朗族","传统音乐","民族音乐","云南省"],publishYear:2015
  },
  {
    id:"343665600163217415",type:"视频",title:"怒族-04民歌",source:"云南民族文化音像出版社有限责任公司",
    desc:"以短片形式呈现怒族民歌及其口头传承背景，可用于比较不同族群的音乐表达。",
    time:"00:47",coverUrl:"https://mzwh.libtop.com/video_culture/covers/20251231/cover_442098665327165440.jpg",
    tags:["怒族","传统音乐","民族音乐","云南省"],publishYear:2015
  },
  {
    id:"343689246831280135",type:"视频",title:"普米族-04民歌",source:"云南民族文化音像出版社有限责任公司",
    desc:"记录普米族民歌片段，关联民族语言、民族乐舞和地域文化课堂等平台分类。",
    time:"00:47",coverUrl:"https://mzwh.libtop.com/video_culture/covers/20251231/cover_442123159492100096.jpg",
    tags:["普米族","民族乐舞","音乐类","云南省"],publishYear:2015
  },
  {
    id:"332432498556403743",type:"视频",title:"云南富宁壮族《坡芽情歌》—爱情民歌集",source:"云南民族文化音像出版社",
    desc:"介绍以图画记录壮族情歌的《坡芽歌书》，呈现歌唱、图像与地方情感表达之间的关系。",
    time:"03:13",coverUrl:"https://mzwh.libtop.com/video_culture/covers/20251231/cover_442124969061646336.jpg",
    tags:["壮族","坡芽歌书","传统音乐","非物质文化遗产"],publishYear:2020
  },
  {
    id:"343651651124461603",type:"视频",title:"景颇族18民歌",source:"云南民族文化音像出版社有限责任公司",
    desc:"民歌是景颇族主要的音乐种类，包含山歌、吟唱调、劳动歌、儿歌等类别。",
    time:"00:21",coverUrl:"https://mzwh.libtop.com/video_culture/covers/20251231/cover_442104438916644864.jpg",
    tags:["景颇族","山歌","劳动歌","云南省"],publishYear:2015
  },
  {
    id:"388519087736619008",type:"图片",title:"云南文山壮族苗族自治州风景图",source:"云南民族文化音像出版社有限责任公司",
    desc:"由六张实拍图片组成，呈现自然风光、乡村劳作、传统服饰与壮族地域生活场景。",
    time:"6项资源",coverUrl:"https://mzwh.libtop.com/video_culture/covers/20250805/cover_388519126009643008.jpg",
    tags:["壮族","高清图文","地域文化","文山"],publishYear:2015
  },
  {
    id:"395717099835621376",type:"图片",title:"云南纳西族手工造纸",source:"联图云·中华民族文化平台",
    desc:"介绍纳西族手工造纸及东巴纸的制作传统，关联传统技艺和非物质文化遗产分类。",
    time:"2项资源",coverUrl:"https://mzwh.libtop.com/video_culture/image/202508251427/4ea48527daaa9659a10946537bde2389_water.png",
    tags:["纳西族","手工造纸","传统技艺","非遗"],publishYear:"未标注"
  },
  {
    id:"393860089875791872",type:"图片",title:"云南省昭通县大关县 自然风景",source:"联图云·中华民族文化平台",
    desc:"以图像呈现昭通地区山川、瀑布、森林和地方自然景观，可作为地域环境背景证据。",
    time:"6项资源",coverUrl:"https://mzwh.libtop.com/video_culture/covers/20250820/cover_393860133341364224.jpg",
    tags:["云南省","高清图文","自然景观","地域背景"],publishYear:"未标注"
  }
].map((r,index)=>({
  ...r,selected:index<6,relevance:Math.max(78,96-index*2),
  rights:"权限以平台账号为准",download:"站内核验",recordType:r.type==="图片"?"图片专辑":"单项资源",
  detailUrl:r.type==="图片"?`${PLATFORM_ORIGIN}/imagedetail?vid=${r.id}`:`${PLATFORM_ORIGIN}/video/${r.id}`,
  searchUrl:`${PLATFORM_ORIGIN}/search?keyword=${encodeURIComponent("云南民族音乐")}`,
  excerpt:r.desc,
  aiSummary:`该${r.type}可为云南民族文化主题提供背景或案例证据；此摘要由MVP规则生成，正式使用前请核验原始内容。`,
  dataMode:"snapshot"
}));

async function searchPlatformResources(task){
  const query=extractThemeTitle(task.topic);
  const body={
    sortField:null,duration:null,startTime:null,endTime:null,categoryListMap:{},
    contentTypeList:["video","videoAlbum","audio","audioAlbum","image","imageAlbum"],
    keyword:encodeURIComponent(query),current:1,size:30
  };
  try{
    const response=await fetch(PLATFORM_SEARCH_API,{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)
    });
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const payload=await response.json();
    const contents=payload?.data?.contents||[];
    if(payload?.code!==200||!contents.length)throw new Error("未返回可用资源");
    const seen=new Set();
    const resources=contents
      .map((item,index)=>normalizePlatformItem(item,index,query))
      .filter(item=>item.id&&!seen.has(item.id)&&seen.add(item.id));
    return {
      resources,
      meta:{mode:"live",label:"联图云实时检索",total:payload.data.total||resources.length,query,searchedAt:new Date().toLocaleString("zh-CN")}
    };
  }catch(error){
    return {
      resources:VERIFIED_SNAPSHOT_RESOURCES.map(r=>({...r})),
      meta:{mode:"snapshot",label:"已核验快照回退",total:VERIFIED_SNAPSHOT_RESOURCES.length,query,error:error.message,searchedAt:new Date().toLocaleString("zh-CN")}
    };
  }
}

function buildOutline(task,resources){
  const selected=resources.filter(r=>r.selected);
  const ids=selected.map(r=>r.id);
  const theme=extractThemeTitle(task.topic);
  const pick=(indexes)=>indexes.map(i=>ids[i%Math.max(ids.length,1)]).filter(Boolean).filter((id,i,a)=>a.indexOf(id)===i);
  const chapters=[
    {id:"c1",no:"01",title:"选题与文化背景",goal:`界定“${theme}”的主题范围、地域语境与研究价值。`,resourceIds:pick([0,1])},
    {id:"c2",no:"02",title:"文化形态与代表性案例",goal:"通过视听与图像证据呈现文化形态、实践场景和代表性案例。",resourceIds:pick([1,2,4])},
    {id:"c3",no:"03",title:"传承机制与当代发展",goal:"分析家庭、社区、教育与数字传播如何共同影响文化传承。",resourceIds:pick([2,3,5])},
    {id:"c4",no:"04",title:"结论、边界与启示",goal:"在已有证据范围内形成结论，并明确资料边界、引用方式与后续问题。",resourceIds:ids.slice(0,4)}
  ];
  return chapters.map(chapter=>{
    const count=chapter.resourceIds.length;
    const titles=chapter.resourceIds.map(id=>resources.find(r=>r.id===id)?.title).filter(Boolean);
    return {
      ...chapter,status:count?`已绑定${count}项`:"证据不足",state:count?"done":"gap",
      suggestion:count
        ?`围绕“${chapter.goal}”组织内容，优先引用${titles.slice(0,2).map(t=>`《${t}》`).join("、")}，并把MVP摘要与平台原始记录分开呈现。`
        :"当前没有已选证据，请返回检索页补充素材后再生成。"
    };
  });
}

function outlineCoverage(outline=[]){
  if(!outline.length)return 0;
  return Math.round(outline.filter(c=>c.resourceIds?.length).length/outline.length*100);
}

function buildArtifact(task,outline,resources,settings){
  const selected=resources.filter(r=>r.selected);
  const selectedIds=new Set(selected.map(r=>r.id));
  const cleanOutline=outline.map(chapter=>({
    ...chapter,
    resourceIds:(chapter.resourceIds||[]).filter(id=>selectedIds.has(id))
  }));
  const coverage=outlineCoverage(cleanOutline);
  const now=new Date();
  return {
    id:`ART-${now.getTime()}`,title:extractThemeTitle(task.topic),
    type:settings.type,layout:settings.layout,
    pages:settings.type==="课程论文"
      ?cleanOutline.length
      :1+cleanOutline.length+Math.max(1,Math.ceil(selected.length/4)),
    requestedSize:Number(settings.pages)||null,
    version:"V1",status:coverage===100?"校验通过":"待补证据",
    createdAt:now.toISOString(),updated:now.toLocaleString("zh-CN"),
    task,outline:cleanOutline,resourceIds:selected.map(r=>r.id),
    evidence:selected.map(r=>({...r})),coverage
  };
}

Object.assign(window,{
  PLATFORM_ORIGIN,VERIFIED_SNAPSHOT_RESOURCES,searchPlatformResources,
  extractThemeTitle,buildOutline,outlineCoverage,buildArtifact
});
