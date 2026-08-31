function CreateScreen({onStart,notify,demoStrategy}){
  const [topic,setTopic]=React.useState("制作一个10分钟的“云南少数民族音乐传承与当代发展”课程展示");
  const [type,setType]=React.useState("PPT展示");
  const [duration,setDuration]=React.useState("10分钟");
  const [level,setLevel]=React.useState("本科一年级");
  const [citation,setCitation]=React.useState("GB/T 7714");
  const [errors,setErrors]=React.useState({});
  const submit=()=>{
    const next={};
    if(topic.trim().length<8)next.topic="请至少输入8个字，说明主题或完整作业要求";
    if(!duration.trim())next.duration="请填写展示时长或论文篇幅";
    setErrors(next);
    if(Object.keys(next).length)return notify("请补充必填信息后再开始检索");
    onStart({topic,type,duration,level,citation});
  };
  return <main className="page" data-screen-label="01 任务创建">
    <div className="app-breadcrumb">AI研学创作 <span>/</span> 新建任务</div>
    <Stepper step={1}/>
    <PageTitle eyebrow="NEW RESEARCH TASK" title="从一个主题开始，找到可以引用的馆藏证据" subtitle="输入作业要求后，系统会在当前机构权限内检索图片、视频、音频、文献和口述资料。"/>
    <div className="grid-2">
      <section className="card">
        <div className="card-title"><div><h2>创建研学创作任务</h2><p>可以直接粘贴教师布置的完整作业要求。</p></div><Chip active>约 2 分钟完成设置</Chip></div>
        <div className="form-grid">
          <div className="field span-12"><label>主题或作业要求 <span className="required">*</span></label><textarea className="textarea" value={topic} onChange={e=>setTopic(e.target.value)}></textarea>{errors.topic?<span className="help" style={{color:"var(--seal)"}}>{errors.topic}</span>:<span className="help">示例：制作一个10分钟的云南少数民族音乐课程展示，要求有真实馆藏图片和视频片段。</span>}</div>
          <div className="field span-12"><label>成果类型 <span className="required">*</span></label><div className="segmented">{["PPT展示","课程论文","研学报告"].map(v=><button key={v} className={`segment ${type===v?"active":""}`} onClick={()=>setType(v)}>{v}</button>)}</div></div>
          <div className="field span-3"><label>{type==="课程论文"?"目标篇幅":"展示时长"} <span className="required">*</span></label><input className="input" value={duration} onChange={e=>setDuration(e.target.value)}/>{errors.duration&&<span className="help" style={{color:"var(--seal)"}}>{errors.duration}</span>}</div>
          <div className="field span-3"><label>课程层级</label><select className="select" value={level} onChange={e=>setLevel(e.target.value)}><option>本科一年级</option><option>本科高年级</option><option>研究生课程</option></select></div>
          <div className="field span-3"><label>引用格式</label><select className="select" value={citation} onChange={e=>setCitation(e.target.value)}><option>GB/T 7714</option><option>APA 第7版</option><option>MLA 第9版</option></select></div>
          <div className="field span-3"><label>写作语言</label><select className="select"><option>中文</option><option>中英双语摘要</option></select></div>
          <div className="field span-12"><label>限定条件</label><div className="chip-row"><Chip active>地域：云南</Chip><Chip active>资源：站内优先</Chip><Chip>添加民族</Chip><Chip>添加年代</Chip></div></div>
        </div>
        <div style={{marginTop:18}}><Notice>系统会自动选择生成策略；当前演示状态为“{demoStrategy}”。没有合格模板时直接走完整从零生成链路，不影响用户完成任务。</Notice></div>
        <div className="actions"><Button onClick={()=>notify("草稿已保存到当前浏览器")}>保存草稿</Button><Button variant="primary" icon="arrow" onClick={submit}>开始站内检索</Button></div>
      </section>
      <aside className="card flat">
        <div className="card-title"><div><h2>任务摘要</h2><p>系统根据输入实时识别。</p></div></div>
        <div className="summary-list">
          <div className="summary-item"><span className="summary-icon">1</span><div><b>主题识别</b><span>云南 / 少数民族音乐 / 传承</span></div><Chip active>清晰</Chip></div>
          <div className="summary-item"><span className="summary-icon">2</span><div><b>成果要求</b><span>{type} · {duration}</span></div><Chip active>已设置</Chip></div>
          <div className="summary-item"><span className="summary-icon">3</span><div><b>检索范围</b><span>当前机构有权访问的站内资源</span></div><Chip active>权限内</Chip></div>
          <div className="summary-item"><span className="summary-icon">4</span><div><b>证据要求</b><span>每个正式章节至少绑定1项馆藏证据</span></div><Chip>待检索</Chip></div>
        </div>
        <div className="divider"></div>
        <div className="archive-note"><h3>为什么先找证据，再生成内容？</h3><p>文化寻脉不会先写结论再补来源。大纲和成果只使用实际召回、用户确认且权限可用的素材。</p></div>
      </aside>
    </div>
  </main>;
}

