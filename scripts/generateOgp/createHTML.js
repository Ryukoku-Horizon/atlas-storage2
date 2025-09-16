export const createHTML=(coverUrl,iconType,iconUrl,title)=>{
    const file_icon = `https://ryukoku-horizon.github.io/horizon-atlas/pngwing.png`;
    const html = `
      <html>
        <body style="margin: 0; width: 1203px; height: 630px; background: white; display: flex; justify-content: center; align-items: center;">
          ${coverUrl!=="" ? `<img src=${coverUrl} style="position: absolute;top: 0px;left:-10px; width: 101%;height: 320px;object-fit: cover;">` : ""}
          ${coverUrl!=="" ? `<div>
            ${iconType==="" ? `<img src="${file_icon}" style="width: 9rem; height: 9rem;position: absolute; top: 235px; left: 90px" >` : ""}
            ${(iconType !== "emoji" && iconType!=="") ? `<img src=${iconUrl} style="width: 9rem; height: 9rem;position: absolute; top: 235px; left: 90px" >` : ""}
            ${iconType === "emoji" ? `<p style="font-size: 7rem; position: absolute; top: 130px; left: 90px">${iconUrl}</p>` : ""}
            <h2 style="font-size: 64px; font-style: bold;position: absolute; top: 320px; left:40px;">${title}</h2>
            <p style="font-size:28px; position: absolute; top: 440px; left: 40px;color:rgb(158, 159, 159);">on HorizonAtlas</p>
          </div>` :
          `
          <div  style="display: flex;flex-direction: column;align-items: center; justify-content: center; flex:1;">
            <div style="display: flex; align-items: center; justify-content: center; flex:1; grid-gap: 5px;">
              ${iconType==="" ? `<img src="${file_icon}" style="width: 9rem; height: 9rem;" >` : ""}
              ${(iconType !== "emoji" && iconType!=="") ? `<img src=${iconUrl} style="width: 9rem; height: 9rem;" >` : ""}
              ${iconType === "emoji" ? `<p style="font-size: 7.5rem;">${iconUrl}</p>` : ""}
              <h2 style="font-size: 64px; font-style: bold;">${title}</h2>
            </div>
            <p style="font-size:28px; color:rgb(158, 159, 159);position: absolute; bottom: 20px; right: 50px;">on HorizonAtlas</p>
          <div>
            `}
        </body>
      </html>
    `;
    return html
}