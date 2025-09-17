import { readFile } from "fs/promises"

export const getAllCategories=async()=>{
    const pages = await readFile("./public/categories/data.json", "utf-8")
    const data = JSON.parse(pages);
    return data
}