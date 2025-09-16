import fs from "fs"

function mkdir(dirPath){
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log('📁 ディレクトリを作成しました:', dirPath);
    } else {
        console.log('✅ すでに存在しています:', dirPath);
    }
}

export function cleardir(directory) {
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

function mkAndClearDir(dirs){
    for(const dir of dirs){
        mkdir(dir);
        cleardir(dir);
    }
}

export const initDir=(pageId)=>{
    const ogsDir = `./public/notion_data/eachPage/${pageId}/ogsData/`;
    const imageDir = `./public/notion_data/eachPage/${pageId}/image/`;
    const iframeDir = `./public/notion_data/eachPage/${pageId}/iframeData/`;
    const pageImageDir = `./public/notion_data/eachPage/${pageId}/pageImageData/`;
    const pageDataDir = `./public/pageData/${pageId}`
    const dirList = [ogsDir,imageDir,iframeDir,pageImageDir,pageDataDir]
    mkAndClearDir(dirList);
}