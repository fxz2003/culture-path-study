function safeFilename(value="文化寻脉成果"){
  return String(value).replace(/[\\/:*?"<>|]/g,"-").replace(/\s+/g," ").trim().slice(0,60)||"文化寻脉成果";
}

function downloadBlob(blob,filename){
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement("a");
  anchor.href=url;
  anchor.download=filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1200);
}

function artifactResources(artifact,resources){
  if(artifact?.evidence?.length)return artifact.evidence;
  const ids=new Set(artifact?.resourceIds||resources.filter(r=>r.selected).map(r=>r.id));
  return resources.filter(r=>ids.has(r.id));
}

function outlineMarkdown(task,outline,resources){
  const title=extractThemeTitle(task.topic);
  const sections=outline.map(chapter=>{
    const items=chapter.resourceIds.map(id=>resources.find(r=>r.id===id)).filter(Boolean);
    return `## ${chapter.no} ${chapter.title}\n\n${chapter.goal}\n\n${items.map(r=>`- [${r.type}] ${r.title}\n  - 来源：${r.source}\n  - 资源编号：${r.id}\n  - 摘要（MVP规则）：${r.aiSummary}\n  - 原始简介：${r.excerpt}\n  - 详情：${r.detailUrl}\n  - 权限：${r.rights}`).join("\n")}`;
  }).join("\n\n");
  return `# ${title}\n\n> 本材料包由文化寻脉功能MVP生成。MVP摘要与平台原始记录已分开标注；资源可用性和下载权限以联图云账号为准。\n\n${sections}\n`;
}

async function downloadMaterialPackage(task,outline,resources){
  const selected=resources.filter(r=>r.selected);
  const selectedIds=new Set(selected.map(r=>r.id));
  const cleanOutline=outline.map(chapter=>({
    ...chapter,resourceIds:(chapter.resourceIds||[]).filter(id=>selectedIds.has(id))
  }));
  const title=safeFilename(extractThemeTitle(task.topic));
  const markdown=outlineMarkdown(task,cleanOutline,resources);
  const csvRows=[
    ["资源编号","类型","标题","来源","时间/数量","权限","原始详情链接"],
    ...selected.map(r=>[r.id,r.type,r.title,r.source,r.time,r.rights,r.detailUrl])
  ];
  const csv="\uFEFF"+csvRows.map(row=>row.map(value=>`"${String(value??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const manifest={
    generatedAt:new Date().toISOString(),task,outline:cleanOutline,
    resources:selected.map(r=>({
      id:r.id,type:r.type,title:r.title,source:r.source,description:r.desc,
      originalExcerpt:r.excerpt,mvpSummary:r.aiSummary,time:r.time,
      rights:r.rights,detailUrl:r.detailUrl,tags:r.tags
    }))
  };
  if(window.JSZip){
    const zip=new JSZip();
    zip.file("01_素材化大纲.md",markdown);
    zip.file("02_素材与引用清单.csv",csv);
    zip.file("03_机器可读清单.json",JSON.stringify(manifest,null,2));
    zip.file("使用说明.txt","本素材包不复制受版权或账号权限控制的媒体文件；清单保留联图云详情链接、来源和权限提示。请登录联图云核验并按授权范围使用。\n");
    const blob=await zip.generateAsync({type:"blob"});
    downloadBlob(blob,`${title}_文化寻脉素材包.zip`);
    return;
  }
  downloadBlob(new Blob([markdown],{type:"text/markdown;charset=utf-8"}),`${title}_素材化大纲.md`);
}

function addPptHeader(slide,section){
  slide.addText("联图云 · 文化寻脉",{x:.65,y:.32,w:4,h:.3,fontFace:"Microsoft YaHei",fontSize:12,color:"235F53",bold:true,margin:0});
  slide.addText(section,{x:9.2,y:.32,w:3.45,h:.3,fontFace:"Microsoft YaHei",fontSize:12,color:"6B7773",align:"right",margin:0});
}

async function writeCompatiblePptx(pptx,filename){
  const raw=await pptx.write({outputType:"blob"});
  if(!window.JSZip){
    downloadBlob(raw,filename);
    return;
  }
  const zip=await JSZip.loadAsync(raw);
  const contentTypesFile=zip.file("[Content_Types].xml");
  if(!contentTypesFile){
    downloadBlob(raw,filename);
    return;
  }
  let contentTypes=await contentTypesFile.async("string");
  const masters=Object.keys(zip.files).filter(name=>/^ppt\/slideMasters\/slideMaster\d+\.xml$/.test(name));
  const contentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml";
  contentTypes=contentTypes.replace(
    /<Override PartName="\/(ppt\/slideMasters\/slideMaster\d+\.xml)" ContentType="application\/vnd\.openxmlformats-officedocument\.presentationml\.slideMaster\+xml"\/>/g,
    (match,name)=>zip.file(name)?match:""
  );
  masters.forEach(name=>{
    const partName="/"+name;
    if(!contentTypes.includes('PartName="'+partName+'"')){
      contentTypes=contentTypes.replace("</Types>",'<Override PartName="'+partName+'" ContentType="'+contentType+'"/></Types>');
    }
  });
  zip.file("[Content_Types].xml",contentTypes);
  const patched=await zip.generateAsync({
    type:"blob",
    mimeType:"application/vnd.openxmlformats-officedocument.presentationml.presentation"
  });
  downloadBlob(patched,filename);
}

async function downloadPptxArtifact(artifact,resources){
  if(!window.PptxGenJS)throw new Error("PPT生成组件尚未加载，请刷新页面后重试");
  const evidence=artifactResources(artifact,resources);
  const sourcePool=artifact.evidence?.length?artifact.evidence:resources;
  const pptx=new PptxGenJS();
  pptx.layout="LAYOUT_WIDE";
  pptx.author="联图云·文化寻脉功能MVP";
  pptx.company="联图云·中华民族文化平台";
  pptx.subject="基于站内馆藏证据生成的可编辑课程成果";
  pptx.title=artifact.title;
  pptx.lang="zh-CN";
  pptx.theme={headFontFace:"Microsoft YaHei",bodyFontFace:"Microsoft YaHei",lang:"zh-CN"};

  let slide=pptx.addSlide();
  slide.background={color:"F3F0E8"};
  slide.addText("文化寻脉 · 课程研学成果",{x:.78,y:.78,w:7,h:.4,fontSize:18,bold:true,color:"235F53",margin:0});
  slide.addText(artifact.title,{x:.78,y:1.7,w:11.6,h:1.55,fontSize:42,bold:true,color:"182621",margin:0,fit:"shrink"});
  slide.addText(`${artifact.task.type} · ${artifact.task.duration} · ${artifact.task.level}`,{x:.8,y:3.65,w:9.4,h:.48,fontSize:18,color:"596762",margin:0});
  slide.addText(`${evidence.length}项联图云资源   证据覆盖率${artifact.coverage}%   ${artifact.version}`,{x:.8,y:5.85,w:10.5,h:.42,fontSize:17,color:"235F53",margin:0});
  slide.addText("标题、正文与引用均可编辑。资源权限以联图云账号实际展示为准。",{x:.8,y:6.4,w:11.2,h:.36,fontSize:14,color:"7A6C58",margin:0});

  artifact.outline.forEach((chapter,index)=>{
    const items=chapter.resourceIds.map(id=>sourcePool.find(r=>r.id===id)).filter(Boolean);
    const page=pptx.addSlide();
    page.background={color:"FFFFFF"};
    addPptHeader(page,`章节 ${chapter.no}`);
    page.addText(chapter.title,{x:.65,y:.9,w:11.7,h:.72,fontSize:32,bold:true,color:"182621",margin:0,fit:"shrink"});
    page.addText(chapter.goal,{x:.68,y:1.78,w:11.4,h:.62,fontSize:18,color:"4C5B56",margin:0,fit:"shrink"});
    const summaries=items.slice(0,3).map((r,i)=>`${i+1}. ${r.title}\n${r.aiSummary.split("；")[0]}`);
    page.addText(summaries.join("\n\n"),{x:.7,y:2.7,w:7.65,h:3.75,fontSize:17,color:"26332F",margin:.03,fit:"shrink",valign:"top"});
    page.addText("本章证据",{x:8.9,y:2.72,w:3.35,h:.4,fontSize:18,bold:true,color:"235F53",margin:0});
    page.addText(items.map(r=>`[${r.type}] ${r.title}\n${r.source} · ${r.id}`).join("\n\n")||"尚无证据",{x:8.9,y:3.28,w:3.65,h:2.95,fontSize:15,color:"34443E",margin:0,fit:"shrink",valign:"top"});
    page.addText(`第${index+2}页`,{x:11.2,y:6.72,w:1.3,h:.25,fontSize:11,color:"7B8984",align:"right",margin:0});
  });

  const citationGroups=[];
  for(let i=0;i<evidence.length;i+=4)citationGroups.push(evidence.slice(i,i+4));
  (citationGroups.length?citationGroups:[[]]).forEach((group,groupIndex)=>{
    slide=pptx.addSlide();
    slide.background={color:"F7F8F7"};
    addPptHeader(slide,"引用与使用边界");
    slide.addText("引用清单与权限说明",{x:.65,y:.9,w:9.2,h:.7,fontSize:32,bold:true,color:"182621",margin:0});
    slide.addText(group.map((r,i)=>`${groupIndex*4+i+1}. ${r.title}\n${r.source} · 资源编号 ${r.id}\n${r.detailUrl}`).join("\n\n"),{x:.7,y:1.82,w:11.85,h:4.65,fontSize:15,color:"26332F",margin:.03,fit:"shrink",valign:"top"});
    slide.addText("平台账号决定播放、下载和嵌入权限。MVP摘要不等同于平台原始内容。",{x:.72,y:6.63,w:11.4,h:.32,fontSize:13,color:"9A4C3A",margin:0});
  });
  await writeCompatiblePptx(pptx,`${safeFilename(artifact.title)}_文化寻脉_${artifact.version}.pptx`);
}

function downloadPaperArtifact(artifact,resources){
  const evidence=artifactResources(artifact,resources);
  const sourcePool=artifact.evidence?.length?artifact.evidence:resources;
  const sections=artifact.outline.map(chapter=>{
    const items=chapter.resourceIds.map(id=>sourcePool.find(r=>r.id===id)).filter(Boolean);
    return `<h2>${chapter.no} ${chapter.title}</h2><p>${chapter.goal}</p>${items.map(r=>`<h3>${r.title}</h3><p><b>MVP结构化摘要：</b>${r.aiSummary}</p><blockquote><b>平台原始简介：</b>${r.excerpt}</blockquote>`).join("")}`;
  }).join("");
  const refs=evidence.map((r,i)=>`<li>${i+1}. ${r.title}，${r.source}，资源编号 ${r.id}，<a href="${r.detailUrl}">${r.detailUrl}</a></li>`).join("");
  const html=`<!doctype html><html><head><meta charset="utf-8"><title>${artifact.title}</title><style>body{font-family:'Microsoft YaHei',sans-serif;line-height:1.8;margin:48px;color:#182621}h1{text-align:center}h2{margin-top:32px;border-bottom:1px solid #ccd8d4;padding-bottom:8px}blockquote{background:#f3f7f5;border-left:4px solid #235f53;padding:12px 16px;margin:12px 0}small{color:#666}</style></head><body><h1>${artifact.title}</h1><p style="text-align:center">${artifact.task.level} · ${artifact.task.duration} · ${artifact.version}</p><p><small>本稿由文化寻脉功能MVP依据已选联图云证据生成，可继续在Word中编辑。MVP摘要与平台原始简介已分开标注。</small></p>${sections}<h2>参考资源</h2><ol>${refs}</ol><p><small>资源使用和下载权限以联图云账号实际展示为准。</small></p></body></html>`;
  downloadBlob(new Blob(["\uFEFF",html],{type:"application/msword;charset=utf-8"}),`${safeFilename(artifact.title)}_文化寻脉_${artifact.version}.doc`);
}

async function downloadArtifact(artifact,resources){
  if(artifact.type==="课程论文")return downloadPaperArtifact(artifact,resources);
  return downloadPptxArtifact(artifact,resources);
}

Object.assign(window,{downloadMaterialPackage,downloadArtifact,downloadPptxArtifact,downloadPaperArtifact});
