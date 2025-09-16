import { getEditTimeData } from "../gateway/notionGateway.js";
import { readFile } from "fs/promises"

export const getCurrentData=async()=>{
    console.log("ページの更新確認中...")
    const editTimeData = await getEditTimeData();
    // const json = JSON.stringify(editTimeData, null, 2);
    // fs.writeFileSync("public/lastEdited/curriculum.json",json,"utf-8")
    const raw = await readFile("./public/lastEdited/curriculum.json", "utf-8");
    const data = JSON.parse(raw);
    // editTimeData.map((item)=>{
    //     console.log(item.id)
    // })
    // console.log(filtered)
    // return null;
    const newData = editTimeData.filter((item1)=>data.every((item2)=>item1.id !== item2.id))
    console.log(`新たなページ":${newData.length}個`)
    const editedData = editTimeData.filter((item1)=>data.some((item2)=>
        item1.Last_edited_time !== item2.Last_edited_time && item1.id === item2.id && item1.update
    ))
    console.log(`編集されたページ:${editedData.length}個`)
    const deleteData = data.filter((item1)=>editTimeData.every((item2)=>item1.id!==item2.id))
    console.log(`削除されたページ:${deleteData.length}個`)
    if(newData.length===0 && editedData.length===0 && deleteData.length===0){
        return null;
    }
    return {newData,editedData,deleteData}
    // return null
}