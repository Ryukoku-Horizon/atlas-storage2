import puppeteer from 'puppeteer';

async function isValidUrl(url) {
    try {
        const res = await fetch(url, { method: 'HEAD' }); // HEADなら本文を取得しない
        return res.ok; // ステータスコード 200-299なら true
    } catch (err) {
        return false;
    }
}

export async function getOGPWithPuppeteer(url) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    const page = await browser.newPage();

    // Cloudflare / Bot対策
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36');

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const limit = 3
    let b = false;
    for(let i=0;i<limit;i++){
        await page.waitForSelector('meta[property="og:title"]', { timeout: 7000 }).then(()=>{
            b = true
            console.log("✅ タグが見つかりました")
        }).catch(() => {
            if(i ===3){
                console.log('❌ OGPタグが見つかりませんでした');
            }else{
                console.log('OGPタグが見つかりませんでした\n',`${8}秒待ちます`)
            }
        });
        if(b){
            break;
        }
    }
    const title = await page.title();

    let ogp = {};
    try {
    ogp = await page.evaluate(() => {
        const absoluteUrl = (path) => path ? new URL(path, document.baseURI).href : null;
        return {
        description: document.querySelector('meta[name="description"]')?.content || null,
        image: absoluteUrl(document.querySelector('meta[property="og:image"]')?.content),
        icon: absoluteUrl(document.querySelector('link[rel="icon"]')?.href)
        };
    });
    } catch (err) {
        console.error("⚠️ page.evaluate 中にフレームが破棄されました:", err);
    }

    await browser.close();

    let iconUrl = ogp.icon
    if(ogp.icon && !ogp.icon.startsWith("https://")){
        const domain = new URL(url).origin
        const fullURL = `${domain}${iconUrl}`
        const isValid = await isValidUrl(fullURL)
        if(isValid){
            iconUrl = fullURL
        }else{
            iconUrl = null
        }
    }
    let imageUrl = ogp.image;
    if(ogp.image && !ogp.image.startsWith("https://")){
        const domain = new URL(url).origin;
        const fullURL = `${domain}${imageUrl}`
        const isValid = await isValidUrl(fullURL)
        if(isValid){
            imageUrl = fullURL
        }else{
            imageUrl = null
        }
    }
    return { title:title ?? url,icon:iconUrl,image:imageUrl, ...ogp }
}