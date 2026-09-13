function CreateScreen({onStart,notify,demoStrategy}){
  const [topic,setTopic]=React.useState("制作一个10分钟的“云南少数民族音乐传承与当代发展”课程展示");
  const [type,setType]=React.useState("PPT展示");
  const [duration,setDuration]=React.useState("10分钟");
  const [level,setLevel]=React.useState("本科一年级");
  const [citation,setCitation]=React.useState("GB/T 7714");
  const [errors,setErrors]=React.useState({});
  const payload={topic,type,duration,level,citation};
  const submit=()=>{
    const next={};
    if(topic.trim().length<8)next.topic="请至少输入8个字，说明主题或完整作业要求";
    if(!duration.trim())next.duration="请填写展示时长或论文篇幅";
    setErrors(next);
    if(Object.keys(next).length)return notify("请补充必填信息后再开始检索");
    onStart(payload);
  };
  const saveDraft=()=>{
    localStorage.setItem("culture-path-draft",JSON.stringify(payload));
    notify("任务草稿已保存到当前浏览器");
  };
  return <main className="page" data-screen-label="01 任务创建">
    <div className="app-breadcrumb">AI研学创作 <span>/</span> 新建任务</div>
    <Stepper step={1}/>
    <PageTitle eyebrow="NEW RESEARCH TASK" title="从一个主题开始，找到可以引用的馆藏证据" subtitle="输入作业要求后，系统将实时检索联图云中的视频、音频、图片与资源专辑。"/>
    <div className="grid-2">
      <section className="card">
        <div className="card-title"><div><h2>创建研学创作任务</h2><p>可以直接粘贴课程作业的完整要求。</p></div><Chip active>功能MVP</Chip></div>
        <div className="form-grid">
          <div className="field span-12"><label>主题或作业要求 <span className="required">*</span></label><textarea className="textarea" value={topic} onChange={e=>setTopic(e.target.value)}></textarea>{errors.topic?<span className="help" style={{color:"var(--seal)"}}>{errors.topic}</span>:<span className="help">建议同时写明主题、成果类型、时长或篇幅。</span>}</div>
          <div className="field span-12"><label>成果类型 <span className="required">*</span></label><div className="segmented">{["PPT展示","课程论文","研学报告"].map(v=><button key={v} className={"segment "+(type===v?"active":"")} onClick={()=>setType(v)}>{v}</button>)}</div></div>
          <div className="field span-3"><label>{type==="课程论文"?"目标篇幅":"展示时长"} <span className="required">*</span></label><input className="input" value={duration} onChange={e=>setDuration(e.target.value)}/>{errors.duration&&<span className="help" style={{color:"var(--seal)"}}>{errors.duration}</span>}</div>
          <div className="field span-3"><label>课程层级</label><select className="select" value={level} onChange={e=>setLevel(e.target.value)}><option>本科一年级</option><option>本科高年级</option><option>研究生课程</option></select></div>
          <div className="field span-3"><label>引用格式</label><select className="select" value={citation} onChange={e=>setCitation(e.target.value)}><option>GB/T 7714</option><option>APA 第7版</option><option>MLA 第9版</option></select></div>
          <div className="field span-3"><label>写作语言</label><select className="select"><option>中文</option><option>中英双语摘要</option></select></div>
        </div>
        <div style={{marginTop:18}}><Notice>模板匹配属于后台策略。当前测试策略为“{demoStrategy}”；没有合格模板时仍会依据实时检索结果从零生成。</Notice></div>
        <div className="actions"><Button onClick={saveDraft}>保存草稿</Button><Button variant="primary" icon="arrow" onClick={submit}>开始实时检索</Button></div>
      </section>
      <aside className="card flat">
        <div className="card-title"><div><h2>任务摘要</h2><p>根据当前输入实时整理。</p></div></div>
        <div className="summary-list">
          <div className="summary-item"><span className="summary-icon">1</span><div><b>主题识别</b><span>{extractThemeTitle(topic)}</span></div><Chip active>已识别</Chip></div>
          <div className="summary-item"><span className="summary-icon">2</span><div><b>成果要求</b><span>{type} · {duration}</span></div><Chip active>已设置</Chip></div>
          <div className="summary-item"><span className="summary-icon">3</span><div><b>检索范围</b><span>联图云公开视频、音频、图片与专辑</span></div><Chip active>实时</Chip></div>
          <div className="summary-item"><span className="summary-icon">4</span><div><b>证据要求</b><span>每个正式章节至少绑定1项站内记录</span></div><Chip>待检索</Chip></div>
        </div>
        <div className="divider"></div><div className="archive-note"><h3>为什么先找证据，再生成内容？</h3><p>大纲和成果只能使用实际召回且由用户保留的素材。MVP摘要与平台原始简介会分开标注。</p></div>
      </aside>
    </div>
  </main>;
}

