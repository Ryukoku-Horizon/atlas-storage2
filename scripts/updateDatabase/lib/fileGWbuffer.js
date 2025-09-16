import { insertBlock, insertPageInfo, insertSinglePage } from "../gateway/fileGW.js";
import { readFile } from "fs/promises"

export async function flushBuffer(buffer,pageId) {
    console.log("writing file...")
    await insertSinglePage(buffer,pageId)
}

// export async function flushPageBuffer(buffer,curriculumId){
//     await insertPageInfo(buffer,curriculumId)
// }

export async function flushPageInfoBuffer(buffer) {
    const existingData = await readFile("./public/pageInfos/data.json", "utf-8")
    const data = JSON.parse(existingData);
    const uniqueData = [...new Map([...data,...buffer].map(item => [item.id, item])).values()];
    await insertPageInfo(uniqueData)
}

export async function flushSyncedBuffer(buffer){
    const existingData = await readFile("./public/synced/data.json", "utf-8")
    const data = JSON.parse(existingData)
    const uniqueData = [...new Map([...data,...buffer].map(item => [item.id, item])).values()];
    await insertBlock(uniqueData)
}