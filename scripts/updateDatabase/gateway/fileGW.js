import { deleteFile, deleteJsonById } from "../checkEdited/deleteJson.js"
import { upsertJsonById } from "../checkEdited/updateJson.js"
import fs from "fs/promises"

export async function insertPage(data,pageId,curriculumId){
    await fs.writeFile(`public/pageData/${curriculumId}/${pageId}.json`,JSON.stringify(data,null,2),"utf-8")
}

export async function insertSinglePage(data,pageId){
    await fs.writeFile(`public/pageData/${pageId}.json`,JSON.stringify(data,null,2),"utf-8")
}

export async function upsertCategory(categoryId, title, description, iconUrl,iconType, cover){
    await upsertJsonById(`public/categories/data.json`,categoryId,{id:categoryId, title, description, iconUrl,iconType, cover})
}

export async function insertPageInfo(data){
    await fs.writeFile(`public/pageInfos/data.json`,JSON.stringify(data,null,2),"utf-8")
}

export async function insertBlock(data) {
    await fs.writeFile(`public/synced/data.json`,JSON.stringify(data,null,2),"utf-8")
}

export async function upsertCurriculums(title,is_basic_curriculum,visibility,category,tag,curriculumId,iconType,iconUrl,coverUrl,order){
    await upsertJsonById(`public/curriculums/data.json`,curriculumId,{title,is_basic_curriculum,visibility,category,tag,id:curriculumId,iconType,iconUrl,coverUrl,order})
}

export async function deleteCategory(categoryId){
    await deleteJsonById(`public/categories/data.json`,categoryId,"id")
}

export async function deleteCurriculum(curriculumId){
    await deleteJsonById(`public/curriculums/data.json`,curriculumId,"id")
}

export async function deletePageByCurriculumId(curriculumId){
    await deleteJsonById("public/pageInfos/data.json",curriculumId,"curriculumId")
    // await deleteJsonById("public/synced/data.json",curriculumId,"curriculumId")
}

export async function insertTag(data){
    await fs.writeFile(`public/tags/data.json`,JSON.stringify(data,null,2),"utf-8")
}