import fs from "fs"
import path from "path"
import { getPages } from "./gateways/pageDataGateway.js";
import { createHTML } from "./createHTML.js";
import { getAllCategories } from "./gateways/categoryGateway.js";

export const generateOgpForCurriculum=async(browser,__dirname)=>{
  console.log("Generating OGP for curriculums...");
    const allCurriculums = await getPages()
    const outputDir = path.resolve(__dirname, `../../public/ogp`);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    let a = 0;
    for (const c of allCurriculums) {
      a++;
      try{
        const title = c.title;
        const iconType = c.iconType;
        const iconUrl = c.iconUrl;
        const coverUrl = c.coverUrl
        const page = await browser.newPage();
        const html = createHTML(coverUrl,iconType,iconUrl,title)
        await page.setContent(html);
        await page.setViewport({ width: 1203, height: 630 });
        const filePath = path.join(outputDir, `${c.id}.png`);
        await page.screenshot({ path: filePath });
        console.log(`✅ Generated successfully ${a}/${allCurriculums.length}`);
      }catch(e){
        console.error("❌ Error generating OGP:", e);
        continue;
      }
      }
}

export const generateOgpForCategory=async(browser,__dirname)=>{
  console.log("Generating OGP for categories...");
  const categories = await getAllCategories();
  const outputDir = path.resolve(__dirname, "../../public/ogp/category");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  let c = 0;
  for(const i of categories){
    try{
      c++;
      const iconUrl = i.iconUrl;
      const iconType = i.iconType;
      const coverUrl = i.cover;
      const title = i.title;
      const page = await browser.newPage();
      const html = createHTML(coverUrl,iconType,iconUrl,title)
      await page.setContent(html);
      await page.setViewport({ width: 1203, height: 630 });
      const filePath = path.join(outputDir, `${i.id}.png`);
      await page.screenshot({ path: filePath });
      console.log(`✅ Generated successfully ${c}/${categories.length}`);
    }catch(e){
      console.error("❌ Error generating OGP for category:", e);
      continue;
    }
  }
}