function SearchScreen({resources,onToggle,onPreview,onNext,notify,query}){
  const [media,setMedia]=React.useState(["视频","图片","文献","音频","口述"]);
  const [keyword,setKeyword]=React.useState("");
  const [onlyDownload,setOnlyDownload]=React.useState(false);
  const [external,setExternal]=React.useState(false);
  const toggleMedia=t=>setMedia(v=>v.includes(t)?v.filter(x=>x!==t):[...v,t]);
  const shown=resources.filter(r=>media.includes(r.type)&&(!keyword||r.title.includes(keyword)||r.tags.some(t=>t.includes(keyword)))&&(!onlyDownload||!r.download.includes("受控")&&!r.download.includes("链接")));
  const selected=resources.filter(r=>r.selected).length;
  return <main className="page" data-screen-label="02 站内检索">
    <Stepper step={2}/>
    <PageTitle eyebrow="INSTITUTION SEARCH" title="已找到可核验的站内证据" subtitle={`围绕“${query||"云南少数民族音乐"}”检索，结果已按当前机构权限过滤。素材与数量为原型示例。`}
      actions={<><Button icon="search" onClick={()=>notify("已按当前条件重新检索")}>重新检索</Button><Button variant="primary" icon="spark" disabled={selected<3} onClick={onNext}>生成素材化大纲</Button></>}/>
    <div className="metric-strip"><div className="metric"><b>28</b><span>站内相关资源</span></div><div className="metric"><b>5</b><span>媒介类型</span></div><div className="metric"><b>92%</b><span>主题证据充分度</span></div><div className="metric"><b>{selected}</b><span>已选入大纲</span></div></div>
    <Notice>后台策略检查已完成：即使模板库为空，系统也会依据当前检索结果从零规划大纲。用户不需要处理模板问题。</Notice>
    <div className="search-layout" style={{marginTop:16}}>
      <aside className="card filter-panel">
        <div className="card-title"><div><h2>筛选资源</h2><p>先权限过滤，再进行相关性排序。</p></div></div>
        <div className="filter-group"><h3>媒介类型</h3>{["视频","图片","文献","音频","口述"].map(t=><label className="filter-option" key={t}><span>{t}</span><input type="checkbox" checked={media.includes(t)} onChange={()=>toggleMedia(t)}/></label>)}</div>
        <div className="filter-group"><h3>使用权限</h3><label className="filter-option"><span>仅看可下载素材</span><input type="checkbox" checked={onlyDownload} onChange={e=>setOnlyDownload(e.target.checked)}/></label></div>
        <div className="filter-group"><h3>站外补充</h3><label className="filter-option"><span>启用外部材料</span><input type="checkbox" checked={external} onChange={e=>{setExternal(e.target.checked);notify(e.target.checked?"站外补充已开启，外部来源将独立标识":"已恢复站内优先")}}/></label><p className="help">默认关闭；本原型不实际访问外网。</p></div>
      </aside>
      <section>
        <div className="search-toolbar"><div className="search-input"><Icon name="search"/><input className="input" placeholder="在结果中搜索标题或标签" value={keyword} onChange={e=>setKeyword(e.target.value)}/></div><div className="chip-row"><Chip active>相关性优先</Chip><Chip>权威性</Chip><Chip>媒介多样性</Chip></div></div>
        <div className="resource-list">{shown.map(r=><ResourceCard key={r.id} resource={r} onPreview={onPreview} onToggle={onToggle}/>)}</div>
        {shown.length===0&&<div className="card empty">没有符合当前筛选条件的资源。请恢复媒介类型或清空搜索词。</div>}
        <div className="sticky-bottom"><div><b>已选 {selected} 项素材</b><div style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>至少选择3项后可生成素材化大纲；正式章节仍需逐章补齐证据。</div></div><Button icon="spark" disabled={selected<3} onClick={onNext}>生成素材化大纲</Button></div>
      </section>
    </div>
  </main>;
}

