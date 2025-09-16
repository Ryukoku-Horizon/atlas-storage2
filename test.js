//270a501ef33780098927ce4910363758
import "dotenv/config"
import { Client, isFullPage } from "@notionhq/client";

const token = process.env.NOTION_TOKEN_HORIZON
const db = process.env.NOTION_DB_ID_HORIZON
const category_db = process.env.NOTION_DB_ID_CATEGORY;

const notion = new Client({ auth:token });

export const getSingleblock = async (blockId, retries = 5) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await notion.blocks.retrieve({ block_id: blockId });
            return response;
        } catch (error) {
            if(error.code === "notionhq_client_request_timeout"){
                console.log("code")
                console.warn(`Rate limit exceeded. Retrying in ${10} seconds...`);
                await wait(1000)
            }else if(error.code==="object_not_found"){
                return undefined
            }else {
                throw error;
            }
        }
    }
    throw new Error("Failed to retrieve block after multiple attempts.");
};

export const getChildBlocks = async (blockId, retries = 5) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await notion.blocks.children.list({
                "block_id":blockId,
            })
            return response.results;
        } catch (error) {
            if (error.RequestTimeoutError) {
                console.warn(`Rate limit exceeded. Retrying in ${10} seconds...`);
                await wait(1000)
            } else {
                throw error;
            }
        }
    }
    throw new Error("Failed to retrieve block after multiple attempts.");
};

getSingleblock("270a501ef33780098927ce4910363758").then((d)=>{
    // console.log(d)
    const from = d.synced_block.synced_from.block_id
    getChildBlocks(from).then((c)=>{
        for(const child of c){
            if(child.has_children){
                getChildBlocks()
            }
        }
    })
})