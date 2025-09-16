import { getSinglePageBlock } from "../gateway/notionGateway.js"
import { getPageIcon } from "./dataSave.js"
import { rewriteLinks } from "./rewriteLink.js"
import { searchCurriculum } from "./searchBlock.js"

export const processParent=async(parent)=>{
    const type = parent.type
    const rewrited = await rewriteLinks(parent.href)
    const data_ = {
        annotations:parent.annotations,
        plain_text:parent.plain_text,
        href:parent.href,
    }
    if(type==="mention" && rewrited!==null){
        const mentino = parent.mention
        console.log("mention",mentino)
        const mentionType = mentino.type
        if(mentionType==="page"){
            const id = mentino.page.id;
            const pageData = await getSinglePageBlock(id)
            const curriculumId = await searchCurriculum(id)
            if(!pageData || !curriculumId){
                return {
                    ...data_,
                    href:rewrited.href,
                    scroll:rewrited.scroll,
                    mention:{
                        type:mentionType,
                        content:mentino[mentionType]
                    }
                }
            }else{
                const iconData = await getPageIcon(curriculumId,id,pageData.icon)
                return {
                    ...data_,
                    href:rewrited.href,
                    scroll:rewrited.scroll,
                    mention:{
                        type:"prossedPage",
                        content:{...iconData,title:pageData.title}
                    }
                }
            }
        }
        return {
            ...data_,
            href:rewrited.href,
            scroll:rewrited.scroll,
            mention:{
                type:mentionType,
                content:mentino[mentionType]
            }
        }
    }
    if(rewrited!==null){
        return {...data_,href:rewrited.href,scroll:rewrited.scroll}
    }
    return data_
}