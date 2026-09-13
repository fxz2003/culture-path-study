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

const MUSIC_TERMS=["音乐","民歌","歌曲","情歌","山歌","儿歌","乐器","器乐","声乐","唱腔","歌舞","乐舞","海菜腔","传唱"];
const OFF_TOPIC_TERMS=["戏剧","戏曲","锻制","刀具","医药","造纸","刺绣","建筑","拳术","陶器"];
const ETHNIC_TERMS=["阿昌族","白族","布朗族","傣族","德昂族","独龙族","哈尼族","基诺族","景颇族","拉祜族","傈僳族","苗族","纳西族","怒族","普米族","彝族","壮族","佤族","藏族","瑶族","回族","蒙古族"];

function parseAlbumVideoIds(raw){
  try{
    const value=typeof raw.vids==="string"?JSON.parse(raw.vids):raw.vids;
    const list=Array.isArray(value)?value:[];
    return list.map(v=>String(v?.vid||v?.id||v)).filter(Boolean);
  }catch(error){
    return [];
  }
}

function topicProfile(topic=""){
  const theme=extractThemeTitle(topic);
  const isMusic=MUSIC_TERMS.some(term=>theme.includes(term));
  return {theme,isMusic,region:theme.includes("云南")?"云南":""};
}

function buildSearchQueries(topic=""){
  const profile=topicProfile(topic);
  if(!profile.isMusic)return [profile.theme];
  const region=profile.region||"云南";
  return [...new Set([
    `${region}民族音乐`,`${region}民歌`,`${region}少数民族歌曲`,profile.theme
  ])].slice(0,4);
}

function splitEvidenceSentences(value=""){
  return cleanText(value)
    .split(/[。！？!?；;]/)
    .map(sentence=>cleanText(sentence))
    .filter(sentence=>sentence.length>=8)
    .slice(0,3);
}

function scoreResource(resource,topic=""){
  const profile=topicProfile(topic);
  const titleTags=`${resource.title} ${(resource.tags||[]).join(" ")}`;
  const fullText=`${titleTags} ${resource.desc||""}`;
  const positives=MUSIC_TERMS.filter(term=>titleTags.includes(term));
  const negatives=OFF_TOPIC_TERMS.filter(term=>titleTags.includes(term));
  let score=40;
  if(profile.isMusic){
    score+=Math.min(42,positives.length*18);
    if(!positives.length&&negatives.length)score-=55;
    if(fullText.includes("民族"))score+=8;
    if(fullText.includes("云南"))score+=10;
    if(/传承|保护|发展|非物质文化遗产/.test(fullText))score+=8;
  }else{
    const keywords=profile.theme.split(/\s+/).filter(word=>word.length>=2);
    score+=Math.min(40,keywords.filter(word=>fullText.includes(word)).length*12);
  }
  const relevance=Math.max(0,Math.min(100,score));
  const directlyRelevant=profile.isMusic
    ?positives.length>0&&!(negatives.length>0&&positives.length===0)
    :relevance>=60;
  return {
    relevance,directlyRelevant,
    relevanceLevel:directlyRelevant?(relevance>=85?"高度相关":"相关"):"待核验"
  };
}

function decorateResource(resource,topic,index=0){
  const scored=scoreResource(resource,topic);
  const evidencePoints=splitEvidenceSentences(resource.desc);
  return {
    ...resource,...scored,evidencePoints,
    selected:false,
    excerpt:resource.desc,
    aiSummary:evidencePoints.length
      ?`平台简介显示：${evidencePoints[0]}。`
      :"平台暂无足够文字简介，请回看原始素材后再形成结论。",
    originalIndex:index
  };
}

