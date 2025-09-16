import { getSingleblock } from "../gateway/notionGateway.js"

export const searchCurriculum=async(blockId)=>{
    const block = await getSingleblock(blockId)
    if(block===undefined){
        return;
    }
    const parentType = block.parent.type
    const isCurriculum = parentType==="database_id"
    if(isCurriculum){
        return block.id;
    }else{
        const parentId = block.parent[parentType]
        return await searchCurriculum(parentId)
    }
}