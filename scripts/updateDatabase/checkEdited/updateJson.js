import fs from "fs/promises"

export async function upsertJsonById(filePath, id, newData) {
  let data = []

  try {
    // 1. ファイルを読み込み（なければ初期化）
    try {
      const raw = await fs.readFile(filePath, "utf-8")
      data = JSON.parse(raw)
    } catch (err) {
      if (err.code === "ENOENT") {
        // ファイルが存在しない場合は新規作成する
        console.log("ファイルが存在しないため、新規作成します:", filePath)
        await fs.writeFile(filePath,JSON.stringify([],null,2),"utf-8")
        data = []
      } else {
        throw err // それ以外のエラーは投げる
      }
    }

    // 2. 該当データを探す
    const index = data.findIndex(item => item.id === id)

    if (index !== -1) {
      // 3. 存在すれば更新
      data[index] = { ...data[index], ...newData }
      console.log("更新しました:", data[index])
    } else {
      // 4. なければ追加
      const newEntry = { id, ...newData }
      data.push(newEntry)
      console.log("新しく追加しました:", newEntry)
    }

    // 5. 保存
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8")

    return true
  } catch (err) {
    console.error("エラー:", err)
    return false
  }
}
