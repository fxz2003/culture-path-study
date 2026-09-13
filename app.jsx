function App(){
  const [screen,setScreen]=React.useState("create");
  const [resources,setResources]=React.useState(()=>VERIFIED_SNAPSHOT_RESOURCES.map(r=>({...r})));
  const [searchMeta,setSearchMeta]=React.useState({
    mode:"snapshot",label:"已核验快照样本",total:VERIFIED_SNAPSHOT_RESOURCES.length,
    query:"云南民族音乐",searchedAt:"待发起实时检索"
  });
  const [outline,setOutline]=React.useState(()=>buildOutline(
    {topic:"云南少数民族音乐传承与当代发展"},
    VERIFIED_SNAPSHOT_RESOURCES
  ));
  const [preview,setPreview]=React.useState(null);
  const [loading,setLoading]=React.useState(null);
  const [generateOpen,setGenerateOpen]=React.useState(false);
  const [feedbackOpen,setFeedbackOpen]=React.useState(false);
  const [toasts,setToasts]=React.useState([]);
  const [task,setTask]=React.useState({
    topic:"制作一个10分钟的“云南少数民族音乐传承与当代发展”课程展示",
    type:"PPT展示",duration:"10分钟",level:"本科一年级",citation:"GB/T 7714"
  });
  const [artifacts,setArtifacts]=React.useState(()=>{
    try{return JSON.parse(localStorage.getItem("culture-path-artifacts")||"[]")}catch{return []}
  });
  const [currentArtifact,setCurrentArtifact]=React.useState(null);
  const [tweaks,setTweak]=useTweaks(window.TWEAK_DEFAULTS);

  React.useEffect(()=>{
    localStorage.setItem("culture-path-artifacts",JSON.stringify(artifacts.slice(0,20)));
  },[artifacts]);

  React.useEffect(()=>{
    document.documentElement.style.setProperty("--density",tweaks.density==="紧凑"?".82":"1");
  },[tweaks.density]);

  const notify=React.useCallback((message)=>{
    const id=Date.now()+Math.random();
    setToasts(v=>[...v,{id,message}]);
    window.setTimeout(()=>setToasts(v=>v.filter(t=>t.id!==id)),3000);
  },[]);

  const navigate=(target)=>{
    setPreview(null);
    setGenerateOpen(false);
    setFeedbackOpen(false);
    if(target==="create"||target==="search"||target==="library")setScreen(target);
  };

  const toggleResource=(id)=>{
    setResources(list=>list.map(r=>r.id===id?{...r,selected:!r.selected}:r));
  };

  const runTask=async(kind,work,onDone)=>{
    let progress=12;
    setLoading({kind,progress});
    const timer=window.setInterval(()=>{
      progress=Math.min(88,progress+Math.ceil(Math.random()*10));
      setLoading({kind,progress});
    },260);
    try{
      const result=await work();
      window.clearInterval(timer);
      setLoading({kind,progress:100});
      await new Promise(resolve=>window.setTimeout(resolve,260));
      setLoading(null);
      onDone(result);
    }catch(error){
      window.clearInterval(timer);
      setLoading(null);
      notify(error.message||"操作未完成，请稍后重试");
    }
  };

  const startTask=(payload)=>{
    setTask(payload);
    runTask("search",()=>searchPlatformResources(payload),result=>{
      setResources(result.resources);
      setSearchMeta(result.meta);
      setOutline([]);
      setScreen("search");
      notify(result.meta.mode==="live"
        ?`已从联图云实时召回${result.resources.length}项资源`
        :"实时接口暂不可用，已切换至已核验快照样本");
    });
  };

  const createOutline=()=>{
    runTask("outline",()=>Promise.resolve(buildOutline(task,resources)),next=>{
      setOutline(next);
      setScreen("workspace");
      const quality=calculateQualityMetrics(task,next,resources);
      notify(`素材化大纲已生成：主题直接相关${quality.directRelevanceRate}%，章节观点支撑${quality.claimSupportRate}%`);
    });
  };

  const startGenerate=(settings)=>{
    setGenerateOpen(false);
    runTask("generate",()=>Promise.resolve(buildArtifact(task,outline,resources,settings)),artifact=>{
      setCurrentArtifact(artifact);
      setArtifacts(list=>[artifact,...list.filter(item=>item.id!==artifact.id)]);
      setScreen("result");
      notify(`${artifact.type}成果已生成并保存为${artifact.version}`);
    });
  };

  const handleDownloadPack=async()=>{
    try{
      await downloadMaterialPackage(task,outline.length?outline:buildOutline(task,resources),resources);
      notify("素材包已下载，包含大纲、引用清单和机器可读清单");
    }catch(error){notify(error.message||"素材包生成失败")}
  };

  const handleDownloadArtifact=async(artifact=currentArtifact)=>{
    if(!artifact)return notify("请先生成一个成果");
    try{
      await downloadArtifact(artifact,resources);
      notify(artifact.type==="课程论文"?"可编辑论文稿已下载":"可编辑PPTX已下载");
    }catch(error){notify(error.message||"成果导出失败")}
  };

  const openArtifact=(artifact)=>{
    setCurrentArtifact(artifact);
    setScreen("result");
  };

  const resetMvp=()=>{
    setResources(VERIFIED_SNAPSHOT_RESOURCES.map(r=>({...r})));
    setSearchMeta({mode:"snapshot",label:"已核验快照样本",total:VERIFIED_SNAPSHOT_RESOURCES.length,query:"云南民族音乐",searchedAt:"已重置"});
    setOutline(buildOutline(task,VERIFIED_SNAPSHOT_RESOURCES));
    setScreen("create");
    notify("本次任务状态已重置，历史成果仍保留");
  };

  const loadingCopy=loading?.kind==="generate"
    ?{title:"正在生成可编辑成果",detail:"正在把已选证据映射为章节、页面与引用清单。"}
    :loading?.kind==="outline"
    ?{title:"正在依据已选素材规划大纲",detail:"系统先绑定证据，再生成章节建议；证据不足会明确保留缺口。"}
    :{title:"正在检索联图云真实馆藏",detail:"实时搜索视频、音频、图片与专辑，并保留平台原始详情链接。"};

  let content;
  if(screen==="create"){
    content=<CreateScreen onStart={startTask} notify={notify} demoStrategy={tweaks.demoStrategy}/>;
  }else if(screen==="search"){
    content=<SearchScreen resources={resources} onToggle={toggleResource} onPreview={setPreview}
      onNext={createOutline} notify={notify} query={task.topic} searchMeta={searchMeta}
      onRetry={()=>startTask(task)}/>;
  }else if(screen==="workspace"){
    content=<WorkspaceScreen resources={resources} outline={outline} task={task}
      onToggle={toggleResource} onPreview={setPreview} onGenerate={()=>setGenerateOpen(true)}
      onDownloadPack={handleDownloadPack} notify={notify} evidenceThread={tweaks.evidenceThread}/>;
  }else if(screen==="result"){
    content=<ResultScreen artifact={currentArtifact} resources={resources} notify={notify}
      onLibrary={()=>setScreen("library")} onFeedback={()=>setFeedbackOpen(true)}
      onDownload={()=>handleDownloadArtifact(currentArtifact)} onDownloadPack={handleDownloadPack}/>;
  }else{
    content=<LibraryScreen artifacts={artifacts} onOpen={openArtifact} onCreate={()=>setScreen("create")}
      onDownload={handleDownloadArtifact} notify={notify}/>;
  }

  return <div className="app-shell">
    <AppHeader screen={screen} onNavigate={navigate}/>
    {content}
    <div className="footer-note">文化寻脉功能MVP · 实时调用联图云公开检索；媒体使用与下载权限以平台账号实际展示为准。接口异常时会明确切换到已核验快照。</div>
    <div className="demo-badge">功能MVP · {searchMeta.label}</div>
    {preview&&<PreviewDrawer resource={preview} onClose={()=>setPreview(null)} onToggle={toggleResource}
      onTimeChange={(a,b)=>notify(`时间码已记录：${a}–${b}`)}/>}
    {generateOpen&&<GenerateModal defaultType={task.type.includes("论文")?"课程论文":"PPT"}
      quality={calculateQualityMetrics(task,outline,resources)} onClose={()=>setGenerateOpen(false)} onGenerate={startGenerate}/>}
    {feedbackOpen&&<FeedbackModal artifact={currentArtifact} onClose={()=>setFeedbackOpen(false)} notify={notify}/>}
    {loading&&<LoadingOverlay title={loadingCopy.title} detail={loadingCopy.detail} progress={loading.progress}/>}
    <Toasts items={toasts}/>
    <TweaksPanel title="测试设置">
      <TweakSection label="布局"/>
      <TweakRadio label="信息密度" value={tweaks.density} options={["紧凑","舒展"]} onChange={v=>setTweak("density",v)}/>
      <TweakToggle label="显示证据线" value={tweaks.evidenceThread} onChange={v=>setTweak("evidenceThread",v)}/>
      <TweakSection label="后台策略模拟"/>
      <TweakRadio label="模板库状态" value={tweaks.demoStrategy} options={["从零生成","模板辅助"]} onChange={v=>setTweak("demoStrategy",v)}/>
      <TweakButton label="重置本次任务" secondary onClick={resetMvp}/>
    </TweaksPanel>
  </div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