function WorkspaceScreen({resources,onToggle,onPreview,onGenerate,notify,evidenceThread}){
  const [chapter,setChapter]=React.useState(PROTOTYPE_CHAPTERS[0]);
  const [tab,setTab]=React.useState("原始字幕");
  const chapterResources=resources.filter(r=>r.chapter===chapter.title);
  const selected=resources.filter(r=>r.selected);
  const coverage=75;
  return <main className="page" data-screen-label="03 素材化大纲工作台">
    <Stepper step={3}/>
    <PageTitle eyebrow="EVIDENCE-BACKED OUTLINE" title="素材化大纲工作台" subtitle="逐章确认论点与馆藏证据。AI摘要、原文/字幕、来源和授权状态同时可见。"
      actions={<><Button icon="download" onClick={()=>notify("素材包已进入模拟打包队列")}>下载素材包</Button><Button variant="primary" icon="spark" onClick={onGenerate}>生成成果</Button></>}/>
    <div className="workspace">
      <aside className="card outline-panel">
        <div className="card-title"><div><h2>章节大纲</h2><p>证据覆盖 {coverage}%</p></div><Chip seal>待补1项</Chip></div>
        <div className="coverage"><span style={{width:`${coverage}%`}}></span></div>
        <div className={`outline-list ${evidenceThread?"threaded":""}`} style={{marginTop:14}}>
          {PROTOTYPE_CHAPTERS.map(c=><button key={c.id} className={`outline-item ${c.id===chapter.id?"active":""} ${c.state}`} onClick={()=>setChapter(c)}><b>{c.no}　{c.title}</b><span>{c.status}</span></button>)}
        </div>
        <div className="actions"><Button small onClick={()=>notify("已新增一个空白章节，可在正式产品中编辑标题")}>新增章节</Button></div>
      </aside>
      <section className="workspace-main">
        <div className="card section-brief"><div><div className="eyebrow">CURRENT SECTION · {chapter.no}</div><h2>{chapter.title}</h2><p className="subhead">{chapter.goal}</p></div><Button small onClick={()=>notify("章节标题与目标已切换为可编辑状态")}>编辑章节</Button></div>
        {chapterResources.length?chapterResources.map(r=><article key={r.id} className={`material-card ${r.selected?"selected":""}`}>
          <div className="material-preview"><ResourceThumb resource={r}/></div>
          <div className="material-body"><div className="material-top"><div><div className="chip-row"><Chip active>{r.type}</Chip><Chip>{r.rights}</Chip></div><h3 style={{marginTop:8}}>{r.title}</h3></div><button className={`select-box ${r.selected?"on":""}`} onClick={()=>onToggle(r.id)} aria-label={r.selected?"取消选择":"选择素材"}>{r.selected&&<Icon name="check" size={15}/>}</button></div><p>{r.desc}</p><div className="meta-line"><span>{r.source}</span><span>{r.time}</span><span>{r.download}</span></div><div className="card-actions"><Button small icon="play" onClick={()=>onPreview(r)}>预览证据</Button><Button small onClick={()=>notify("已为当前章节加载替换素材")}>替换</Button><Button small onClick={()=>notify("素材顺序已调整（原型模拟）")}>调整顺序</Button></div></div>
        </article>):<div className="card empty"><h3>本章还没有绑定素材</h3><p>从站内检索结果中添加证据，或返回修改主题范围。</p><Button onClick={()=>notify("已返回检索建议：可增加“教育”“数字传播”等关键词")}>查找证据</Button></div>}
        <div className="card"><div className="card-title"><div><h2>本章生成建议</h2><p>建议仅帮助组织内容，不替代馆藏原文。</p></div><Chip active>基于已选证据</Chip></div><p>可先用田野视频说明民族音乐与节庆生活的关系，再以馆藏图片呈现乐器与演奏环境，最后引出“传承发生在共同实践中”的研究问题。</p><div className="actions"><Button small onClick={()=>notify("生成建议已加入章节备注")}>采用为章节备注</Button></div></div>
      </section>
      <aside className="card evidence-panel">
        <div className="card-title"><div><h2>来源与证据</h2><p>{selected.length}项素材已选</p></div></div>
        <div className="chip-row"><Chip active>站内馆藏</Chip><Chip>可追溯</Chip><Chip>已鉴权</Chip></div>
        <div className="divider"></div><h3>当前证据片段</h3><p className="subhead">滇南民歌田野记录 · V-20418</p>
        <div className="evidence-tabs"><button className={`segment ${tab==="原始字幕"?"active":""}`} onClick={()=>setTab("原始字幕")}>原始字幕</button><button className={`segment ${tab==="AI摘要"?"active":""}`} onClick={()=>setTab("AI摘要")}>AI摘要</button></div>
        <div className="evidence-quote">{tab==="原始字幕"?"“由年长歌者带领青年共同演唱，学习发生在节庆与日常生活之中。”":"该片段支持“社区参与和代际传承”论点。此内容为AI摘要，需结合原始字幕使用。"}</div>
        <div className="divider"></div><div className="rights-grid"><span>来源</span><b>云南民族文化影像馆</b><span>时间码</span><b>03:20–04:42</b><span>预览</span><b>允许</b><span>下载</span><b>教学片段</b><span>成果嵌入</span><b>允许</b></div>
        <div className="divider"></div><Notice warn>第3章还缺少1项文献证据。可继续生成素材包，但生成正式成果前建议补齐。</Notice>
      </aside>
    </div>
    <div className="sticky-bottom"><div><b>已选 {selected.length} 项　·　视频 2分58秒　·　图片 1张　·　文献/口述 2项</b><div style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>证据覆盖 {coverage}% · 待修复：传承机制缺少补充文献</div></div><div style={{display:"flex",gap:8}}><Button icon="download" onClick={()=>notify("素材包下载已模拟完成")}>下载素材包</Button><Button icon="spark" onClick={onGenerate}>生成成果</Button></div></div>
  </main>;
}

