import { readFile } from "fs/promises"

export const getPages=async()=>{
    const pages = await readFile("./public/pageInfos/data.json", "utf-8")
    const data = JSON.parse(pages);
    return data
}