function SearchScreen({resources,onToggle,onPreview,onNext,query,searchMeta,onRetry}){
  const allTypes=["视频","图片","音频"];
  const presentTypes=[...new Set(resources.map(r=>r.type))];
  const [media,setMedia]=React.useState(allTypes);
  const [keyword,setKeyword]=React.useState("");
  const [onlyPreview,setOnlyPreview]=React.useState(false);
  const shown=resources.filter(r=>media.includes(r.type)&&(!keyword||r.title.includes(keyword)||r.tags.some(t=>t.includes(keyword))||r.desc.includes(keyword))&&(!onlyPreview||r.coverUrl));
  const selected=resources.filter(r=>r.selected).length;
  return <main className="page" data-screen-label="02 站内检索">
    <Stepper step={2}/>
    <PageTitle eyebrow="INSTITUTION SEARCH" title="已找到可回到原站核验的馆藏记录"
      subtitle={"检索主题“"+(searchMeta.query||extractThemeTitle(query))+"” · "+searchMeta.label+" · "+searchMeta.searchedAt}
      actions={<><Button icon="search" onClick={onRetry}>重新实时检索</Button><Button variant="primary" icon="spark" disabled={selected<3} onClick={onNext}>生成素材化大纲</Button></>}/>
    <div className="metric-strip"><div className="metric"><b>{searchMeta.total}</b><span>平台命中总量</span></div><div className="metric"><b>{presentTypes.length}</b><span>本页媒介类型</span></div><div className="metric"><b>{Math.min(96,55+selected*7)}%</b><span>当前证据充分度</span></div><div className="metric"><b>{selected}</b><span>已选入大纲</span></div></div>
    {searchMeta.mode==="live"?<Notice>当前结果来自联图云实时接口。资源编号和详情链接均保留；播放、下载与嵌入权限以登录后的平台展示为准。</Notice>:<Notice warn>实时接口暂不可用，当前显示2026-09-13已核验的联图云快照样本，仅用于保证MVP流程可继续测试。</Notice>}
    <div className="search-layout" style={{marginTop:16}}>
      <aside className="card filter-panel">
        <div className="card-title"><div><h2>筛选资源</h2><p>当前加载前{resources.length}项高相关记录。</p></div></div>
        <div className="filter-group"><h3>媒介类型</h3>{allTypes.map(t=><label className="filter-option" key={t}><span>{t}{presentTypes.includes(t)?"":"（本页无）"}</span><input type="checkbox" checked={media.includes(t)} onChange={()=>setMedia(v=>v.includes(t)?v.filter(x=>x!==t):[...v,t])}/></label>)}</div>
        <div className="filter-group"><h3>预览条件</h3><label className="filter-option"><span>仅看有封面的记录</span><input type="checkbox" checked={onlyPreview} onChange={e=>setOnlyPreview(e.target.checked)}/></label></div>
        <div className="filter-group"><h3>站外补充</h3><label className="filter-option disabled"><span>本轮MVP不混入站外素材</span><input type="checkbox" disabled/></label><p className="help">先验证联图云特色资源能否独立支持课程作业。</p></div>
      </aside>
      <section>
        <div className="search-toolbar"><div className="search-input"><Icon name="search"/><input className="input" placeholder="在当前结果中搜索标题、简介或标签" value={keyword} onChange={e=>setKeyword(e.target.value)}/></div><div className="chip-row"><Chip active>相关性优先</Chip><Chip>来源可回溯</Chip><Chip>权限待核验</Chip></div></div>
        <div className="resource-list">{shown.map(r=><ResourceCard key={r.id} resource={r} onPreview={onPreview} onToggle={onToggle}/>)}</div>
        {shown.length===0&&<div className="card empty">没有符合当前筛选条件的资源，请恢复媒介类型或清空搜索词。</div>}
        <div className="sticky-bottom"><div><b>已选 {selected} 项素材</b><div style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>至少选择3项；生成前可逐项打开联图云原始详情核验。</div></div><Button icon="spark" disabled={selected<3} onClick={onNext}>生成素材化大纲</Button></div>
      </section>
    </div>
  </main>;
}

