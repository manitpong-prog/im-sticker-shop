const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mtmpzbsatolmuttzdxet.supabase.co',
  'sb_secret_3rRZ1zjY2mqKCw70VG-wDw_-vfEUS-f'
);

// === CONFIG ===
const START_PAGE = 1;
const END_PAGE = 1;
const PAGE_DELAY_MS = 2000;

const TABLE_NAME = 'test_taiwan';
const MAIN_TABLE_NAME = 'test_stickers';

const TARGET = {
  name: 'สติกเกอร์ทางการไต้หวัน',
  url: 'https://store.line.me/stickershop/showcase/top/en',
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
    let updatedItems = 0;
    let skippedMainItems = 0;
    let skippedPriceItems = 0;

    for (let p = START_PAGE; p >= END_PAGE; p--) {
      const pageUrl = `${TARGET.url}?page=${p}`;

      console.log(`\n🌐 กำลังสแกนหน้ารวม: หน้า [${p}] - ${pageUrl}`);

      try {
        await page.goto(pageUrl, {
          waitUntil: 'networkidle',
          timeout: 90000,
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

          // 1) ถ้ามีสินค้า ID นี้อยู่ในตารางหลัก test_stickers แล้ว ให้ข้ามทันที
          const { data: existsInMain, error: mainCheckError } = await supabase
            .from(MAIN_TABLE_NAME)
            .select('id')
            .eq('id', pId)
            .maybeSingle();

          if (mainCheckError) {
            console.log(
              `      ⚠️ เช็ก ${MAIN_TABLE_NAME} ไม่สำเร็จ: ${mainCheckError.message}`
            );
          }

          if (existsInMain) {
            console.log(
              `      ⏭️ ข้าม ${pId} เพราะมีอยู่ใน ${MAIN_TABLE_NAME} แล้ว`
            );
            skippedMainItems++;
            continue;
          }

          // 2) ถ้ามีอยู่ใน test_taiwan แล้ว ไม่ข้าม ให้ดึงใหม่เพื่ออัปเดตข้อมูล
          const { data: existsInTaiwan, error: taiwanCheckError } =
            await supabase
              .from(TABLE_NAME)
              .select('id')
              .eq('id', pId)
              .maybeSingle();

          if (taiwanCheckError) {
            console.log(
              `      ⚠️ เช็ก ${TABLE_NAME} ไม่สำเร็จ: ${taiwanCheckError.message}`
            );
          }

          if (existsInTaiwan) {
            console.log(
              `      🔄 พบ ${pId} ใน ${TABLE_NAME} แล้ว จะดึงข้อมูลใหม่เพื่ออัปเดต`
            );
          } else {
            console.log(`      🆕 ยังไม่มี ${pId} ใน ${TABLE_NAME} จะเพิ่มใหม่`);
          }

          try {
            await page.goto(link, {
              waitUntil: 'networkidle',
              timeout: 90000,
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

          const normalizedPriceText = priceText.replace(/\s+/g, '').trim();

          const isTargetPrice = /(?:^|[^0-9])NT\$30(?:[^0-9]|$)/.test(
            normalizedPriceText
          );

          if (!isTargetPrice) {
            console.log(
              `      ⏭️ ข้าม ${pId} เพราะราคาไม่ใช่ NT$30 | ราคาเจอ: ${priceText}`
            );
            skippedPriceItems++;
            continue;
          }

          // ระบบร้านแปลง NT$30 เป็นราคาไทย 31 บาท ตามโค้ดเดิม
          const price = 31;

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

          if (existsInTaiwan) {
            console.log(`      🔄 อัปเดตข้อมูลใน ${TABLE_NAME}: "${title}"`);
          } else {
            console.log(`      ☁️ เพิ่มข้อมูลใหม่เข้า ${TABLE_NAME}: "${title}"`);
          }

          const { error: upsertError } = await supabase
            .from(TABLE_NAME)
            .upsert(payload, { onConflict: 'id' });

          if (upsertError) {
            console.error(
              `      ❌ [Error] ID: ${pId} | ${upsertError.message}`
            );
          } else {
            if (existsInTaiwan) {
              console.log(`      ✅ อัปเดตสำเร็จ: "${title}" | ราคา: ${price}`);
              updatedItems++;
            } else {
              console.log(`      ✅ เพิ่มใหม่สำเร็จ: "${title}" | ราคา: ${price}`);
              collectedItems++;
            }
          }

          await new Promise(resolve => setTimeout(resolve, PAGE_DELAY_MS));
        } catch (err) {
          console.log(`      ❌ ปัญหาขณะดึงสินค้า: ${err.message}`);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n==================== สรุปผล ====================`);
    console.log(`   ✅ เพิ่มใหม่ใน ${TABLE_NAME}: ${collectedItems} รายการ`);
    console.log(`   🔄 อัปเดตใน ${TABLE_NAME}: ${updatedItems} รายการ`);
    console.log(`   ⏭️ ข้ามเพราะมีใน ${MAIN_TABLE_NAME}: ${skippedMainItems} รายการ`);
    console.log(`   ⏭️ ข้ามเพราะราคาไม่ใช่ NT$30: ${skippedPriceItems} รายการ`);
  } finally {
    await browser.close();
  }

  console.log('\n🏁 จบการทำงาน scraper ไต้หวัน!');
}

runScraperTaiwan();