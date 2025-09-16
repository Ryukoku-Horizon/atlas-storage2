import "dotenv/config"
import { Client, isFullPage } from "@notionhq/client";

const token = process.env.NOTION_TOKEN_HORIZON
const db = process.env.NOTION_DB_ID_HORIZON
const category_db = process.env.NOTION_DB_ID_CATEGORY;

const notion = new Client({ auth:token });

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const getAllPageData=async()=>{
    const data = await notion.databases.query({
        database_id:db,
        "filter":{
            property: "published",
            checkbox: {
                equals: true,
            },
        }
    })
    return data.results;
}

export const getDatabaseData=async()=>{
    const data = await notion.databases.retrieve({
        database_id:db
    })
    return data;
}

export const getEditTimeData = async () => {
    console.log(token)
    const posts = await notion.databases.query({
        database_id:db,
        filter: {
            property: "published",
            checkbox: {
                equals: true,
            },
        }
    });

    const allPosts = posts.results.filter(isFullPage);
    return allPosts.map((post)=>{return {id:post.id,title:post.properties.title.title[0].text.content,Last_edited_time:post.last_edited_time,update:post.properties.update.checkbox,}});
};

export const getAllData = async () => {
    const posts = await notion.databases.query({
        database_id:db,
    });

    const allPosts = posts.results;
    return allPosts.map(getPageMetaData);
};

const getPageMetaData = (post) => {
    const getTags = (tags) => tags.map(tag => tag.name || "");
    const getVisibilities = (visibilities) => visibilities.map(visibility=> visibility.name || "");
    const properties = post.properties;

    return {
        id: post.id,
        cover:post.cover,
        icon:post.icon,
        title: properties.title?.title?.[0]?.plain_text || "untitled",
        tags: properties.tag?.multi_select ? getTags(properties.tag.multi_select) : [],
        category: properties.category?.select?.name || "",
        is_basic_curriculum: properties.is_basic_curriculum?.checkbox || false,
        visibility: properties.visibility?.multi_select ? getVisibilities(properties.visibility.multi_select) : [],
        order:properties.order.number
    };
};

export const getAllCategory = async () => {
    const posts = await notion.databases.query({
        database_id: category_db,
    });

    const allPosts = posts.results;
    // return allPosts
    return allPosts.map(getCategoryMetaData);
};

const getCategoryMetaData = (post) => {
    const properties = post.properties;

    return {
        id: post.id,
        cover:post.cover || "",
        icon:post.icon || "",
        title: properties.title?.title?.[0]?.plain_text || "untitled",
        description:properties.description.rich_text[0]?.plain_text || ""
    };
};

export const getSinglePageBlock = async (pageId, retries=10) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await notion.pages.retrieve({
                page_id: pageId,
              });
            const date = new Date(response.last_edited_time)
            const parent = response.parent
            const title = response.properties.title.title[0].plain_text
            return {
                icon:response.icon,
                cover:response.cover,
                parent,
                title,
                date:date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
            };
        } catch (error) {
            if (error.RequestTimeoutError) {
                console.warn(`Rate limit exceeded. Retrying in ${10} seconds...`);
                await wait(1000)
            } else {
                console.log("error bunsyo",error)
                throw error;
            }
        }
    }
    throw new Error("Failed to retrieve block after multiple attempts.");
};

export const getPage = async (id) => {
    const posts = await notion.pages.retrieve({
        page_id:id,
    })

    return posts
};

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