function normalizePlatformItem(item,index,query,topic){
  const isAlbum=Boolean(item.albumForFront);
  const raw=item.videoForFront||item.albumForFront||{};
  const primitiveType=Number(raw.primitiveType||1);
  const type=typeFromPrimitive(primitiveType);
  const albumVideoIds=isAlbum?parseAlbumVideoIds(raw):[];
  const playableId=String(raw.vid||albumVideoIds[0]||raw.id||item.contentId||`MZ-${index+1}`);
  const albumId=isAlbum?String(raw.id||""):"";
  const id=playableId;
  const tags=(raw.frontCategoryNames||[]).filter(Boolean).slice(0,6);
  const title=cleanText(raw.title||`${query}相关馆藏`);
  const publisher=cleanText(raw.publisher||"联图云·中华民族文化平台");
  const desc=cleanText(raw.descr||"该记录暂未提供公开简介，请进入联图云详情页核验。");
  const time=isAlbum?`${raw.vidCount||0}项资源`:type==="图片"?"高清图像":formatDuration(raw.duration);
  const detailUrl=type==="图片"
    ?`${PLATFORM_ORIGIN}/imagedetail?vid=${encodeURIComponent(id)}`
    :`${PLATFORM_ORIGIN}/video/${encodeURIComponent(id)}`;
  return decorateResource({
    id,type,title,source:publisher,desc,time,
    rights:"权限以平台账号为准",download:"站内核验",
    tags:tags.length?tags:[query],coverUrl:raw.coverUrl||raw.smallCoverUrl||"",
    detailUrl,searchUrl:`${PLATFORM_ORIGIN}/search?keyword=${encodeURIComponent(query)}`,
    recordType:isAlbum?"资源专辑":"单项资源",albumId,playableId,
    publishYear:raw.publishYear||"未标注",
    dataMode:"live"
  },topic,index);
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
].map((r,index)=>decorateResource({
  ...r,
  rights:"权限以平台账号为准",download:"站内核验",recordType:r.type==="图片"?"图片专辑":"单项资源",
  detailUrl:r.type==="图片"?`${PLATFORM_ORIGIN}/imagedetail?vid=${r.id}`:`${PLATFORM_ORIGIN}/video/${r.id}`,
  searchUrl:`${PLATFORM_ORIGIN}/search?keyword=${encodeURIComponent("云南民族音乐")}`,
  dataMode:"snapshot"
},"云南少数民族音乐传承与当代发展",index));

async function searchPlatformResources(task){
  const query=extractThemeTitle(task.topic);
  const queries=buildSearchQueries(task.topic);
  const searchOne=async(currentQuery)=>{
    const body={
      sortField:null,duration:null,startTime:null,endTime:null,categoryListMap:{},
      contentTypeList:["video","videoAlbum","audio","audioAlbum","image","imageAlbum"],
      keyword:encodeURIComponent(currentQuery),current:1,size:30
    };
    const response=await fetch(PLATFORM_SEARCH_API,{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)
    });
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const payload=await response.json();
    if(payload?.code!==200)throw new Error(payload?.msg||"检索失败");
    return {query:currentQuery,total:payload?.data?.total||0,contents:payload?.data?.contents||[]};
  };
  try{
    const batches=await Promise.all(queries.map(searchOne));
    if(!batches.some(batch=>batch.contents.length))throw new Error("未返回可用资源");
    const seen=new Set();
    const resources=batches
      .flatMap(batch=>batch.contents.map((item,index)=>normalizePlatformItem(item,index,batch.query,task.topic)))
      .filter(item=>item.id&&!seen.has(item.id)&&seen.add(item.id))
      .sort((a,b)=>Number(b.directlyRelevant)-Number(a.directlyRelevant)||b.relevance-a.relevance||a.originalIndex-b.originalIndex)
      .slice(0,30)
      .map((item,index)=>({...item,selected:item.directlyRelevant&&index<10}));
    const directCount=resources.filter(item=>item.directlyRelevant).length;
    return {
      resources,
      meta:{
        mode:"live",label:"联图云多词扩展检索",
        total:Math.max(...batches.map(batch=>batch.total),resources.length),
        query,queries,directCount,searchedAt:new Date().toLocaleString("zh-CN")
      }
    };
  }catch(error){
    const resources=VERIFIED_SNAPSHOT_RESOURCES
      .map((item,index)=>decorateResource(item,task.topic,index))
      .sort((a,b)=>Number(b.directlyRelevant)-Number(a.directlyRelevant)||b.relevance-a.relevance)
      .map((item,index)=>({...item,selected:item.directlyRelevant&&index<8}));
    return {
      resources,
      meta:{
        mode:"snapshot",label:"已核验快照回退",total:resources.length,query,queries,
        directCount:resources.filter(item=>item.directlyRelevant).length,
        error:error.message,searchedAt:new Date().toLocaleString("zh-CN")
      }
    };
  }
}

function distinctResources(resources,count=3){
  const result=[];
  const ethnicSeen=new Set();
  resources.forEach(resource=>{
    const ethnicity=ETHNIC_TERMS.find(term=>`${resource.title} ${(resource.tags||[]).join(" ")}`.includes(term));
    if(result.length<count&&(!ethnicity||!ethnicSeen.has(ethnicity))){
      result.push(resource);
      if(ethnicity)ethnicSeen.add(ethnicity);
    }
  });
  resources.forEach(resource=>{
    if(result.length<count&&!result.some(item=>item.id===resource.id))result.push(resource);
  });
  return result;
}

