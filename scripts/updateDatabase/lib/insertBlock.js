import { getChildBlocks, getSinglePageBlock } from "../gateway/notionGateway.js"
import { getPageCover, getPageIcon, saveImageAndgetUrl, saveVideoAndgetUrl, useIframely } from "./dataSave.js"
import { canEmbedIframe } from "./embed.js"
import { getOGPWithPuppeteer } from "./ogp.js"
import { processParent } from "./processParent.js"
import { searchCurriculum } from "./searchBlock.js"
import { flushBuffer } from "./fileGWbuffer.js"

export async function insertChildren(children,curriculumId,pageInfoBuffer,syncedBuffer){
    const buffer = []
    for(let i=0;i<children.length;i++){
        await insertChild(children[i],curriculumId,curriculumId,curriculumId,i,`${i + 1}/${children.length}`,buffer,pageInfoBuffer,syncedBuffer)
    }
    await flushBuffer(buffer,curriculumId,curriculumId)
}

async function insertChild(block,curriculumId,pageId,parentId,i,p,buffer,pageInfoBuffer,syncedBuffer){
    const type = block.type
    console.log(`insert ${type}...`)
    await insertblock(curriculumId,parentId,block,pageId,type,i + 1,buffer,pageInfoBuffer,syncedBuffer)
    if(block.has_children){
        if(type==="child_page"){
            const newBuffer = [];
            const children = await getChildBlocks(block.id)
            for(let k=0;k<children.length;k++){
                await insertChild(
                    children[k],
                    curriculumId,
                    block.id,
                    block.id,
                    k,
                    `${p}[${k + 1}/${children.length}]`,
                    newBuffer,
                    pageInfoBuffer,
                    syncedBuffer
                )
            }
            await flushBuffer(newBuffer,curriculumId,block.id)
        }else if((type==="synced_block" && block.synced_block.synced_from===null) || type!=="synced_block"){
            const children = await getChildBlocks(block.id)
            await Promise.all(
                children.map((child, k) =>
                    insertChild(
                        child,
                        curriculumId,
                        pageId,
                        block.id,
                        k,
                        `${p}[${k + 1}/${children.length}]`,
                        buffer,
                        pageInfoBuffer,
                        syncedBuffer
                    )
                )
            );
        }
    }
    console.log(p)
}

async function insertblock(curriculumId,parentId,data,pageId,type,i,buffer,pageInfoBuffer,syncedBuffer){
    if(type==="callout"){
        await insertCallout(curriculumId,pageId,parentId,data,i,buffer)
    }else if(type==="paragraph" || type==="quote" || type==="toggle" || type==="bulleted_list_item" || type==="numbered_list_item" || type==="to_do"){
        await insertParagragh(curriculumId,pageId,parentId,data,i,buffer)
    }else if(type ==='heading_1' || type ==='heading_2' || type ==='heading_3'){
        await insertHeading(curriculumId,pageId,parentId,data,i,buffer)
    }else if(type==="image"){
        await insertImage(curriculumId,pageId,parentId,data,i,buffer)
    }else if(type==="embed"){
        await insertEmbed(curriculumId,pageId,parentId,data,i,buffer)
    }else if(type==="bookmark"){
        await insertBookmark(curriculumId,pageId,parentId,data,i,buffer);
    }else if(type ==="table"){
        await insertTable(curriculumId,pageId,parentId,data,i,buffer)
    }else if(type ==="table_row"){
        await insertTable_row(curriculumId,pageId,parentId,data,i,buffer)
    }else if(type==="video"){
        await insertVideo(curriculumId,pageId,parentId,data,i,buffer)
    }else if(type==="child_page"){
        await insertPageInfo(curriculumId,pageId,parentId,data,i,buffer,pageInfoBuffer)
    }else if(type==="link_to_page"){
        await insertLinkToPage(curriculumId,pageId,parentId,data,i,buffer)
    }else if(type==="code"){
        await insertCode(curriculumId,pageId,parentId,data,i,buffer)
    }else if(type==="synced_block"){
        await insertSynced_block(curriculumId,pageId,parentId,data,i,buffer,syncedBuffer)
    }else{
        await buffer.push({curriculumId,parentId,data:"_",blockId:data.id,type:data.type,pageId,i})
    }
}

async function insertVideo(curriculumId,pageId,parentId,res,i,buffer){
    const url = res[res.type][res[res.type].type].url
    const downloadUrl = await saveVideoAndgetUrl(curriculumId,res.id,url)
    const parent = await Promise.all(res[res.type].caption.map(async(text)=>{
        return await processParent(text);
    }))
    const data = {
        parent,
        url:downloadUrl
    }
    buffer.push({curriculumId,parentId,data:JSON.stringify(data),blockId:res.id,type:res.type,pageId,i});
}

async function insertTable_row(curriculumId,pageId,parentId,res,i,buffer){
    const data = res.table_row.cells
    const parent = await Promise.all(data.map(async(i)=>await Promise.all(i.map(async(d)=>{
        return await processParent(d)
    }))))
    buffer.push({curriculumId,parentId,data:JSON.stringify(parent),blockId:res.id,type:res.type,pageId,i})
}

async function insertTable(curriculumId,pageId,parentId,res,i,buffer){
    const data = res.table
    buffer.push({curriculumId,parentId,data:JSON.stringify(data),blockId:res.id,type:res.type,pageId,i})
}

async function insertBookmark(curriculumId,pageId,parentId,res,i,buffer){
    const url = res.bookmark.url;
    const ogp = await getOGPWithPuppeteer(url)
    const parent = await Promise.all(res.bookmark.caption.map(async(text)=>{
        return await processParent(text)
    }))
    const data = {
        parent,
        url,
        ogp
    }
    buffer.push({curriculumId,parentId,data:JSON.stringify(data),blockId:res.id,type:res.type,pageId,i});
}

