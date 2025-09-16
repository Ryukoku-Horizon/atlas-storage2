import { getSingleblock } from "../gateway/notionGateway.js";
import { searchCurriculum } from "./searchBlock.js";
//https://www.notion.so/24ba501ef337810383accac23c85dce4

export async function rewriteLinks(href) {
    if(href===null) return null;
    console.log(href)
    if (href.startsWith("https://") || href.startsWith("http://")){
        if(new URL(href).origin==="https://www.notion.so"){
            const pageHref = href.split("/")[3]
            const pageId = pageHref.split("#")[0]
            const hai = await getSingleblock(pageId)
            const curriculumId = await searchCurriculum(pageId)
            if(!curriculumId || !hai) return null;
            if(pageHref.split("#")[1]){
                const blockId = pageHref.split("#")[1]
                const blockHai = await getSingleblock(blockId)
                if(!blockHai) return null;
                const url = `/posts/curriculums/${curriculumId}/${hai.id}`
                return {
                    href:url,
                    scroll:blockHai.id
                }
            }else{
                const url = `/posts/curriculums/${curriculumId}/${hai.id}`;
                return {
                    href:url,
                }
            }
        }else{
            return {href};
        }
    }else{
        if(href.split("#")[1]){
            const pageId = href.split("#")[0].slice(1)
            const hai = await getSingleblock(pageId)
            const curriculumId = searchCurriculum(pageId)
            if(!hai || !curriculumId){
                return null
            }else{
                const url = `/posts/curriculums/${curriculumId}/${hai.id}`
                if(href.split("#")[1]){
                    const blockId = href.split("#")[1]
                    const blockHai = await getSingleblock(blockId)
                    if(!blockHai) return null;
                    return {
                        href:url,
                        scroll:blockHai.id
                    }
                }else{
                    return {
                        href:url,
                    }
                }
            }
        }
        const pageId = href.slice(1)
        const hai = await getSingleblock(pageId)
        const curriculumId = await searchCurriculum(pageId)
        if(!hai || !curriculumId){
            return null
        }else{
            const url =  `/posts/curriculums/${curriculumId}/${hai.id}`;
            return {
                href:url
            }
        }
    }
}

const rewritePageMention=async(parents)=>{
    const newParents = []
    for(const p of parents){
        if(p.mention && p.mention.type==="page" && p.mention.content){
            const id = p.mention.content.id;
            const data = await PageDataService.getTitleAndIcon(id)
            const {title,iconType,iconUrl}= data ?? ""
            newParents.push({
                ...p,
                mention:{
                    type:"prossedPage",
                    content:{
                        title,iconType,iconUrl
                    }
                }
            })
        }else {
            newParents.push(p)
        }
    }
    return newParents
}