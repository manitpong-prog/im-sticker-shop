const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');


const supabase = createClient('https://mtmpzbsatolmuttzdxet.supabase.co', 'sb_secret_3rRZ1zjY2mqKCw70VG-wDw_-vfEUS-f');

// ==========================================
// CONFIG
// ==========================================
const TABLE_NAME = 'test_stickers';

// ถ้าเป็นลิงก์สติกเกอร์ครีเอเตอร์ทั่วไป ใช้ creator_sticker
// ถ้าจะใส่หมวดอื่น ค่อยเปลี่ยนตรงนี้ เช่น official_sticker, creator_theme
const DEFAULT_CATEGORY = 'creator_sticker';

const IS_PROMOTION = true;
const OFFICIAL_PROMO = false;

// ถ้ายังไม่ได้ตั้งราคาโปรเฉพาะ ให้เป็น null ได้
// หน้าเว็บจะ fallback ไปใช้ราคาขายปกติจาก price mapping
const PROMO_PRICE = null;
const PROMO_END_DATE = null;

const PAGE_DELAY_MS = 2000;

// 📝 ใส่ลิงก์สินค้าที่ต้องการดึงเองตรงนี้
const manualLinks = [
  'https://line.me/S/sticker/34672262',
  'https://line.me/S/sticker/33390375',
  'https://line.me/S/sticker/33458789',
  'https://line.me/S/sticker/33461447',
  'https://line.me/S/sticker/34646123',

  ];
// ==========================================

function convertToThaiStoreUrl(rawLink) {
  let link = rawLink.trim();

  if (link.includes('line.me/S/sticker/')) {
    const productId = link.split('/sticker/')[1]?.split('/')[0];
    if (productId) {
      return `https://store.line.me/stickershop/product/${productId}/th`;
    }
  }

  if (link.includes('line.me/S/shop/theme/detail')) {
    const url = new URL(link);
    const productId = url.searchParams.get('id');

    if (productId) {
      return `https://store.line.me/themeshop/product/${productId}/th`;
    }
  }

  if (link.includes('store.line.me')) {
    link = link.replace(/\/(en|id|ja|zh-Hant|zh-Hans|th)\/?$/, '');

    if (!link.endsWith('/th')) {
      link = link.replace(/\/$/, '') + '/th';
    }

    return link;
  }

  return link;
}

function getProductTypeFromUrl(url) {
  if (url.includes('/themeshop/')) return 'theme';
  if (url.includes('/emojishop/')) return 'emoji';
  return 'sticker';
}

function getCategoryFromType(type) {
  if (type === 'theme') return 'creator_theme';
  if (type === 'emoji') return 'creator_emoji';
  return DEFAULT_CATEGORY;
}

async function runManualPromotionScraper() {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  page.setDefaultTimeout(60000);

  console.log(
    '\n==================== 🎯 เริ่ม Manual Scraper โปรโมชั่น ===================='
  );

  try {
    for (let i = 0; i < manualLinks.length; i++) {
      const originalLink = manualLinks[i];
      const link = convertToThaiStoreUrl(originalLink);

      console.log(`\n[${i + 1}/${manualLinks.length}] ➡️ กำลังดำเนินการ: ${link}`);

      try {
        await page.goto(link, {
          waitUntil: 'networkidle',
          timeout: 60000,
        });

        const currentUrl = page.url();
        const idParts = currentUrl.split('/product/');

        if (!idParts[1]) {
          console.log(`   ⚠️ ไม่สามารถระบุ Product ID จาก URL นี้ได้: ${currentUrl}`);
          continue;
        }

        const pId = idParts[1].split('/')[0];
        const productType = getProductTypeFromUrl(currentUrl);
        const productCategory = getCategoryFromType(productType);
        const isTheme = productType === 'theme';

        await page
          .waitForSelector('.mdCMN38Item01Ttl, .mdCMN38Ttl, .mdCMN08Ttl', {
            timeout: 10000,
          })
          .catch(() => null);

        const title = await page
          .innerText('.mdCMN38Item01Ttl, .mdCMN38Ttl, .mdCMN08Ttl')
          .catch(() => 'Unknown');

        const priceText = await page
          .innerText('.mdCMN38Item01Price, .mdCMN38Price, .mdCMN08Price')
          .catch(() => '0');

        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;

        let finalMainImg;
        let finalImageList = [];
        let isAnimated = false;

        const previewAttr = await page
          .getAttribute('.mdCMN38Img', 'data-preview')
          .catch(() => null);

        if (previewAttr && !isTheme) {
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

          if (isTheme) {
            finalImageList = await page
              .$$eval('.mdCMN09ImgList .mdCMN09Image', spans => {
                const urls = new Set();

                spans.forEach(span => {
                  const style = span.getAttribute('style') || '';
                  const match = style.match(
                    /background-image:\s*url\(['"]?([^'")]+)['"]?\)/
                  );

                  if (match && match[1]) {
                    urls.add(match[1].split('?')[0]);
                  }
                });

                return Array.from(urls);
              })
              .catch(() => []);
          } else {
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
        }

        finalImageList = [...new Set(finalImageList.filter(Boolean))];

        if (!finalMainImg || finalImageList.length === 0) {
          console.log(`      ⏩ ข้าม ID: ${pId} เพราะดึงรูปไม่ครบ`);
          continue;
        }

        const payload = {
          id: pId,
          name: title,
          type: productType,
          category: productCategory,
          price,
          main_image: finalMainImg,
          image_list: finalImageList,
          is_new_sticker_official: false,
          is_new_emoji_official: false,
          is_new_theme_official: false,
          is_promotion: IS_PROMOTION,
          official_promo: OFFICIAL_PROMO,
          promo_price: PROMO_PRICE,
          promo_end_date: PROMO_END_DATE,
          updated_at: new Date().toISOString(),
        };

        console.log(
          `      📸 ดึงรูปได้: ${finalImageList.length} รูป (${isAnimated ? 'เคลื่อนไหว' : 'ปกติ'})`
        );
        console.log(`      ☁️ ส่งข้อมูลเข้า Supabase: "${title}"`);

        const { error: upsertError } = await supabase
          .from(TABLE_NAME)
          .upsert(payload, { onConflict: 'id' });

        if (upsertError) {
          console.error(`      ❌ [Error] ID: ${pId} | ${upsertError.message}`);
        } else {
          console.log(`      ✅ สำเร็จ: "${title}" | is_promotion = true`);
        }

        await new Promise(resolve => setTimeout(resolve, PAGE_DELAY_MS));
      } catch (err) {
        console.log(`      ❌ ปัญหาที่ลิงก์: ${link} | ${err.message}`);
      }
    }
  } finally {
    await browser.close();
  }

  console.log('\n🏁 Manual Scraper โปรโมชั่นเสร็จสิ้น!');
}

runManualPromotionScraper();