function WorkspaceScreen({resources,outline,task,onToggle,onPreview,onGenerate,onDownloadPack,evidenceThread}){
  const selectedIds=new Set(resources.filter(r=>r.selected).map(r=>r.id));
  const effective=outline.map(c=>({...c,resourceIds:c.resourceIds.filter(id=>selectedIds.has(id))}));
  const [chapterId,setChapterId]=React.useState(effective[0]?.id);
  const [tab,setTab]=React.useState("平台原始简介");
  React.useEffect(()=>{if(!effective.some(c=>c.id===chapterId))setChapterId(effective[0]?.id)},[outline]);
  const chapter=effective.find(c=>c.id===chapterId)||effective[0];
  const chapterResources=(chapter?.resourceIds||[]).map(id=>resources.find(r=>r.id===id)).filter(Boolean);
  const selected=resources.filter(r=>r.selected);
  const coverage=outlineCoverage(effective);
  const currentEvidence=chapterResources[0]||selected[0];
  const missing=effective.filter(c=>!c.resourceIds.length);
  const counts=selected.reduce((acc,r)=>{acc[r.type]=(acc[r.type]||0)+1;return acc},{});
  return <main className="page" data-screen-label="03 素材化大纲工作台">
    <Stepper step={3}/>
    <PageTitle eyebrow="EVIDENCE-BACKED OUTLINE" title="素材化大纲工作台" subtitle={"围绕“"+extractThemeTitle(task.topic)+"”逐章确认论点与真实站内证据。"}
      actions={<><Button icon="download" onClick={onDownloadPack}>下载真实素材包</Button><Button variant="primary" icon="spark" disabled={coverage<75} onClick={onGenerate}>生成成果</Button></>}/>
    <div className="workspace">
      <aside className="card outline-panel">
        <div className="card-title"><div><h2>章节大纲</h2><p>证据覆盖 {coverage}%</p></div><Chip seal={missing.length>0}>{missing.length?"缺口"+missing.length+"章":"已覆盖"}</Chip></div>
        <div className="coverage"><span style={{width:coverage+"%"}}></span></div>
        <div className={"outline-list "+(evidenceThread?"threaded":"")} style={{marginTop:14}}>{effective.map(c=><button key={c.id} className={"outline-item "+(c.id===chapter?.id?"active ":"")+(c.resourceIds.length?"done":"gap")} onClick={()=>setChapterId(c.id)}><b>{c.no}　{c.title}</b><span>{c.resourceIds.length?"已绑定"+c.resourceIds.length+"项":"证据不足"}</span></button>)}</div>
      </aside>
      <section className="workspace-main">
        <div className="card section-brief"><div><div className="eyebrow">CURRENT SECTION · {chapter?.no}</div><h2>{chapter?.title}</h2><p className="subhead">{chapter?.goal}</p></div><Chip active>{chapterResources.length}项证据</Chip></div>
        {chapterResources.length?chapterResources.map(r=><article key={r.id} className="material-card selected">
          <div className="material-preview"><ResourceThumb resource={r}/></div>
          <div className="material-body"><div className="material-top"><div><div className="chip-row"><Chip active>{r.type}</Chip><Chip>{r.rights}</Chip></div><h3 style={{marginTop:8}}>{r.title}</h3></div><button className="select-box on" onClick={()=>onToggle(r.id)} aria-label="移出已选"><Icon name="check" size={15}/></button></div><p>{r.desc}</p><div className="meta-line"><span>{r.source}</span><span>{r.time}</span><span>编号 {r.id}</span></div><div className="card-actions"><Button small icon="play" onClick={()=>onPreview(r)}>预览证据</Button><Button small onClick={()=>window.open(r.detailUrl,"_blank","noopener")}>打开联图云原始页</Button></div></div>
        </article>):<div className="card empty"><h3>本章还没有绑定素材</h3><p>请返回检索页保留更多证据，或重建素材化大纲。</p></div>}
        <div className="card"><div className="card-title"><div><h2>本章生成建议</h2><p>建议只负责组织内容，不替代平台原始记录。</p></div><Chip active>MVP规则生成</Chip></div><p>{chapter?.suggestion}</p></div>
      </section>
      <aside className="card evidence-panel">
        <div className="card-title"><div><h2>来源与证据</h2><p>{selected.length}项素材已选</p></div></div>
        <div className="chip-row"><Chip active>联图云站内</Chip><Chip>可追溯</Chip><Chip>权限待账号核验</Chip></div>
        {currentEvidence?<><div className="divider"></div><h3>当前证据</h3><p className="subhead">{currentEvidence.title} · {currentEvidence.id}</p>
          <div className="evidence-tabs"><button className={"segment "+(tab==="平台原始简介"?"active":"")} onClick={()=>setTab("平台原始简介")}>平台原始简介</button><button className={"segment "+(tab==="MVP摘要"?"active":"")} onClick={()=>setTab("MVP摘要")}>MVP摘要</button></div>
          <div className="evidence-quote">{tab==="平台原始简介"?currentEvidence.excerpt:currentEvidence.aiSummary}</div>
          <div className="divider"></div><div className="rights-grid"><span>来源</span><b>{currentEvidence.source}</b><span>时间/数量</span><b>{currentEvidence.time}</b><span>资源年份</span><b>{currentEvidence.publishYear}</b><span>使用权限</span><b>{currentEvidence.rights}</b></div>
          <div className="actions"><Button small onClick={()=>window.open(currentEvidence.detailUrl,"_blank","noopener")}>去联图云核验</Button></div>
        </>:<div className="empty">尚无已选证据。</div>}
        {missing.length>0&&<><div className="divider"></div><Notice warn>{missing.map(c=>c.title).join("、")}仍无证据，建议补齐后再生成正式成果。</Notice></>}
      </aside>
    </div>
    <div className="sticky-bottom"><div><b>已选 {selected.length} 项　·　视频 {counts["视频"]||0}　·　图片 {counts["图片"]||0}　·　音频 {counts["音频"]||0}</b><div style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>证据覆盖 {coverage}% · 引用均保留联图云详情链接</div></div><div style={{display:"flex",gap:8}}><Button icon="download" onClick={onDownloadPack}>下载素材包</Button><Button icon="spark" disabled={coverage<75} onClick={onGenerate}>生成成果</Button></div></div>
  </main>;
}

