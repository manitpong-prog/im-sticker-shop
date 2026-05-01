const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://mtmpzbsatolmuttzdxet.supabase.co', 'sb_secret_3rRZ1zjY2mqKCw70VG-wDw_-vfEUS-f');

// === CONFIG ===
const START_PAGE = 5;
const END_PAGE = 1;
const PAGE_DELAY_MS = 1000;

const TABLE_NAME = 'test_taiwan';
const MAIN_TABLE_NAME = 'test_stickers';

const TARGET = {
  name: 'สติกเกอร์ทางการไต้หวัน',
  url: 'https://store.line.me/stickershop/showcase/new/en',
  type: 'sticker',
  category: 'taiwan',
};
// ==============

async function runScraperTaiwan() {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  page.setDefaultTimeout(90000);

  console.log(
    `\n==================== 🇹🇼 เริ่มเก็บหมวด: ${TARGET.name} ====================`
  );

  try {
    let collectedItems = 0;

    for (let p = START_PAGE; p >= END_PAGE; p--) {
      const pageUrl = `${TARGET.url}?page=${p}`;

      console.log(`\n🌐 กำลังสแกนหน้ารวม: หน้า [${p}] - ${pageUrl}`);

      try {
        await page.goto(pageUrl, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });
      } catch (err) {
        console.log(`   ⚠️ ไปยัง ${pageUrl} ไม่ได้: ${err.message}`);
        continue;
      }

      const itemsWithPos = await page
        .$$eval('a[href*="/product/"]', anchors => {
          const map = new Map();

          for (const a of anchors) {
            const href = a.href;

            if (!href || href.includes('/showcase/')) continue;
            if (map.has(href)) continue;

            const rect = a.getBoundingClientRect();

            map.set(href, {
              top: rect.top,
              right: rect.right,
            });
          }

          return Array.from(map.entries()).map(([href, { top, right }]) => ({
            href,
            top,
            right,
          }));
        })
        .catch(() => []);

      itemsWithPos.sort((a, b) => {
        if (a.top === b.top) return b.right - a.right;
        return b.top - a.top;
      });

      const productLinks = itemsWithPos.map(item => item.href);

      console.log(
        `   📦 พบ ${productLinks.length} รายการในหน้า ${p} (เรียงจากล่างขวา → บนซ้าย)`
      );

      if (!productLinks || productLinks.length === 0) {
        continue;
      }

      for (let i = 0; i < productLinks.length; i++) {
        const link = productLinks[i];

        try {
          const idParts = link.split('/product/');

          if (!idParts[1]) {
            continue;
          }

          const pId = idParts[1].split('/')[0];

          console.log(
            `\n   [page ${p}][${i + 1}/${productLinks.length}] ➡️ เจาะข้อมูล: ${pId}`
          );

          // ถ้ามีสินค้า ID นี้อยู่ในตารางหลักแล้ว ให้ข้าม
          const { data: existsInMain } = await supabase
            .from(MAIN_TABLE_NAME)
            .select('id')
            .eq('id', pId)
            .maybeSingle();

          if (existsInMain) {
            console.log(`      ⏭️ ข้าม ${pId} เพราะมีอยู่ใน ${MAIN_TABLE_NAME} แล้ว`);
            continue;
          }

          try {
            await page.goto(link, {
              waitUntil: 'networkidle',
              timeout: 30000,
            });
          } catch (err) {
            console.log(`      ⚠️ โหลดหน้าสินค้าไม่สำเร็จ: ${err.message}`);
            continue;
          }

          await page.waitForLoadState('networkidle').catch(() => {});
          await page
            .waitForSelector(
              '.mdCMN38Item01Ttl, .mdCMN38Ttl, .mdCMN08Ttl',
              { timeout: 5000 }
            )
            .catch(() => null);

          const title = await page
            .innerText('.mdCMN38Item01Ttl, .mdCMN38Ttl, .mdCMN08Ttl')
            .catch(() => 'Unknown');

          const priceText = await page
            .innerText('.mdCMN38Item01Price, .mdCMN38Price, .mdCMN08Price')
            .catch(() => '0');

          let price = 0;

          if (priceText.includes('US$1.99')) {
            price = 65;
          } else {
            price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;
          }

          let finalMainImg;
          let finalImageList = [];
          let isAnimated = false;

          const previewAttr = await page
            .getAttribute('.mdCMN38Img', 'data-preview')
            .catch(() => null);

          if (previewAttr && TARGET.type !== 'theme') {
            let info = null;

            try {
              info = JSON.parse(previewAttr);
            } catch (err) {
              console.log(`      ⚠️ อ่าน data-preview ไม่ได้: ${err.message}`);
            }

            if (info) {
              isAnimated =
                info.type === 'animation' ||
                info.type === 'animation_sound';

              if (isAnimated) {
                finalMainImg = `https://stickershop.line-scdn.net/stickershop/v1/product/${pId}/iPhone/main_animation@2x.png`;

                const stickerIds = await page
                  .$$eval('.FnStickerList li', lis => {
                    return lis
                      .map(li => {
                        try {
                          const data = JSON.parse(
                            li.getAttribute('data-preview') || '{}'
                          );

                          return data.id;
                        } catch {
                          return null;
                        }
                      })
                      .filter(id => id);
                  })
                  .catch(() => []);

                finalImageList = stickerIds.map(stickerId => {
                  return `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stickerId}/iPhone/sticker_animation@2x.png`;
                });
              } else {
                finalMainImg = await page
                  .$eval('.mdCMN38Img .mdCMN38Image', el => {
                    const style = el.getAttribute('style') || '';
                    const match = style.match(/url\(["']?(.*?)["']?\)/);

                    return match ? match[1].split('?')[0] : null;
                  })
                  .catch(() => info.staticUrl || null);

                const stickerUrls = await page
                  .$$eval(
                    '.FnStickerList li .mdCMN09Image, .FnEmojiList li .mdCMN09Image',
                    imgs => {
                      return imgs
                        .map(img => {
                          const style = img.getAttribute('style') || '';
                          const match = style.match(/url\(["']?(.*?)["']?\)/);

                          return match ? match[1].split('?')[0] : null;
                        })
                        .filter(url => url);
                    }
                  )
                  .catch(() => []);

                finalImageList = [...new Set(stickerUrls)];
              }
            }
          }

          if (!finalMainImg || finalImageList.length === 0) {
            finalMainImg = await page
              .getAttribute('.mdCMN38Img img, .mdCMN08Img img', 'src')
              .catch(() => null);

            finalImageList = await page
              .$$eval('.FnStickerList img, .FnEmojiList img', imgs => {
                const urls = new Set();

                imgs.forEach(img => {
                  const src =
                    img.getAttribute('src') ||
                    img.getAttribute('data-src') ||
                    '';

                  if (
                    src &&
                    (src.includes('stickershop') || src.includes('line-scdn'))
                  ) {
                    urls.add(src.split('?')[0]);
                  }
                });

                return Array.from(urls);
              })
              .catch(() => []);
          }

          finalImageList = [...new Set(finalImageList.filter(Boolean))];

          console.log(
            `      📸 ดึงรูปได้: ${finalImageList.length} รูป (${isAnimated ? 'เคลื่อนไหว' : 'ปกติ'})`
          );

          if (!finalMainImg || finalImageList.length === 0) {
            console.log(`      ⏩ ข้าม ${pId} เพราะดึงรูปไม่ครบ`);
            continue;
          }

          const payload = {
            id: pId,
            name: title,
            type: TARGET.type,
            category: TARGET.category,
            price,
            main_image: finalMainImg,
            image_list: finalImageList,
            is_promotion: false,
            updated_at: new Date().toISOString(),
          };

          console.log(`      ☁️ ส่งข้อมูลเข้า Supabase: "${title}"`);

          const { error: upsertError } = await supabase
            .from(TABLE_NAME)
            .upsert(payload, { onConflict: 'id' });

          if (upsertError) {
            console.error(`      ❌ [Error] ID: ${pId} | ${upsertError.message}`);
          } else {
            console.log(`      ✅ สำเร็จ: "${title}" | ราคา: ${price}`);
            collectedItems++;
          }

          await new Promise(resolve => setTimeout(resolve, PAGE_DELAY_MS));
        } catch (err) {
          console.log(`      ❌ ปัญหาขณะดึงสินค้า: ${err.message}`);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n   ✅ จบหมวด: เก็บได้ ${collectedItems} รายการ`);
  } finally {
    await browser.close();
  }

  console.log('\n🏁 จบการทำงาน scraper ไต้หวัน!');
}

runScraperTaiwan();