function ResultScreen({notify,onLibrary,onFeedback}){
  const [slide,setSlide]=React.useState(1);
  const slides=["封面","研究背景","传统音乐形态","传承机制"];
  return <main className="page" data-screen-label="04 成果生成与下载">
    <Stepper step={4}/>
    <PageTitle eyebrow="GENERATED ARTIFACT" title="成果已生成，并通过关键校验" subtitle="PPT初稿、证据映射和素材清单已保存到个人成果库。页面内容为原型示例。"
      actions={<><Button onClick={()=>notify("已创建V2版本，原版本仍可回滚")}>复制为新版本</Button><Button variant="primary" icon="archive" onClick={onLibrary}>查看我的成果</Button></>}/>
    <div className="result-layout">
      <section className="card">
        <div className="card-title"><div><h2>成果预览</h2><p>云南少数民族音乐传承与当代发展 · PPT 12页 · V1</p></div><div className="chip-row"><Chip active>已保存</Chip><Chip>自动保存 20:41</Chip></div></div>
        <div className="slide-rail">{slides.map((s,i)=><button key={s} className={`slide-thumb ${slide===i?"active":""}`} onClick={()=>setSlide(i)}><span className="slide-no">{String(i+1).padStart(2,"0")}</span><b>{s}</b><span className="help">含馆藏证据与引用</span></button>)}</div>
        <div className="slide-preview"><div className="slide-visual"></div><div className="slide-copy"><div className="eyebrow">SLIDE {String(slide+1).padStart(2,"0")}</div><h2>{slides[slide]}</h2><ul><li>云南民族音乐呈现鲜明的地域与场景特征</li><li>社区、节庆和家庭共同构成传承网络</li><li>本页结论绑定3项站内馆藏证据</li></ul><div className="citation">引用：联图云资源 I-7831、V-20418 · 访问日期 2026-08-31</div></div></div>
        <div className="actions" style={{justifyContent:"flex-start"}}><Button onClick={()=>notify(`第${slide+1}页已重新生成，其他页面保持不变`)}>重新生成本页</Button><Button onClick={()=>notify("标题与文字已切换为轻量编辑状态")}>编辑标题与文字</Button><Button onClick={()=>notify("演讲备注已展开（原型模拟）")}>查看演讲备注</Button></div>
      </section>
      <aside className="card">
        <div className="card-title"><div><h2>生成校验</h2><p>所有P0校验已通过。</p></div><Chip active>5/5</Chip></div>
        <div className="check-list">
          {[["文件结构","PPTX可打开 · 12页"],["证据映射","正式章节覆盖率100%"],["引用校验","8项引用均可定位"],["版权权限","1项原文降级为站内链接"],["文化安全","关键实体与表述已检查"]].map(([a,b])=><div className="check-item" key={a}><span className="check-mark"><Icon name="check" size={14}/></span><div><b>{a}</b><span>{b}</span></div></div>)}
        </div>
        <div className="divider"></div><Notice>成果保存后，后台会自动进行质量与成本评估；达到门槛才进入模板候选池。用户无需保存或管理模板。</Notice>
        <div className="result-actions"><Button variant="primary" icon="download" onClick={()=>notify("PPTX下载已模拟完成")}>下载PPTX</Button><Button icon="download" onClick={()=>notify("素材包下载已模拟完成")}>下载素材包</Button><Button className="full" onClick={()=>notify("已创建论文版本生成任务")}>生成论文版本</Button><Button className="full" icon="feedback" onClick={onFeedback}>反馈问题</Button></div>
      </aside>
    </div>
  </main>;
}

