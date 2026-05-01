const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://mtmpzbsatolmuttzdxet.supabase.co', 'sb_secret_3rRZ1zjY2mqKCw70VG-wDw_-vfEUS-f');

// === CONFIG ===
const TABLE_NAME = 'test_indo';
const CATEGORY = 'top_50c_indo';
const BASE_URL = 'https://store.line.me/stickershop/showcase/new_creators/en?category=2000';

const START_PAGE = 10;
const END_PAGE = 1;

const TARGET_PRICE = 12000;
const PAGE_DELAY_MS = 2000;
const PRODUCT_DELAY_MS = 2000;
// ==============

async function runScraperIndo50cAnimated() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  page.setDefaultTimeout(90000);

  console.log(
    '\n==================== 🇮🇩 เริ่มเก็บ สติกเกอร์ดุ๊กดิ๊ก 50c อินโด ===================='
  );

  try {
    for (let pageNum = START_PAGE; pageNum >= END_PAGE; pageNum--) {
      const pageUrl = `${BASE_URL}&page=${pageNum}`;

      console.log(`\n🌐 กำลังสแกนหน้ารวม: [${pageNum}] - ${pageUrl}`);

      try {
        await page.goto(pageUrl, {
          waitUntil: 'networkidle',
          timeout: 90000,
        });

        await new Promise(resolve => setTimeout(resolve, 4000));

        const productLinks = await page
          .$$eval('a[href*="/product/"]', anchors => {
            return [...new Set(anchors.map(a => a.href))].filter(
              href => href && !href.includes('/showcase/')
            );
          })
          .catch(() => []);

        console.log(
          `   📦 พบทั้งหมด ${productLinks.length} รายการในหน้า ${pageNum}`
        );

        if (!productLinks || productLinks.length === 0) {
          console.log('   ⚠️ ไม่พบรายการสินค้าในหน้านี้ ข้ามไปหน้าถัดไป...');
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
              `\n   [page ${pageNum}][${i + 1}/${productLinks.length}] ➡️ ตรวจสินค้า ID: ${pId}`
            );

            await page.goto(link, {
              waitUntil: 'networkidle',
              timeout: 90000,
            });

            await page
              .waitForSelector(
                '.mdCMN38Item01Price, .mdCMN38Price, .mdCMN08Price',
                { timeout: 30000 }
              )
              .catch(() => null);

            await new Promise(resolve => setTimeout(resolve, 2000));

            const priceText = await page
              .innerText('.mdCMN38Item01Price, .mdCMN38Price, .mdCMN08Price')
              .catch(() => '0');

            const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;

            if (price !== TARGET_PRICE) {
              console.log(
                `      ⏩ ข้าม ID: ${pId} เพราะราคาไม่ใช่ ${TARGET_PRICE} | ราคาที่เจอ: ${priceText}`
              );
              continue;
            }

            const previewAttr = await page
              .getAttribute('.mdCMN38Img', 'data-preview')
              .catch(() => null);

            if (!previewAttr) {
              console.log(`      ⏩ ข้าม ID: ${pId} เพราะไม่มี data-preview`);
              continue;
            }

            let info;

            try {
              info = JSON.parse(previewAttr);
            } catch (err) {
              console.log(
                `      ⏩ ข้าม ID: ${pId} เพราะอ่าน data-preview ไม่ได้ | ${err.message}`
              );
              continue;
            }

            const isAnimated =
              info.type === 'animation' || info.type === 'animation_sound';

            if (!isAnimated) {
              console.log(`      ⏩ ข้าม ID: ${pId} เพราะไม่ใช่สติกเกอร์ดุ๊กดิ๊ก`);
              continue;
            }

            const title = await page
              .innerText('.mdCMN38Item01Ttl, .mdCMN38Ttl, .mdCMN08Ttl')
              .catch(() => 'Unknown');

            const finalMainImg = `https://stickershop.line-scdn.net/stickershop/v1/product/${pId}/iPhone/main_animation@2x.png`;

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

            const finalImageList = stickerIds.map(stickerId => {
              return `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stickerId}/iPhone/sticker_animation@2x.png`;
            });

            if (!finalMainImg || finalImageList.length === 0) {
              console.log(`      ⏩ ข้าม ID: ${pId} เพราะดึงรูปไม่ครบ`);
              continue;
            }

            const payload = {
              id: pId,
              name: title,
              type: 'sticker',
              category: CATEGORY,
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
              console.log(
                `      ✅ บันทึกสำเร็จ: "${title}" | รูปย่อย ${finalImageList.length} รูป`
              );
            }

            await new Promise(resolve => setTimeout(resolve, PRODUCT_DELAY_MS));
          } catch (err) {
            console.log(`      ❌ ปัญหาที่สินค้า: ${link} | ${err.message}`);
          }
        }

        await new Promise(resolve => setTimeout(resolve, PAGE_DELAY_MS));
      } catch (err) {
        console.log(`      ⚠️ โหลดหน้ารวมไม่ได้: ${pageUrl} | ${err.message}`);
      }
    }
  } finally {
    await browser.close();
  }

  console.log('\n🏁 เก็บสติกเกอร์ดุ๊กดิ๊ก 50c อินโดเสร็จสิ้น!');
}

runScraperIndo50cAnimated();