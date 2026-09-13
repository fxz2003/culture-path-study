import playwright from "playwright";
import JSZip from "jszip";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { chromium }=playwright;

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const output=path.join(root,"test-output");
const profile=path.join(root,`${process.env.MVP_URL?".playwright-profile-public":".playwright-profile-local"}-${Date.now()}`);
fs.mkdirSync(output,{recursive:true});
fs.mkdirSync(profile,{recursive:true});

const context=await chromium.launchPersistentContext(profile,{
  executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless:true,
  acceptDownloads:true,
  downloadsPath:output
});
const page=await context.newPage();
const errors=[];
page.on("pageerror",error=>errors.push("PAGE: "+error.message));
page.on("console",message=>{if(message.type()==="error")errors.push("CONSOLE: "+message.text())});

await page.goto(process.env.MVP_URL||"http://127.0.0.1:4174/",{waitUntil:"networkidle",timeout:60000});
await page.getByRole("button",{name:"开始实时检索"}).click();
await page.getByText(/联图云多词扩展检索|已核验快照回退/).first().waitFor({timeout:60000});
const mode=(await page.locator(".demo-badge").innerText()).trim();
const cards=await page.locator(".resource-card").count();
if(cards<3)throw new Error("检索结果不足3项");
const selectedTitles=await page.locator(".resource-card.selected h3").allTextContents();
if(selectedTitles.length<6)throw new Error("默认高相关素材不足6项");
if(selectedTitles.some(title=>!/音乐|民歌|歌曲|情歌|山歌|儿歌|乐器|歌舞|唱腔|海菜腔|传唱|夸口|祝福/.test(title))){
  throw new Error("默认勾选素材中仍存在明显偏题项："+selectedTitles.join("、"));
}

await page.getByRole("button",{name:"生成素材化大纲"}).first().click();
await page.getByText("素材化大纲工作台").first().waitFor({timeout:30000});
const coverage=(await page.locator(".coverage span").getAttribute("style"))||"";
await page.getByRole("button",{name:"生成成果"}).first().click();
await page.getByRole("button",{name:"开始生成"}).click();
await page.getByText("成果已生成，可立即下载验证").waitFor({timeout:30000});
const artifactState=await page.evaluate(()=>{
  const artifact=JSON.parse(localStorage.getItem("culture-path-artifacts")||"[]")[0];
  return artifact&&{
    version:artifact.version,
    outlineCount:artifact.outline.length,
    quality:artifact.quality,
    titles:artifact.evidence.map(resource=>resource.title),
    genericSummaryCount:artifact.evidence.filter(resource=>String(resource.aiSummary).includes("该视频与")).length
  };
});
if(!artifactState||artifactState.version!=="V2")throw new Error("未生成V2成果");
if(artifactState.outlineCount<6)throw new Error("成果章节不足6章");
if(!artifactState.quality?.ready)throw new Error("成果质量门禁未通过："+JSON.stringify(artifactState.quality));
if(artifactState.genericSummaryCount)throw new Error("仍存在旧版泛化摘要");

const pptPromise=page.waitForEvent("download",{timeout:120000});
await page.getByRole("button",{name:"下载可编辑PPTX"}).click();
const ppt=await pptPromise;
const pptPath=path.join(output,ppt.suggestedFilename());
await ppt.saveAs(pptPath);
const pptZip=await JSZip.loadAsync(fs.readFileSync(pptPath));
const mediaFiles=Object.keys(pptZip.files).filter(name=>/^ppt\/media\//.test(name)&&!pptZip.files[name].dir);
const slideFiles=Object.keys(pptZip.files).filter(name=>/^ppt\/slides\/slide\d+\.xml$/.test(name));
const pptText=await Promise.all(slideFiles.map(name=>pptZip.file(name).async("string")));
const relationshipFiles=Object.keys(pptZip.files).filter(name=>/^ppt\/slides\/_rels\/slide\d+\.xml\.rels$/.test(name));
const relationshipText=(await Promise.all(relationshipFiles.map(name=>pptZip.file(name).async("string")))).join("\n");
if(mediaFiles.length<4)throw new Error(`PPT只嵌入${mediaFiles.length}个媒体文件`);
if(slideFiles.length<8)throw new Error(`PPT只有${slideFiles.length}页`);
if(!relationshipText.includes("mzwh.libtop.com"))throw new Error("PPT未保留联图云可点击链接");
if(pptText.join("\n").includes("该视频与"))throw new Error("PPT仍包含旧版泛化表述");

const zipPromise=page.waitForEvent("download",{timeout:30000});
await page.getByRole("button",{name:"下载素材包ZIP"}).click();
const zip=await zipPromise;
const zipPath=path.join(output,zip.suggestedFilename());
await zip.saveAs(zipPath);

const docPromise=page.waitForEvent("download",{timeout:30000});
await page.evaluate(()=>{
  const artifact=JSON.parse(localStorage.getItem("culture-path-artifacts")||"[]")[0];
  window.downloadPaperArtifact({...artifact,type:"课程论文"},artifact.evidence||[]);
});
const doc=await docPromise;
const docPath=path.join(output,doc.suggestedFilename());
await doc.saveAs(docPath);

const result={
  mode,cards,selectedTitles,coverage,artifactState,
  ppt:{path:pptPath,size:fs.statSync(pptPath).size,slides:slideFiles.length,mediaFiles:mediaFiles.length},
  zip:{path:zipPath,size:fs.statSync(zipPath).size},
  doc:{path:docPath,size:fs.statSync(docPath).size},
  errors
};
console.log(JSON.stringify(result,null,2));
await context.close();
if(errors.length)process.exitCode=2;
