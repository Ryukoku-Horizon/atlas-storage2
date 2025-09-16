import "dotenv/config"
import path from "path";
import axios from "axios";
import fs from "fs";
import https from "https"

const IFRAMELY_API_KEY = process.env.IFRAMELY_API_KEY;

const downloadImage = async (imageUrl, savePath) => {
    try {
        const response = await axios({ url: imageUrl, method: "GET", responseType: "stream" });
        const dir = path.dirname(savePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        const writer = fs.createWriteStream(savePath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });
        console.log(`✅ 画像をダウンロードしました: ${savePath}`);
    } catch (error) {
        console.error("❌ 画像のダウンロードに失敗しました:", error);
    }
};

const downloadVideo = (url, savePath) => {
    return new Promise((resolve, reject) => {
        const dirPath = path.dirname(savePath); 
        fs.mkdirSync(dirPath, { recursive: true }); 

        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
                return;
            }

            const fileStream = fs.createWriteStream(savePath);
            res.pipe(fileStream);

            fileStream.on("finish", () => {
                fileStream.close();
                console.log(`✅ 動画をダウンロードしました: ${savePath}`);
                resolve();
            });

            fileStream.on("error", (err) => {
                console.error("❌ 動画のダウンロードに失敗しました:", error);
                fs.unlink(savePath, () => reject(err)); 
            });
        }).on("error", (err) => {
            console.error("❌ 動画のダウンロードに失敗しました:", error);
            reject(err)
        });
    });
};


export async function useIframely(url) {
    try{
        const res = await fetch(`https://iframe.ly/api/oembed?url=${url}&api_key=${IFRAMELY_API_KEY}`);
        if(!res.ok){
            console.warn("❌ failed with Iframely:",await res.text());
            return;
        }
        console.log("✅ read successfully with Iframely")
        const data = await res.json();
        return data;
    }catch(e){
        console.error("❌ error:",e);
        return;
    }
}

export const getPageIcon=async(curriculumId,pageId,icon,notDownload)=>{
    if(icon){
        const iconType = icon.type;
        if(iconType==="file"){
            let exte = path.extname(new URL(icon.file.url).pathname).replace(".", "");
            if(exte===undefined || (exte!=="png" && exte!="jpg"  && exte!="svg")){
                exte = "png";
            }
            if(!notDownload) await downloadImage(icon.file.url, `./public/notion_data/eachPage/${curriculumId}/pageImageData/icon/${pageId}.${exte}`)
            const iconUrl = `/horizon-atlas/notion_data/eachPage/${curriculumId}/pageImageData/icon/${pageId}.${exte}`
            return {iconUrl,iconType}
        }else if(iconType==="external"){
            const iconUrl = icon.external.url
            return {iconUrl,iconType}
        }else if(iconType==="emoji"){
            const iconUrl = icon.emoji
            return {iconUrl,iconType}
        }else if(iconType==="custom_emoji"){
            let exte = path.extname(new URL(icon.custom_emoji.url).pathname).replace(".", "");
            if(exte===undefined || (exte!=="png" && exte!="jpg"  && exte!="svg")){
                exte = "png";
            }
            if(!notDownload) await downloadImage(icon.custom_emoji.url, `./public/notion_data/eachPage/${curriculumId}/pageImageData/icon/${pageId}.${exte}`)
            const iconUrl = `/horizon-atlas/notion_data/eachPage/${curriculumId}/pageImageData/icon/${pageId}.${exte}`
            return {iconUrl,iconType}
        }
    }
    return {iconUrl:"",iconType:""}
}

export const getPageCover=async(curriculumId,pageId,cover)=>{
    if(cover){
        if(cover.type==="file"){
            let exte = path.extname(new URL(cover.file.url).pathname).replace(".", "");
            if(exte===undefined || (exte!=="png" && exte!="jpg")){
                exte = "png";
            }
            await downloadImage(cover.file.url, `./public/notion_data/eachPage/${curriculumId}/pageImageData/cover/${pageId}.${exte}`)
            const coverUrl = `/horizon-atlas/notion_data/eachPage/${curriculumId}/pageImageData/cover/${pageId}.${exte}`
            return coverUrl
        }else if(cover.type==="external"){
            const coverUrl = cover.external.url
            return coverUrl
        }else if(cover.type==="emoji"){
            const coverUrl = cover.emoji
            return coverUrl
        }
    }
    return ""
}

export const saveImageAndgetUrl=async(curriculumId,blockId,url)=>{
    let exte = path.extname(new URL(url).pathname).replace(".", "");
    if(exte===undefined || (exte!=="png" && exte!="jpg" && exte!="gif")){
        exte = "png";
    }
    const downloadUrl = `./public/notion_data/eachPage/${curriculumId}/image/${blockId}.${exte}`
    await downloadImage(url, downloadUrl);
    return downloadUrl.replace("./public","/horizon-atlas")
}

export const saveVideoAndgetUrl=async(curriculumId,blockId,url)=>{
    let exte = path.extname(new URL(url).pathname).replace(".", "");
    if (!exte) {
        exte = "mp4";
    }
    const downloadUrl = `./public/notion_data/eachPage/${curriculumId}/video/${blockId}.${exte}`
    await downloadVideo(url, downloadUrl);
    return downloadUrl.replace("./public","/horizon-atlas")
}

export const getCategoryImage=async(categoryId,cover,icon)=>{
    let iconType = "";
    let iconUrl = "";
    if(icon){
        iconType = icon.type;
        if(iconType==="file"){
            let exte = path.extname(new URL(icon.file.url).pathname).replace(".", "");
            if(exte===undefined || (exte!=="png" && exte!="jpg"  && exte!="svg")){
                exte = "png";
            }
            await downloadImage(icon.file.url, `./public/notion_data/category/${categoryId}/icon.${exte}`)
            iconUrl = `/horizon-atlas/notion_data/category/${categoryId}/icon.${exte}`
        }else if(iconType==="external"){
            iconUrl = icon.external.url
        }else if(iconType==="emoji"){
            iconUrl = icon.emoji
        }
    }
    let coverUrl = "";
    if(cover){
        if(cover.type==="file"){
            let exte = path.extname(new URL(cover.file.url).pathname).replace(".", "");
            if(exte===undefined || (exte!=="png" && exte!="jpg")){
                exte = "png";
            }
            await downloadImage(cover.file.url, `./public/notion_data/category/${categoryId}/cover.${exte}`)
            coverUrl = `/horizon-atlas/notion_data/category/${categoryId}/cover.${exte}`
        }else if(cover.type==="external"){
            coverUrl = cover.external.url
        }else if(cover.type==="emoji"){
            coverUrl = cover.emoji
        }
    }
    return {iconType,iconUrl,coverUrl}
}