import { getAllCategory,getAllPageData,getChildBlocks, getDatabaseData } from "./gateway/notionGateway.js";
import { insertCategory, insertCurriculum } from "./lib/insert.js";
import { getCurrentData } from "./checkEdited/checkEdited.js";
import { cleardir, initDir } from "./lib/handleFile.js";
import { insertChildren } from "./lib/insertBlock.js";
import { converce } from "./lib/convercePaageData.js";
import { deleteCategory, deleteCurriculum, deletePageByCurriculumId, insertTag } from "./gateway/fileGW.js";
import {  flushPageInfoBuffer, flushSyncedBuffer } from "./lib/fileGWbuffer.js";
import { deleteJsonById } from "./checkEdited/deleteJson.js";
import { upsertJsonById } from "./checkEdited/updateJson.js";

//data.title,
// data.is_basic_curriculum,
// data.visibility,
// data.category,
// data.tag,
// data.curriculumId,
// data.iconType,
// data.iconUrl,
// data.coverUrl,
// data.order

const insertDatas=async(data,pageInfoBuffer,syncedBuffer)=>{
    await insertCurriculum(data);
    pageInfoBuffer.push({title:data.title,curriculumId:data.curriculumId,iconType:data.iconType,iconUrl:data.iconUrl,coverUrl:data.coverUrl,order:data.order,id:data.curriculumId,parentId:""})
    initDir(data.curriculumId);
    const children = await getChildBlocks(data.curriculumId)
    await insertChildren(children,data.curriculumId,pageInfoBuffer,syncedBuffer)
}

const editDatas=async(data,pageInfoBuffer,syncedBuffer)=>{
    await insertCurriculum(data);
    pageInfoBuffer.push({title:data.title,curriculumId:data.curriculumId,iconType:data.iconType,iconUrl:data.iconUrl,coverUrl:data.coverUrl,order:data.order,id:data.curriculumId,parentId:""})
    initDir(data.curriculumId);
    await deletePageByCurriculumId(data.curriculumId);
    const children = await getChildBlocks(data.curriculumId)
    await insertChildren(children,data.curriculumId,pageInfoBuffer,syncedBuffer)
}

const deleteDatas=async(data)=>{

    await deleteCurriculum(data.id);
    await deletePageByCurriculumId(data.id);
    cleardir(`./public/notion_data/eachPage/${data.id}`)
}

getCurrentData().then(async(data)=>{
    if(!data){
        console.log("更新なし");
        process.exit(0);
    }
    try{
        console.log(data)
        // return;
        console.log("カテゴリーデータ読み込み中...")
        const categories = await getAllCategory()
        for(const category of categories){
            console.log("delete:",category.title)
            await deleteCategory(category.id)
            console.log("insert:",category.title)
            await insertCategory(category)
        }
        console.log("タグ読み込み中...")
        const database_data = await getDatabaseData()
        await insertTag(database_data.properties.tag.multi_select.options)

        // const blockBuffer = []
        const pageInfoBuffer = []
        const syncedBuffer = []
        console.log("ページデータ読み込み中...")
        const allData_ = await getAllPageData();
        const allData = await converce(allData_)
        const insertData =  allData.filter((item1)=>data.newData.some((item2)=>item1.curriculumId===item2.id))
        for(const item of insertData){
            console.log("reading:",item.title)
            await insertDatas(item,pageInfoBuffer,syncedBuffer)
        }
        console.log("ページ更新日書き換え中...")
        for(const d of data.newData){
            await upsertJsonById("public/lastEdited/curriculum.json",d.id,d)
        }
        console.log("ページ更新日書き換え完了")
        const editData = allData.filter((item1)=>data.editedData.some((item2)=>item1.curriculumId===item2.id))
        for(const item of editData){
            console.log("reading:",item.title)
            await editDatas(item,pageInfoBuffer,syncedBuffer)
        }
        console.log("ページ更新日書き換え中...")
        for(const d of data.editedData){
            await upsertJsonById("public/lastEdited/curriculum.json",d.id,d)
        }
        console.log("ページ更新日書き換え完了")
        await flushPageInfoBuffer(pageInfoBuffer)
        // await flushBlockBuffer(blockBuffer)
        await flushSyncedBuffer(syncedBuffer)
        for(const item of data.deleteData){
            await deleteDatas(item)
        }
        console.log("ページ更新日書き換え中...")
        for(const d of data.deleteData){
            await deleteJsonById("public/lastEdited/curriculum.json",d.id,"id")
        }
        console.log("ページ更新日書き換え完了")
        return process.exit(0);
    }catch(e){
        console.log("error",e)
        process.exit(1);
    }
})
