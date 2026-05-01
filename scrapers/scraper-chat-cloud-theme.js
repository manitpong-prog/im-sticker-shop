const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://mtmpzbsatolmuttzdxet.supabase.co', 'sb_secret_3rRZ1zjY2mqKCw70VG-wDw_-vfEUS-f');

// === CONFIG ===
const START_PAGE = 5;
const END_PAGE = 1;
const PAGE_DELAY_MS = 1000;
// ==============

async function runScraper() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const targets = [
    {
      name: 'ธีมทางการมาใหม่',
      url: 'https://store.line.me/themeshop/showcase/new/th',
      type: 'theme',
      category: 'official_theme',
      is_new_sticker_official: false,
      is_new_emoji_official: false,
      is_new_theme_official: true
    },
    {
      name: 'ธีมครีเอเตอร์สุดฮิต',
      url: 'https://store.line.me/themeshop/showcase/top_creators/th',
      type: 'theme',
      category: 'creator_theme',
      is_new_sticker_official: false,
      is_new_emoji_official: false,
      is_new_theme_official: false
    }
  ];

  for (const target of targets) {
    console.log(`\n==================== 🚀 เริ่มหมวด: ${target.name} ====================`);
    let collectedItems = 0;

    for (let p = START_PAGE; p >= END_PAGE; p--) {
      const pageUrl = `${target.url}?page=${p}`;
      console.log(`\n🌐 กำลังสแกนหน้ารวม: หน้า [${p}] - ${pageUrl}`);

      try {
        await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });
      } catch (err) {
        console.log(`   ⚠️ ไปยัง ${pageUrl} ไม่ได้: ${err.message}`);
        continue;
      }

      // ========== เริ่มส่วนที่แก้ไข: ดึงสินค้าพร้อมพิกัดและเรียงลำดับ ==========
      const itemsWithPos = await page.$$eval('a[href*="/product/"]', anchors => {
        const map = new Map();

        for (const a of anchors) {
          const href = a.href;

          if (!href || href.includes('/showcase/')) continue;
          if (map.has(href)) continue;

          const rect = a.getBoundingClientRect();

          map.set(href, {
            top: rect.top,
            right: rect.right
          });
        }

        return Array.from(map.entries()).map(([href, { top, right }]) => ({
          href,
          top,
          right
        }));
      }).catch(() => []);

      // เรียงลำดับ: ล่างขึ้นบน (top มากไปน้อย) และในแถวเดียวกัน ขวาไปซ้าย (right มากไปน้อย)
      itemsWithPos.sort((a, b) => {
        if (a.top === b.top) return b.right - a.right;
        return b.top - a.top;
      });

      const productLinks = itemsWithPos.map(item => item.href);

      console.log(`   📦 พบ ${productLinks.length} รายการในหน้า ${p} (เรียงจากล่างขวา → บนซ้าย)`);
      // ========== จบส่วนที่แก้ไข ==========

      if (!productLinks || productLinks.length === 0) {
        continue;
      }

      for (let i = 0; i < productLinks.length; i++) {
        const link = productLinks[i];

        try {
          const idParts = link.split('/product/');

          if (!idParts[1]) continue;

          const pId = idParts[1].split('/')[0];

          console.log(`\n   [page ${p}][${i + 1}/${productLinks.length}] ➡️ เจาะข้อมูล: ${pId}`);

          try {
            await page.goto(link, { waitUntil: 'networkidle', timeout: 30000 });
          } catch (err) {
            console.log(`      ⚠️ โหลดหน้าสินค้าไม่สำเร็จ: ${err.message}`);
            continue;
          }

          await page.waitForLoadState('networkidle').catch(() => {});

          await page
            .waitForSelector('.mdCMN38Item01Ttl, .mdCMN38Ttl, .mdCMN08Ttl', { timeout: 5000 })
            .catch(() => null);

          const title = await page
            .innerText('.mdCMN38Item01Ttl, .mdCMN38Ttl, .mdCMN08Ttl')
            .catch(() => 'Unknown');

          const priceText = await page
            .innerText('.mdCMN38Item01Price, .mdCMN38Price, .mdCMN08Price')
            .catch(() => '0');

          const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;

          // ดึง description ไว้เหมือน logic เดิม แต่ไม่ได้ส่งเข้า Supabase
          // เพราะตาราง stickers ล่าสุดยังไม่มีคอลัมน์ description
          const desc = await page
            .innerText('.mdCMN38Item01Txt, .mdCMN38Txt, .mdCMN08Txt')
            .catch(() => '');

          // --- 🛠️ จุดเริ่มต้นอัปเดต: แยก Logic รูปภาพด้วย data-preview ---
          let finalMainImg;
          let finalImageList = [];
          let isAnimated = false;

          const previewAttr = await page
            .getAttribute('.mdCMN38Img', 'data-preview')
            .catch(() => null);

          if (previewAttr && target.type !== 'theme') {
            const info = JSON.parse(previewAttr);

            isAnimated = info.type === 'animation' || info.type === 'animation_sound';

            if (isAnimated) {
              finalMainImg = `https://stickershop.line-scdn.net/stickershop/v1/product/${pId}/iPhone/main_animation@2x.png`;

              const stickerIds = await page.$$eval('.FnStickerList li', lis => {
                return lis
                  .map(li => {
                    const d = JSON.parse(li.getAttribute('data-preview') || '{}');
                    return d.id;
                  })
                  .filter(id => id);
              });

              finalImageList = stickerIds.map(id => {
                return `https://stickershop.line-scdn.net/stickershop/v1/sticker/${id}/iPhone/sticker_animation@2x.png`;
              });
            } else {
              finalMainImg = await page
                .$eval('.mdCMN38Img .mdCMN38Image', el => {
                  const style = el.getAttribute('style') || '';
                  const match = style.match(/url\(["']?(.*?)["']?\)/);
                  return match ? match[1] : null;
                })
                .catch(() => info.staticUrl);

              const stickerUrls = await page.$$eval(
                '.FnStickerList li .mdCMN09Image, .FnEmojiList li .mdCMN09Image',
                imgs => {
                  return imgs
                    .map(img => {
                      const style = img.getAttribute('style') || '';
                      const match = style.match(/url\(["']?(.*?)["']?\)/);
                      return match ? match[1] : null;
                    })
                    .filter(url => url);
                }
              );

              finalImageList = [...new Set(stickerUrls)];
            }
          }

          if (!finalMainImg || finalImageList.length === 0) {
            finalMainImg = await page
              .getAttribute('.mdCMN38Img img, .mdCMN08Img img', 'src')
              .catch(() => null);

            if (target.type === 'theme') {
              finalImageList = await page.$$eval('.mdCMN09ImgList .mdCMN09Image', spans => {
                const urls = new Set();

                spans.forEach(span => {
                  const style = span.getAttribute('style') || '';
                  const m = style.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/);

                  if (m && m[1]) {
                    urls.add(m[1].split('?')[0]);
                  }
                });

                return Array.from(urls);
              }).catch(() => []);
            } else {
              finalImageList = await page.$$eval('.FnStickerList img, .FnEmojiList img', imgs => {
                const urls = new Set();

                imgs.forEach(img => {
                  const src = img.getAttribute('src') || img.getAttribute('data-src') || '';

                  if (src && (src.includes('stickershop') || src.includes('line-scdn'))) {
                    urls.add(src.split('?')[0]);
                  }
                });

                return Array.from(urls);
              }).catch(() => []);
            }
          }
          // --- 🛠️ สิ้นสุดการอัปเดต Logic รูปภาพ ---

          console.log(`      📸 ดึงรูปได้: ${finalImageList.length} รูป (${isAnimated ? 'เคลื่อนไหว' : 'ปกติ'})`);
          console.log(`      ☁️ ส่งข้อมูล "${title}" เข้า Supabase...`);

          const payload = {
            id: pId,
            name: title,
            type: target.type,
            category: target.category,
            price: price,
            main_image: finalMainImg,
            image_list: finalImageList,
            is_new_sticker_official: target.is_new_sticker_official,
            is_new_emoji_official: target.is_new_emoji_official,
            is_new_theme_official: target.is_new_theme_official,
            updated_at: new Date().toISOString()
          };

          const { error: upsertError } = await supabase
            .from('test_stickers')
            .upsert(payload, { onConflict: 'id' });

          if (upsertError) {
            console.error(`      ❌ [Error] ID: ${pId} | ${upsertError.message}`);
          } else {
            console.log(`      ✅ สำเร็จ: "${title}" | ราคา: ${price}`);
            collectedItems++;
          }

          await new Promise(r => setTimeout(r, PAGE_DELAY_MS));
        } catch (err) {
          console.log(`      ❌ ปัญหาขณะดึงสินค้า: ${err.message}`);
        }
      }

      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n   ✅ จบหมวด: เก็บได้ ${collectedItems} รายการ`);
  }

  await browser.close();
  console.log('\n🏁 จบการทำงาน!');
}

runScraper();