function ResultScreen({artifact,resources,onLibrary,onFeedback,onDownload,onDownloadPack}){
  const [slide,setSlide]=React.useState(0);
  if(!artifact)return <main className="page"><div className="card empty"><h2>还没有生成成果</h2><p>请先完成检索和素材化大纲。</p><Button variant="primary" onClick={onLibrary}>查看我的成果</Button></div></main>;
  const slides=[{title:"封面",goal:artifact.title,resourceIds:[]},...artifact.outline];
  const current=slides[slide]||slides[0];
  const sourcePool=artifact.evidence||resources;
  const currentItems=(current.resourceIds||[]).map(id=>sourcePool.find(r=>r.id===id)).filter(Boolean);
  const evidence=artifact.evidence||resources.filter(r=>artifact.resourceIds.includes(r.id));
  const passed=artifact.coverage===100&&evidence.length>=3;
  return <main className="page" data-screen-label="04 成果生成与下载">
    <Stepper step={4}/>
    <PageTitle eyebrow="GENERATED ARTIFACT" title="成果已生成，可立即下载验证" subtitle={artifact.type+" · "+artifact.pages+"页/章节 · "+artifact.version+" · 保存于 "+artifact.updated}
      actions={<><Button onClick={onFeedback} icon="feedback">反馈问题</Button><Button variant="primary" icon="archive" onClick={onLibrary}>查看我的成果</Button></>}/>
    <div className="result-layout">
      <section className="card">
        <div className="card-title"><div><h2>成果结构预览</h2><p>{artifact.title}</p></div><div className="chip-row"><Chip active>已保存</Chip><Chip>{artifact.layout}</Chip></div></div>
        <div className="slide-rail">{slides.map((s,i)=><button key={s.title+i} className={"slide-thumb "+(slide===i?"active":"")} onClick={()=>setSlide(i)}><span className="slide-no">{String(i+1).padStart(2,"0")}</span><b>{s.title}</b><span className="help">{i===0?"任务与证据概况":"绑定"+s.resourceIds.length+"项证据"}</span></button>)}</div>
        <div className="slide-preview"><div className="slide-visual"></div><div className="slide-copy"><div className="eyebrow">PAGE {String(slide+1).padStart(2,"0")}</div><h2>{current.title}</h2><p>{current.goal}</p>{currentItems.length?<ul>{currentItems.slice(0,3).map(r=><li key={r.id}>{r.title}（{r.type}）</li>)}</ul>:<ul><li>{artifact.task.type} · {artifact.task.duration}</li><li>{evidence.length}项联图云证据</li><li>证据覆盖率 {artifact.coverage}%</li></ul>}<div className="citation">{currentItems.length?"引用："+currentItems.map(r=>r.id).join("、"):"引用与权限说明保留在成果末页"}</div></div></div>
      </section>
      <aside className="card">
        <div className="card-title"><div><h2>生成校验</h2><p>{passed?"核心校验已通过。":"仍有项目需要补齐。"}</p></div><Chip active={passed}>{passed?"4/4":"3/4"}</Chip></div>
        <div className="check-list">{[
          ["文件结构",artifact.type==="课程论文"?"可编辑Word稿":"可编辑PPTX"],
          ["证据映射","章节覆盖率"+artifact.coverage+"%"],
          ["引用回溯",evidence.length+"项资源均保留原始链接"],
          ["版权边界","媒体文件不越权复制，权限回到原站核验"]
        ].map(pair=><div className="check-item" key={pair[0]}><span className="check-mark"><Icon name="check" size={14}/></span><div><b>{pair[0]}</b><span>{pair[1]}</span></div></div>)}</div>
        <div className="divider"></div><Notice>后台可在获得真实使用反馈后，将高质量成果标记为模板候选；用户侧无需执行模板保存操作。</Notice>
        <div className="result-actions"><Button variant="primary" icon="download" onClick={onDownload}>{artifact.type==="课程论文"?"下载可编辑论文稿":"下载可编辑PPTX"}</Button><Button icon="download" onClick={onDownloadPack}>下载素材包ZIP</Button><Button className="full" icon="feedback" onClick={onFeedback}>提交测试反馈</Button></div>
      </aside>
    </div>
  </main>;
}

