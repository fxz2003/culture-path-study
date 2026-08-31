function App(){
  const [screen,setScreen]=React.useState("create");
  const [resources,setResources]=React.useState(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem("culture-path-resource-selection")||"null");
      if(!saved)return PROTOTYPE_RESOURCES;
      return PROTOTYPE_RESOURCES.map(r=>({...r,selected:saved.includes(r.id)}));
    }catch{return PROTOTYPE_RESOURCES}
  });
  const [preview,setPreview]=React.useState(null);
  const [loading,setLoading]=React.useState(null);
  const [generateOpen,setGenerateOpen]=React.useState(false);
  const [feedbackOpen,setFeedbackOpen]=React.useState(false);
  const [toasts,setToasts]=React.useState([]);
  const [task,setTask]=React.useState({topic:"云南少数民族音乐传承与当代发展",type:"PPT展示"});
  const [tweaks,setTweak]=useTweaks(window.TWEAK_DEFAULTS);

  React.useEffect(()=>{
    localStorage.setItem("culture-path-resource-selection",JSON.stringify(resources.filter(r=>r.selected).map(r=>r.id)));
  },[resources]);

  React.useEffect(()=>{
    document.documentElement.style.setProperty("--density",tweaks.density==="紧凑"?".82":"1");
  },[tweaks.density]);

  const notify=React.useCallback((message)=>{
    const id=Date.now()+Math.random();
    setToasts(v=>[...v,{id,message}]);
    window.setTimeout(()=>setToasts(v=>v.filter(t=>t.id!==id)),2600);
  },[]);

  const navigate=(target)=>{
    setPreview(null);setGenerateOpen(false);setFeedbackOpen(false);
    if(target==="create"||target==="search"||target==="library")setScreen(target);
  };

  const toggleResource=(id)=>{
    setResources(list=>list.map(r=>r.id===id?{...r,selected:!r.selected}:r));
  };

  const runLoading=(kind,onDone)=>{
    setLoading({kind,progress:8});
    let value=8;
    const timer=window.setInterval(()=>{
      value=Math.min(96,value+Math.ceil(Math.random()*17));
      setLoading({kind,progress:value});
      if(value>=96){
        window.clearInterval(timer);
        window.setTimeout(()=>{setLoading(null);onDone()},380);
      }
    },220);
  };

  const startTask=(payload)=>{
    setTask(payload);
    runLoading("search",()=>{setScreen("search");notify("已完成站内检索并过滤无权限资源")});
  };

  const createOutline=()=>{
    runLoading("outline",()=>{setScreen("workspace");notify("素材化大纲已生成，请逐章核对证据")});
  };

  const startGenerate=(settings)=>{
    setGenerateOpen(false);
    runLoading("generate",()=>{setScreen("result");notify(`${settings.type}初稿已生成并保存为V1`)});
  };

  const loadingCopy=loading?.kind==="generate"
    ?{title:"正在生成可编辑成果",detail:"正在规划页面、填充已选证据并执行引用与权限校验。"}
    :loading?.kind==="outline"
    ?{title:"正在依据真实素材规划大纲",detail:"系统不会先写结论再补来源；证据不足的章节会保留缺口。"}
    :{title:"正在检索站内特色馆藏",detail:"先检查权限与生成策略，再联合检索字幕、OCR、全文与文化实体。"};

  let content;
  if(screen==="create")content=<CreateScreen onStart={startTask} notify={notify} demoStrategy={tweaks.demoStrategy}/>;
  else if(screen==="search")content=<SearchScreen resources={resources} onToggle={toggleResource} onPreview={setPreview} onNext={createOutline} notify={notify} query={task.topic}/>;
  else if(screen==="workspace")content=<WorkspaceScreen resources={resources} onToggle={toggleResource} onPreview={setPreview} onGenerate={()=>setGenerateOpen(true)} notify={notify} evidenceThread={tweaks.evidenceThread}/>;
  else if(screen==="result")content=<ResultScreen notify={notify} onLibrary={()=>setScreen("library")} onFeedback={()=>setFeedbackOpen(true)}/>;
  else content=<LibraryScreen onOpen={()=>setScreen("result")} onCreate={()=>setScreen("create")} notify={notify}/>;

  return <div className="app-shell">
    <AppHeader screen={screen} onNavigate={navigate}/>
    {content}
    <div className="footer-note">文化寻脉可点击原型 · 所有资源名称、数量和下载动作均为演示数据，不代表生产环境真实馆藏。</div>
    <div className="demo-badge">交互原型 · 当前策略：{tweaks.demoStrategy}</div>
    {preview&&<PreviewDrawer resource={preview} onClose={()=>setPreview(null)} onToggle={toggleResource} onTimeChange={(a,b)=>notify(`时间码已保存：${a}–${b}`)}/>}
    {generateOpen&&<GenerateModal onClose={()=>setGenerateOpen(false)} onGenerate={startGenerate}/>}
    {feedbackOpen&&<FeedbackModal onClose={()=>setFeedbackOpen(false)} notify={notify}/>}
    {loading&&<LoadingOverlay title={loadingCopy.title} detail={loadingCopy.detail} progress={loading.progress}/>}
    <Toasts items={toasts}/>
    <TweaksPanel title="风格">
      <TweakSection label="布局"/>
      <TweakRadio label="信息密度" value={tweaks.density} options={["紧凑","舒展"]} onChange={v=>setTweak("density",v)}/>
      <TweakToggle label="显示证据线" value={tweaks.evidenceThread} onChange={v=>setTweak("evidenceThread",v)}/>
      <TweakSection label="演示"/>
      <TweakRadio label="模板库状态" value={tweaks.demoStrategy} options={["从零生成","模板辅助"]} onChange={v=>setTweak("demoStrategy",v)}/>
      <TweakButton label="重置已选素材" secondary onClick={()=>{localStorage.removeItem("culture-path-resource-selection");setResources(PROTOTYPE_RESOURCES);notify("原型状态已重置")}}/>
    </TweaksPanel>
  </div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);