function Icon({name,size=18}){
  const paths={
    search:<><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></>,
    arrow:<><path d="M5 12h14"></path><path d="m14 7 5 5-5 5"></path></>,
    check:<path d="m5 12 4 4L19 6"></path>,
    close:<><path d="m6 6 12 12"></path><path d="m18 6-12 12"></path></>,
    play:<path d="m8 5 11 7-11 7Z"></path>,
    download:<><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></>,
    spark:<><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Z"></path><path d="m18 15 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8Z"></path></>,
    file:<><path d="M7 3h7l4 4v14H7Z"></path><path d="M14 3v5h5"></path></>,
    book:<><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z"></path><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z"></path></>,
    feedback:<><path d="M4 5h16v11H8l-4 4Z"></path><path d="M8 9h8"></path><path d="M8 12h5"></path></>,
    clock:<><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></>,
    shield:<><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6Z"></path><path d="m9 12 2 2 4-4"></path></>,
    layout:<><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M8 4v16"></path><path d="M8 10h13"></path></>,
    archive:<><path d="M4 7h16v14H4Z"></path><path d="M3 3h18v4H3Z"></path><path d="M9 11h6"></path></>
  };
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{paths[name]||paths.file}</svg>;
}

function Button({children,variant="",small=false,icon,onClick,disabled=false,className="",type="button"}){
  return <button type={type} className={`btn ${variant} ${small?"small":""} ${className}`} onClick={onClick} disabled={disabled}>
    {icon&&<Icon name={icon}/>}<span>{children}</span>
  </button>;
}

function AppHeader({screen,onNavigate}){
  return <header className="topbar">
    <div className="brand">
      <div className="brand-mark"><span></span></div>
      <div>
        <div className="brand-title">中华优秀民族文化</div>
        <div className="product-name">联图云 · 文化寻脉</div>
      </div>
    </div>
    <nav className="topnav" aria-label="主导航">
      <button className={`nav-btn ${screen!=="library"?"active":""}`} onClick={()=>onNavigate("create")}>AI研学创作</button>
      <button className="nav-btn" onClick={()=>onNavigate("search")}>特色资源</button>
      <button className={`nav-btn ${screen==="library"?"active":""}`} onClick={()=>onNavigate("library")}>我的成果</button>
    </nav>
    <div className="user-area"><span>示范大学图书馆</span><div className="avatar">冯</div></div>
  </header>;
}

function Stepper({step}){
  const items=["创建任务","站内检索","素材大纲","生成成果","保存完成"];
  return <div className="stepper" aria-label="任务进度">
    {items.map((item,i)=>{
      const n=i+1;const state=n<step?"done":n===step?"current":"";
      return <div className={`step ${state}`} key={item}><span className="step-index">{n<step?<Icon name="check" size={14}/>:n}</span><span>{item}</span></div>;
    })}
  </div>;
}

function PageTitle({eyebrow,title,subtitle,actions}){
  return <div className="page-head">
    <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="subhead">{subtitle}</p></div>
    {actions&&<div className="actions" style={{marginTop:0}}>{actions}</div>}
  </div>;
}

function Chip({children,active=false,seal=false}){return <span className={`chip ${active?"active":""} ${seal?"seal":""}`}>{children}</span>}

function Notice({children,warn=false}){
  return <div className={`notice ${warn?"warn":""}`}><span className="notice-icon">i</span><div>{children}</div></div>;
}

function Toasts({items}){
  return <div className="toast-stack" aria-live="polite">{items.map(t=><div className="toast" key={t.id}>{t.message}</div>)}</div>;
}

function LoadingOverlay({title,progress,detail}){
  const steps=["理解主题与作业要求","检查当前权限和生成策略","检索站内多模态资源"];
  return <div className="loading-layer">
    <div className="loading-card">
      <div className="eyebrow">AI TASK ENGINE</div><h2>{title}</h2><p className="subhead">{detail}</p>
      <div className="progress"><span style={{width:`${progress}%`}}></span></div>
      <div className="mini-steps">{steps.map((s,i)=><div className={progress>(i+1)*27?"done":""} key={s}>{progress>(i+1)*27?"已完成":"处理中"} · {s}</div>)}</div>
    </div>
  </div>;
}

function ResourceThumb({resource,large=false}){
  const cls=resource.type==="音频"?"audio":resource.type==="文献"||resource.type==="口述"?"doc":"";
  return <div className={large?"hero-preview":"resource-thumb"}>
    {resource.coverUrl?<img className="thumb-image" src={resource.coverUrl} alt={resource.title} loading="lazy" onError={e=>{e.currentTarget.style.display="none"}}/>:<div className={"thumb-art "+cls}></div>}
    {!large&&<><span className="media-badge">{resource.type}</span><span className="time-badge">{resource.time}</span></>}
    {large&&(resource.type==="音频"||resource.type==="视频")&&<div className="wave"></div>}
  </div>;
}