function LibraryScreen({onOpen,onCreate,notify}){
  return <main className="page" data-screen-label="05 我的成果">
    <PageTitle eyebrow="MY ARTIFACTS" title="我的成果" subtitle="查看个人任务、生成成果与版本。这里不提供保存为模板或发布模板操作。" actions={<Button variant="primary" icon="spark" onClick={onCreate}>新建创作</Button>}/>
    <div className="library-grid">{PROTOTYPE_ARTIFACTS.map((a,i)=><article className="artifact-card" key={a.id}><div className="artifact-cover">{a.title}</div><div className="artifact-body"><div className="chip-row"><Chip active>{a.type}</Chip><Chip>{a.status}</Chip></div><h3 style={{marginTop:12}}>{a.title}</h3><p>{a.pages} · {a.version} · 更新于 {a.updated}</p><div className="actions" style={{justifyContent:"flex-start"}}><Button small onClick={i===0?onOpen:()=>notify("已打开示例成果详情")}>打开</Button><Button small onClick={()=>notify("已复制一个新版本")}>复制版本</Button><Button small icon="download" onClick={()=>notify("下载已模拟完成")}>下载</Button></div></div></article>)}</div>
  </main>;
}

function GenerateModal({onClose,onGenerate}){
  const [type,setType]=React.useState("PPT");
  const [layout,setLayout]=React.useState("馆藏叙事");
  const [pages,setPages]=React.useState(12);
  return <Modal title="设置成果生成方式" onClose={onClose} actions={<><Button onClick={onClose}>返回大纲</Button><Button variant="primary" icon="spark" onClick={()=>onGenerate({type,layout,pages})}>开始生成</Button></>}>
    <div className="form-grid">
      <div className="field span-12"><label>成果类型</label><div className="segmented">{["PPT","课程论文"].map(v=><button className={`segment ${type===v?"active":""}`} onClick={()=>setType(v)} key={v}>{v}</button>)}</div></div>
      <div className="field span-6"><label>基础版式</label><select className="select" value={layout} onChange={e=>setLayout(e.target.value)}><option>馆藏叙事</option><option>研究汇报</option><option>图文简报</option></select></div>
      <div className="field span-6"><label>{type==="PPT"?"目标页数":"目标字数"}</label><input className="input" type="number" value={pages} onChange={e=>setPages(Number(e.target.value))}/></div>
    </div>
    <div style={{marginTop:16}}><Notice warn>第3章仍有证据缺口。原型允许继续生成，并在成果中标记待补充；生产环境可按课程配置决定是否阻断。</Notice></div>
  </Modal>;
}

function FeedbackModal({onClose,notify}){
  const [kind,setKind]=React.useState("内容不准确");const [detail,setDetail]=React.useState("");
  return <Modal title="反馈成果问题" onClose={onClose} actions={<><Button onClick={onClose}>取消</Button><Button variant="primary" disabled={!detail.trim()} onClick={()=>{notify("反馈已提交，编号 FB-20260831-017");onClose()}}>提交反馈</Button></>}>
    <div className="field"><label>问题类型</label><select className="select" value={kind} onChange={e=>setKind(e.target.value)}><option>内容不准确</option><option>引用无法定位</option><option>时间码有误</option><option>版权或文化安全</option><option>排版问题</option></select></div>
    <div className="field" style={{marginTop:14}}><label>问题说明 <span className="required">*</span></label><textarea className="textarea" value={detail} onChange={e=>setDetail(e.target.value)} placeholder="请说明具体页面、章节或素材，以及你观察到的问题。"></textarea></div>
  </Modal>;
}

Object.assign(window,{CreateScreen,SearchScreen,WorkspaceScreen,ResultScreen,LibraryScreen,GenerateModal,FeedbackModal});