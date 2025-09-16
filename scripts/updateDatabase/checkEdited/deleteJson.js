import fs from "fs/promises"

export async function deleteJsonById(filePath, id,idName) {
  try {
    // 1. ファイルを読み込み
    const raw = await fs.readFile(filePath, "utf-8");
    let data = JSON.parse(raw);

    // 2. 指定idのデータを削除（filterで残したいものだけ残す）
    const newData = data.filter(item => item[idName] !== id);

    if (newData.length === data.length) {
      console.log("対象のIDが見つかりません:", id);
      return false;
    }

    // 3. 保存
    await fs.writeFile(filePath, JSON.stringify(newData, null, 2), "utf-8");

    console.log("削除しました:", id);
    return true;
  } catch (err) {
    console.error("エラー:", err);
    return false;
  }
}

export async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath); // または fs.rm(filePath);
    console.log("削除しました:", filePath);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("ファイルが存在しません:", filePath);
    } else {
      console.error("削除エラー:", err);
    }
  }
}