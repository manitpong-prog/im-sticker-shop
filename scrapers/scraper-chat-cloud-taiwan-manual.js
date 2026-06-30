const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');


const supabase = createClient('https://mtmpzbsatolmuttzdxet.supabase.co', 'sb_secret_3rRZ1zjY2mqKCw70VG-wDw_-vfEUS-f');

// === CONFIG ===
const TABLE_NAME = 'test_taiwan';
const PAGE_DELAY_MS = 10000;

const TARGET = {
  name: 'สติกเกอร์ทางการไต้หวันแบบใส่ลิงก์เอง',
  type: 'sticker',
  category: 'taiwan',
};

// ใส่ลิงก์สติกเกอร์ที่ต้องการดึงเองตรงนี้
const manualLinks = [
  'https://line.me/S/sticker/37159/',
  'https://line.me/S/sticker/36755/',
];
// ==============

function convertToTaiwanStoreUrl(rawLink) {
  let link = rawLink.trim();

  if (!link) return '';

  if (link.includes('line.me/S/sticker/')) {
    const productId = link.split('/sticker/')[1]?.split('/')[0];

    if (productId) {
      return `https://store.line.me/stickershop/product/${productId}/en`;
    }
  }

  if (link.includes('store.line.me/stickershop/product/')) {
    link = link.replace(/\/(th|en|id|ja|zh-Hant|zh-Hans)\/?$/, '');

    if (!link.endsWith('/en')) {
      link = link.replace(/\/$/, '') + '/en';
    }

    return link;
  }

  return link;
}

function getProductIdFromUrl(url) {
  const idParts = url.split('/product/');

  if (!idParts[1]) {
    return null;
  }

  return idParts[1].split('/')[0];
}

function getPriceFromText(priceText) {
  if (!priceText) return 0;

  if (priceText.includes('US$1.99') || priceText.includes('US$1.99')) {
    return 65;
  }

  if (priceText.includes('US$0.99') || priceText.includes('$0.99')) {
    return 31;
  }

  return parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;
}

async function runManualTaiwanScraper() {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  page.setDefaultTimeout(90000);

  console.log(
    `\n==================== 🇹🇼 เริ่มเก็บ: ${TARGET.name} ====================`
  );

  let collectedItems = 0;

  try {
    for (let i = 0; i < manualLinks.length; i++) {
      const originalLink = manualLinks[i];
      const link = convertToTaiwanStoreUrl(originalLink);

      if (!link) {
        console.log(`\n[${i + 1}/${manualLinks.length}] ⚠️ ลิงก์ว่าง ข้าม`);
        continue;
      }

      console.log(`\n[${i + 1}/${manualLinks.length}] ➡️ กำลังดึงข้อมูล: ${link}`);

      try {
        let pId = getProductIdFromUrl(link);

        if (!pId) {
          console.log(`      ⚠️ ไม่สามารถระบุ Product ID จากลิงก์นี้ได้: ${link}`);
          continue;
        }

        console.log(`      🧩 Product ID: ${pId}`);

        await page.goto(link, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });

        await page.waitForLoadState('networkidle').catch(() => {});

        const currentUrl = page.url();
        const currentProductId = getProductIdFromUrl(currentUrl);

        if (currentProductId) {
          pId = currentProductId;
        }

        await page
          .waitForSelector('.mdCMN38Item01Ttl, .mdCMN38Ttl, .mdCMN08Ttl', {
            timeout: 5000,
          })
          .catch(() => null);

        const title = await page
          .innerText('.mdCMN38Item01Ttl, .mdCMN38Ttl, .mdCMN08Ttl')
          .catch(() => 'Unknown');

        const priceText = await page
          .innerText('.mdCMN38Item01Price, .mdCMN38Price, .mdCMN08Price')
          .catch(() => '0');

        const price = getPriceFromText(priceText);

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
              info.type === 'animation' || info.type === 'animation_sound';

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

        console.log(`      💰 ราคา LINE Store: ${priceText} → บันทึกเป็น ${price}`);
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
        console.log(`      ❌ ปัญหาขณะดึงสินค้า: ${link} | ${err.message}`);
      }
    }

    console.log(`\n✅ จบงาน: เก็บได้ ${collectedItems} รายการ`);
  } finally {
    await browser.close();
  }

  console.log('\n🏁 จบการทำงาน manual scraper ไต้หวัน!');
}

runManualTaiwanScraper();