function chapterPoints(chapterResources=[]){
  const points=[];
  chapterResources.forEach(resource=>{
    const sentence=resource.evidencePoints?.[0]||resource.desc;
    const tags=(resource.tags||[]).filter(tag=>!/^云南省$|^视频$|^文化$/.test(tag)).slice(0,3);
    const tagLead=tags.length?`平台标注“${tags.join("／")}”`:"平台馆藏记录";
    if(sentence)points.push(`《${resource.title}》：${tagLead}；${cleanText(sentence).slice(0,68)}`);
  });
  return [...new Set(points)].slice(0,3);
}

function buildOutline(task,resources){
  const selected=resources.filter(r=>r.selected&&r.directlyRelevant);
  const theme=extractThemeTitle(task.topic);
  const profile=topicProfile(task.topic);
  const byMusic=selected.filter(r=>MUSIC_TERMS.some(term=>`${r.title} ${(r.tags||[]).join(" ")}`.includes(term)));
  const byFolk=selected.filter(r=>/民歌|山歌|情歌|儿歌|歌书/.test(`${r.title} ${(r.tags||[]).join(" ")}`));
  const byHeritage=selected.filter(r=>/传承|保护|发展|非物质文化遗产|数字|教育/.test(`${r.title} ${r.desc||""} ${(r.tags||[]).join(" ")}`));
  const ethnicNames=[...new Set(selected.flatMap(r=>ETHNIC_TERMS.filter(term=>`${r.title} ${(r.tags||[]).join(" ")}`.includes(term))))];
  const resourceSet=(list,count=3,offset=0)=>{
    const source=list.length?list:selected;
    if(!source.length)return [];
    const start=offset%source.length;
    return distinctResources([...source.slice(start),...source.slice(0,start)],count);
  };
  const rawChapters=profile.isMusic?[
    {
      id:"c1",no:"01",title:"研究问题与材料范围",
      goal:`用联图云馆藏界定“${theme}”的讨论范围。`,
      takeaway:`本次展示以${selected.length}项站内视听材料为证据，讨论云南少数民族音乐的形态、生活语境与传承线索。`,
      items:resourceSet(selected,2,0)
    },
    {
      id:"c2",no:"02",title:"代表性音乐形态",
      goal:"从馆藏标题、分类标签和内容简介识别民歌、山歌、情歌等形态。",
      takeaway:`当前馆藏样本覆盖${[...new Set(byMusic.flatMap(r=>MUSIC_TERMS.filter(term=>`${r.title} ${(r.tags||[]).join(" ")}`.includes(term))))].slice(0,4).join("、")||"多种民族音乐形态"}，可用来搭建主题的基本分类。`,
      items:resourceSet(byMusic,3,2)
    },
    {
      id:"c3",no:"03",title:"民歌与日常生活",
      goal:"观察音乐如何进入劳动、节庆、情感表达和口头传承。",
      takeaway:"民歌类资源把歌唱与日常生活、民族语言和地方记忆联系起来，是理解音乐社会功能的关键证据。",
      items:resourceSet(byFolk,3,4)
    },
    {
      id:"c4",no:"04",title:"不同族群的音乐表达",
      goal:"使用不同族群的站内样本进行并列比较，避免用单一案例代表全部。",
      takeaway:`所选材料涉及${ethnicNames.slice(0,5).join("、")||"多个民族"}等族群，可从曲种、演唱场景和文化含义三个维度比较。`,
      items:resourceSet(selected,3,6)
    },
    {
      id:"c5",no:"05",title:"传承与当代发展线索",
      goal:"基于馆藏事实讨论记录、教育、传播和活态传承，不超出证据作强结论。",
      takeaway:"平台馆藏首先提供可回看的记录与传播载体；有关当代发展成效的判断，仍需结合原视频和补充调研核验。",
      items:resourceSet(byHeritage,3,1)
    },
    {
      id:"c6",no:"06",title:"结论与证据边界",
      goal:"归纳可由馆藏支持的结论，并明确当前资料没有回答的问题。",
      takeaway:"云南少数民族音乐呈现多族群、多形态与生活化特征；本次结论仅限于已选馆藏，不替代完整田野调查。",
      items:resourceSet(selected.slice().reverse(),2)
    }
  ]:[
    {id:"c1",no:"01",title:"研究问题与材料范围",goal:`界定“${theme}”的范围。`,takeaway:`本次成果以${selected.length}项联图云馆藏为主要证据。`,items:resourceSet(selected,2)},
    {id:"c2",no:"02",title:"关键概念与文化背景",goal:"从站内记录建立必要背景。",takeaway:"先由来源明确的馆藏建立背景，再形成解释。",items:resourceSet(selected,3)},
    {id:"c3",no:"03",title:"代表性案例",goal:"用具体资源说明主题。",takeaway:"代表性案例必须与原始素材一一对应。",items:resourceSet(selected,3)},
    {id:"c4",no:"04",title:"比较与分析",goal:"比较不同材料之间的异同。",takeaway:"比较结论只覆盖当前入选样本。",items:resourceSet(selected.slice().reverse(),3)},
    {id:"c5",no:"05",title:"当代价值与问题",goal:"提炼材料体现的当代议题。",takeaway:"当代价值判断需要以馆藏事实和补充资料共同支撑。",items:resourceSet(selected,3)},
    {id:"c6",no:"06",title:"结论与证据边界",goal:"形成结论并标出边界。",takeaway:"保留来源、权限和待核验事项，避免把AI归纳当成原文。",items:resourceSet(selected.slice().reverse(),2)}
  ];
  const chapters=rawChapters.map(chapter=>({
    ...chapter,
    resourceIds:chapter.items.map(item=>item.id),
    points:chapterPoints(chapter.items)
  }));
  return chapters.map(chapter=>{
    const count=chapter.resourceIds.length;
    return {
      ...chapter,items:undefined,status:count?`已绑定${count}项`:"证据不足",state:count?"done":"gap",
      suggestion:count
        ?`按“核心观点—证据要点—原始素材”组织，并把AI归纳与平台原文明确区分。`
        :"当前没有已选证据，请返回检索页补充素材后再生成。"
    };
  });
}