function LibraryScreen({artifacts,onOpen,onCreate,onDownload}){
  return <main className="page" data-screen-label="05 我的成果">
    <PageTitle eyebrow="MY ARTIFACTS" title="我的成果" subtitle="成果保存在当前浏览器，可打开、再次下载并用于本轮测试。" actions={<Button variant="primary" icon="spark" onClick={onCreate}>新建创作</Button>}/>
    {artifacts.length?<div className="library-grid">{artifacts.map(a=><article className="artifact-card" key={a.id}><div className="artifact-cover">{a.title}</div><div className="artifact-body"><div className="chip-row"><Chip active>{a.type}</Chip><Chip>{a.status}</Chip></div><h3 style={{marginTop:12}}>{a.title}</h3><p>{a.pages}页/章节 · {a.version} · {a.updated}</p><div className="actions" style={{justifyContent:"flex-start"}}><Button small onClick={()=>onOpen(a)}>打开</Button><Button small icon="download" onClick={()=>onDownload(a)}>下载</Button></div></div></article>)}</div>:<div className="card empty"><h2>暂时没有成果</h2><p>完成一次“检索—大纲—生成”后，成果会自动保存在这里。</p><Button variant="primary" onClick={onCreate}>创建第一个成果</Button></div>}
  </main>;
}