async function insertEmbed(curriculumId,pageId,parentId,res,i,buffer){
    const url = res.embed.url
    const canEmbed = await canEmbedIframe(url)
    const parent = await Promise.all(res.embed.caption.map(async(text)=>{
        return await processParent(text)
    }))
    if(canEmbed){
        const data = {
            parent,
            url,
            canEmbed
        }
        buffer.push({curriculumId,parentId,data:JSON.stringify(data),blockId:res.id,type:res.type,pageId,i});
        return;
    }
    if(!canEmbed){
       const embedData = await useIframely(url)
        const data = {
            parent,
            url,
            canEmbed,
            embedData
        }
        buffer.push({curriculumId,parentId,data:JSON.stringify(data),blockId:res.id,type:res.type,pageId,i});
    }
}

async function insertImage(curriculumId,pageId,parentId,res,i,buffer){
    const url = res[res.type][res[res.type].type].url
    const downloadUrl = await saveImageAndgetUrl(curriculumId,res.id,url)
    const parent = await Promise.all(res[res.type].caption.map(async(text)=>{
        return await processParent(text)
    }))
    const data = {
        parent,
        url:downloadUrl
    }
    buffer.push({curriculumId,parentId,data:JSON.stringify(data),blockId:res.id,type:res.type,pageId,i});
}

async function insertHeading(curriculumId,pageId,parentId,res,i,buffer){
    const data = {
        parent:await Promise.all(res[res.type].rich_text.map(async(text)=>{
            return await processParent(text);
        })),
        color:res[res.type].color,
        is_toggleable:res[res.type].is_toggleable
    }
    buffer.push({curriculumId,parentId,data:JSON.stringify(data),blockId:res.id,type:res.type,pageId,i});
}

async function insertParagragh(curriculumId,pageId,parentId,res,i,buffer){
    const data = {
        color:res[res.type].color,
        parent:await Promise.all(res[res.type].rich_text.map(async(text)=>{
            return await processParent(text);
        }))
    }
    buffer.push({curriculumId,parentId,data:JSON.stringify(data),blockId:res.id,type:res.type,pageId,i});
}

async function insertPageInfo(curriculumId,pageId,parentId,block,i,buffer,pageInfoBuffer){
    const res = await getSinglePageBlock(block.id);

    // アイコンとカバー画像を取得
    const pageIcon = await getPageIcon(curriculumId, block.id, res.icon)
    const pageCover = await getPageCover(curriculumId, block.id, res.cover)

    // データを保存
    const data = {
        parent: block.child_page.title,
        iconType: pageIcon.iconType,
        iconUrl: pageIcon.iconUrl,
        coverUrl: pageCover
    };
    pageInfoBuffer.push({curriculumId,title:data.parent,iconType:data.iconType,iconUrl:data.iconUrl,coverUrl:data.coverUrl,id:block.id,order:i,parentId:pageId})
    buffer.push({curriculumId, parentId, data:JSON.stringify(data), blockId:block.id, type:block.type, pageId, i});
}

async function insertCallout(curriculumId,pageId,parentId,res,i,buffer){
    const parent = await Promise.all(res.callout.rich_text.map(async(text)=>{
        return await processParent(text)
    }))
    if(res.icon && res.icon.emoji){
        const data = {
            icon:res.callout.icon,
            color:res.callout.color,
            parent
        }
        buffer.push({curriculumId,parentId,data:JSON.stringify(data),blockId:res.id,type:res.type,pageId,i});
    }else{
        const data = {
            icon:res.callout.icon,
            color:res.callout.color,
            parent
        }
        buffer.push({curriculumId,parentId,data:JSON.stringify(data),blockId:res.id,type:res.type,pageId,i});
    }
}

async function insertLinkToPage(curriculumId,pageId,parentId,res,i,buffer){
    const pageLink = res.link_to_page.page_id
    const curriculum = await searchCurriculum(pageLink)
    if(!curriculum){
        buffer.push({curriculumId,parentId,data:pageLink,blockId:res.id,type:res.type,pageId,i})
        return;
    }
    const link = `/posts/curriculums/${curriculum}/${pageLink}`
    const pageData = await getSinglePageBlock(pageLink)
    const icon = await getPageIcon(curriculum,pageLink,pageData.icon,true)
    const data = {
        link,
        iconUrl:icon.iconUrl,
        iconType:icon.iconType,
        title:pageData.title
    }
    buffer.push({curriculumId,parentId,data,blockId:res.id,type:res.type,pageId,i})
}

async function insertCode(curriculumId,pageId,parentId,res,i,buffer){
    const language = res.code.language
    const rich_text = res.code.rich_text.length===0 ? [] : res.code.rich_text.map((i)=>i.plain_text)
    const caption = await Promise.all(res.code.caption.map(async(text)=>{
        return await processParent(text)
    }))
    const data ={
        language,
        parent:rich_text,
        caption
    }
    buffer.push({curriculumId,parentId,data:JSON.stringify(data),blockId:res.id,type:res.type,pageId,i})
}

async function insertSynced_block(curriculumId,pageId,parentId,res,i,buffer,syncedBuffer){
    const syncedFrom = res.synced_block.synced_from
    if(syncedFrom!==null){
        const type = syncedFrom.type;
        const from = syncedFrom[type];
        buffer.push({curriculumId,parentId,data:from,blockId:res.id,type:res.type,pageId,i})
    }else{
        syncedBuffer.push({curriculumId,parentId,data:"original",blockId:res.id,type:res.type,pageId,i})
        buffer.push({curriculumId,parentId,data:"original",blockId:res.id,type:res.type,pageId,i})
    }
}