function outlineCoverage(outline=[]){
  if(!outline.length)return 0;
  return Math.round(outline.filter(c=>c.resourceIds?.length).length/outline.length*100);
}

function calculateQualityMetrics(task,outline=[],resources=[]){
  const selected=resources.filter(resource=>resource.selected);
  const chapterCoverage=outlineCoverage(outline);
  const directRelevanceRate=selected.length
    ?Math.round(selected.filter(resource=>resource.directlyRelevant).length/selected.length*100):0;
  const visualEmbedRate=selected.length
    ?Math.round(selected.filter(resource=>resource.coverUrl).length/selected.length*100):0;
  const claimSupportRate=outline.length
    ?Math.round(outline.filter(chapter=>chapter.takeaway&&chapter.points?.length&&chapter.resourceIds?.length).length/outline.length*100):0;
  const ready=chapterCoverage===100&&directRelevanceRate>=80&&visualEmbedRate>=70&&claimSupportRate===100;
  return {chapterCoverage,directRelevanceRate,visualEmbedRate,claimSupportRate,ready};
}

function buildArtifact(task,outline,resources,settings){
  const selected=resources.filter(r=>r.selected);
  const selectedIds=new Set(selected.map(r=>r.id));
  const cleanOutline=outline.map(chapter=>({
    ...chapter,
    resourceIds:(chapter.resourceIds||[]).filter(id=>selectedIds.has(id))
  }));
  const coverage=outlineCoverage(cleanOutline);
  const quality=calculateQualityMetrics(task,cleanOutline,resources);
  const now=new Date();
  return {
    id:`ART-${now.getTime()}`,title:extractThemeTitle(task.topic),
    type:settings.type,layout:settings.layout,
    pages:settings.type==="课程论文"
      ?cleanOutline.length
      :1+cleanOutline.length+Math.max(1,Math.ceil(selected.length/4)),
    requestedSize:Number(settings.pages)||null,
    version:"V2",status:quality.ready?"校验通过":"待补证据",
    createdAt:now.toISOString(),updated:now.toLocaleString("zh-CN"),
    task,outline:cleanOutline,resourceIds:selected.map(r=>r.id),
    evidence:selected.map(r=>({...r})),coverage,quality
  };
}

Object.assign(window,{
  PLATFORM_ORIGIN,VERIFIED_SNAPSHOT_RESOURCES,searchPlatformResources,
  extractThemeTitle,buildSearchQueries,buildOutline,outlineCoverage,calculateQualityMetrics,buildArtifact
});