function GenerateModal({onClose,onGenerate,defaultType="PPT",coverage=0}){
  const [type,setType]=React.useState(defaultType);
  const [layout,setLayout]=React.useState("馆藏叙事");
  const [pages,setPages]=React.useState(6);
  return <Modal title="设置成果生成方式" onClose={onClose} actions={<><Button onClick={onClose}>返回大纲</Button><Button variant="primary" icon="spark" onClick={()=>onGenerate({type,layout,pages})}>开始生成</Button></>}>
    <div className="form-grid">
      <div className="field span-12"><label>成果类型</label><div className="segmented">{["PPT","课程论文"].map(v=><button className={"segment "+(type===v?"active":"")} onClick={()=>setType(v)} key={v}>{v}</button>)}</div></div>
      <div className="field span-6"><label>基础版式</label><select className="select" value={layout} onChange={e=>setLayout(e.target.value)}><option>馆藏叙事</option><option>研究汇报</option><option>图文简报</option></select></div>
      <div className="field span-6"><label>{type==="PPT"?"预计页数":"预计章节数"}</label><input className="input" type="number" min="4" max="30" value={pages} onChange={e=>setPages(Number(e.target.value))}/></div>
    </div>
    <div style={{marginTop:16}}>{coverage===100?<Notice>全部正式章节均已绑定证据，可以生成并下载测试。</Notice>:<Notice warn>当前证据覆盖率{coverage}%。MVP允许继续生成，但会在成果中保留缺口提示。</Notice>}</div>
  </Modal>;
}

function FeedbackModal({artifact,onClose,notify}){
  const [kind,setKind]=React.useState("内容不准确");
  const [detail,setDetail]=React.useState("");
  const submit=()=>{
    const id="FB-"+Date.now();
    let list=[];
    try{list=JSON.parse(localStorage.getItem("culture-path-feedback")||"[]")}catch{}
    list.unshift({id,artifactId:artifact?.id||null,kind,detail,createdAt:new Date().toISOString()});
    localStorage.setItem("culture-path-feedback",JSON.stringify(list.slice(0,100)));
    notify("反馈已保存，编号 "+id);
    onClose();
  };
  return <Modal title="提交功能测试反馈" onClose={onClose} actions={<><Button onClick={onClose}>取消</Button><Button variant="primary" disabled={!detail.trim()} onClick={submit}>保存反馈</Button></>}>
    <div className="field"><label>问题类型</label><select className="select" value={kind} onChange={e=>setKind(e.target.value)}><option>内容不准确</option><option>引用无法定位</option><option>检索结果不相关</option><option>版权或文化安全</option><option>文件无法打开</option><option>操作不清楚</option></select></div>
    <div className="field" style={{marginTop:14}}><label>问题说明 <span className="required">*</span></label><textarea className="textarea" value={detail} onChange={e=>setDetail(e.target.value)} placeholder="请说明具体页面、章节或素材，以及你观察到的问题。"></textarea></div>
    <p className="help">本轮反馈保存在当前浏览器；接入账号体系后再同步到项目后台。</p>
  </Modal>;
}

Object.assign(window,{CreateScreen,SearchScreen,WorkspaceScreen,ResultScreen,LibraryScreen,GenerateModal,FeedbackModal});
