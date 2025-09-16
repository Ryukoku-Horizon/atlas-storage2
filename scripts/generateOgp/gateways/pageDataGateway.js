import "dotenv/config"

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export class PageDataGateway{
    static getPageDataByConditions=async(select,match)=>{
        const res = await fetch(`${SUPABASE_URL}/functions/v1/getPageDataWithSelect`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            },
            body:JSON.stringify({
                match,
                select
            })
        })
        const data = await res.json()
        return data;
    }
}

export const getChildPageIds = async(type="child_page")=>{
    const pageDatas = await PageDataGateway.getPageDataByConditions("curriculumId,blockId",{"type":type});
    const pageIds = pageDatas.map((data)=>{
        return {
            curriculumId:data.curriculumId,
            pageId:data.blockId
        }
    })
    return pageIds;
}

export const getTitleAndIcon=async(pageId)=>{
    const data = await PageDataGateway.getPageDataByConditions("data",{blockId:pageId})
    const pageBlockData = JSON.parse(data[0].data)
    const title = pageBlockData.parent.replace("##","")
    const iconUrl = pageBlockData.iconUrl;
    const iconType = pageBlockData.iconType;
    const coverUrl = pageBlockData.coverUrl;
    return {title,iconUrl,iconType,coverUrl};
}