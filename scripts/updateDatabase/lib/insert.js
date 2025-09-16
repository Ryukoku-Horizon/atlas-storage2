import "dotenv/config"
import {getCategoryImage} from "./dataSave.js"
import { upsertCategory, upsertCurriculums } from "../gateway/fileGW.js";

export async function insertCurriculum(data){
    await upsertCurriculums(
        data.title,
        data.is_basic_curriculum,
        data.visibility,
        data.category,
        data.tag,
        data.curriculumId,
        data.iconType,
        data.iconUrl,
        data.coverUrl,
        data.order);
}

export async function insertCategory(data){
    const pageImage = await getCategoryImage(data.id,data.cover,data.icon)
    // console.log("icon",pageImage.icon)
    await upsertCategory(
        data.id,
        data.title,
        data.description,
        pageImage.iconUrl,
        pageImage.iconType,
        pageImage.coverUrl,
    )
}