function ResourceCard({resource,onPreview,onToggle}){
  return <article className={"resource-card "+(resource.selected?"selected":"")}>
    <ResourceThumb resource={resource}/>
    <div className="resource-main">
      <div className="chip-row"><Chip active>{resource.source}</Chip><Chip>{resource.relevanceLevel||"待核验"}</Chip><Chip>{resource.rights}</Chip></div>
      <h3>{resource.title}</h3><p>{resource.desc}</p>
      <div className="chip-row">{resource.tags.map(t=><Chip key={t}>{t}</Chip>)}</div>
      <div className="meta-line"><span>资源编号 {resource.id}</span><span>主题相关度 {resource.relevance}%</span><span>{resource.download}</span></div>
    </div>
    <div className="resource-actions">
      <Button small icon="play" onClick={()=>onPreview(resource)}>预览证据</Button>
      <Button small onClick={()=>window.open(resource.detailUrl,"_blank","noopener")}>原始详情</Button>
      <Button small variant={resource.selected?"secondary":"primary"} icon={resource.selected?"check":null} onClick={()=>onToggle(resource.id)}>{resource.selected?"已选素材":"加入大纲"}</Button>
    </div>
  </article>;
}

function PreviewDrawer({resource,onClose,onToggle,onTimeChange}){
  const [tab,setTab]=React.useState("平台原始简介");
  const [start,setStart]=React.useState("00:00");
  const [end,setEnd]=React.useState(resource.time&&resource.time.includes(":")?resource.time:"00:30");
  if(!resource)return null;
  return <><div className="drawer-backdrop" onClick={onClose}></div><aside className="drawer" aria-modal="true" role="dialog">
    <div className="drawer-head"><div><div className="eyebrow">EVIDENCE PREVIEW</div><h2>{resource.title}</h2><p className="subhead">{resource.source} · {resource.id}</p></div><button className="icon-btn" onClick={onClose} aria-label="关闭"><Icon name="close"/></button></div>
    <ResourceThumb resource={resource} large/>
    <div className="chip-row"><Chip active>站内馆藏</Chip><Chip>{resource.rights}</Chip><Chip>{resource.download}</Chip></div>
    {resource.type!=="图片"&&<div className="timeline"><b>本次引用时间码</b><div className="timeline-bar"><span></span></div><div className="time-fields"><input className="input" value={start} onChange={e=>setStart(e.target.value)}/><input className="input" value={end} onChange={e=>setEnd(e.target.value)}/></div><div className="actions" style={{marginTop:8}}><Button small onClick={()=>onTimeChange(start,end)}>记录时间码</Button></div></div>}
    <div className="evidence-tabs"><button className={"segment "+(tab==="平台原始简介"?"active":"")} onClick={()=>setTab("平台原始简介")}>平台原始简介</button><button className={"segment "+(tab==="MVP摘要"?"active":"")} onClick={()=>setTab("MVP摘要")}>MVP摘要</button></div>
    <div className="evidence-quote">{tab==="平台原始简介"?resource.excerpt:resource.aiSummary}</div>
    <div className="divider"></div><h3>来源与权限</h3><div className="rights-grid"><span>来源</span><b>{resource.source}</b><span>年份</span><b>{resource.publishYear}</b><span>使用范围</span><b>{resource.rights}</b><span>记录类型</span><b>{resource.recordType}</b></div>
    <div className="actions"><Button onClick={()=>window.open(resource.detailUrl,"_blank","noopener")}>打开联图云原始页</Button><Button variant={resource.selected?"secondary":"primary"} onClick={()=>{onToggle(resource.id);onClose()}}>{resource.selected?"移出已选":"加入已选素材"}</Button></div>
  </aside></>;
}

function Modal({title,children,onClose,actions}){
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal"><div className="drawer-head"><div><div className="eyebrow">FUNCTIONAL MVP</div><h2>{title}</h2></div><button className="icon-btn" onClick={onClose} aria-label="关闭"><Icon name="close"/></button></div><div className="divider"></div>{children}{actions&&<div className="actions">{actions}</div>}</div></div>;
}

Object.assign(window,{Icon,Button,AppHeader,Stepper,PageTitle,Chip,Notice,Toasts,LoadingOverlay,ResourceThumb,ResourceCard,PreviewDrawer,Modal});
