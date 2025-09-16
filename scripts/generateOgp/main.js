import fs from "fs"
import path from "path"
import puppeteer from "puppeteer"
import { fileURLToPath } from "url";
import { generateOgpForCurriculum,generateOgpForCategory } from "./generate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cleardir(directory) {
  try {
      const files = fs.readdirSync(directory);
      for (const file of files) {
          const filePath = path.join(directory, file);
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
              fs.unlinkSync(filePath);
          } else if (stat.isDirectory()) {
              fs.rmSync(filePath, { recursive: true, force: true });
          }
      }
      console.log(`Directory "${directory}" has been cleared.`);
  } catch (err) {
      console.error(`Error clearing directory: ${err.message}`);
  }
}

// main処理
(async () => {

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const dir = path.resolve(__dirname, "../../public/ogp");
  if(fs.existsSync(dir)) cleardir(dir)
  if(!fs.existsSync(dir)) fs.mkdirSync(dir);
  await generateOgpForCurriculum(browser,__dirname);
  await generateOgpForCategory(browser,__dirname);

  await browser.close();
})();
