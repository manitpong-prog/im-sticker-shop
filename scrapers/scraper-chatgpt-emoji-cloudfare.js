const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://mtmpzbsatolmuttzdxet.supabase.co', 'sb_secret_3rRZ1zjY2mqKCw70VG-wDw_-vfEUS-f');

// === CONFIG ===
const START_PAGE = 1;
const END_PAGE = 1;
const PAGE_DELAY_MS = 1000;
const TABLE_NAME = 'test_stickers';
// ==============

async function runScraper() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const targets = [
    {
      name: 'อิโมจิทางการมาใหม่',
      url: 'https://store.line.me/emojishop/showcase/new/th',
      type: 'emoji',
      category: 'official_emoji',
      is_new_sticker_official: false,
      is_new_emoji_official: true,
      is_new_theme_official: false
    },
    {
      name: 'อิโมจิครีเอเตอร์สุดฮิต',
      url: 'https://store.line.me/emojishop/showcase/new_creators/th',
      type: 'emoji',
      category: 'creator_emoji',
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
              right: rect.right
            });
          }

          return Array.from(map.entries()).map(([href, { top, right }]) => ({
            href,
            top,
            right
          }));
        })
        .catch(() => []);

      itemsWithPos.sort((a, b) => {
        if (a.top === b.top) return b.right - a.right;
        return b.top - a.top;
      });

      const productLinks = itemsWithPos.map(item => item.href);

      console.log(`   📦 พบ ${productLinks.length} รายการในหน้า ${p} (เรียงจากล่างขวา → บนซ้าย)`);

      if (!productLinks || productLinks.length === 0) {
        continue;
      }

      for (let i = 0; i < productLinks.length; i++) {
        const link = productLinks[i];

        try {
          const idParts = link.split('/product/');

          if (!idParts[1]) continue;

          const pId = idParts[1].split('/')[0];

          console.log(`\n   [page ${p}][${i + 1}/${productLinks.length}] ➡️ เจาะข้อมูลอิโมจิ: ${pId}`);

          try {
            await page.goto(link, { waitUntil: 'networkidle', timeout: 30000 });
          } catch (err) {
            console.log(`      ⚠️ โหลดหน้าสินค้าไม่สำเร็จ: ${err.message}`);
            continue;
          }

          await page.waitForLoadState('networkidle').catch(() => {});
          await page.waitForSelector('.mdCMN38Img', { timeout: 5000 }).catch(() => null);

          const title = await page
            .innerText('.mdCMN38Item01Ttl, .mdCMN38Ttl, .mdCMN08Ttl')
            .catch(() => 'Unknown');

          const priceText = await page
            .innerText('.mdCMN38Item01Price, .mdCMN38Price, .mdCMN08Price')
            .catch(() => '0');

          const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;

          // ดึงไว้ใช้ debug เฉย ๆ แต่ไม่ส่งเข้า Supabase
          // เพราะตาราง test_stickers ไม่มีคอลัมน์ description
          const desc = await page
            .innerText('.mdCMN38Item01Txt, .mdCMN38Txt, .mdCMN08Txt')
            .catch(() => '');

          let finalMainImg;
          let finalImageList = [];
          let isAnimated = false;

          const previewAttr = await page
            .getAttribute('.mdCMN38Img', 'data-preview')
            .catch(() => null);

          if (previewAttr) {
            let info = null;

            try {
              info = JSON.parse(previewAttr);

              isAnimated =
                info.type === 'animation' ||
                info.type === 'animation_sound';
            } catch (err) {
              console.log(`      ⚠️ อ่าน data-preview ไม่ได้: ${err.message}`);
            }

            finalMainImg = `https://stickershop.line-scdn.net/sticonshop/v1/product/${pId}/iPhone/main.png`;

            const emojiIds = await page
              .$$eval('.FnStickerPreviewItem', items => {
                return items
                  .map(item => {
                    try {
                      const d = JSON.parse(item.getAttribute('data-preview') || '{}');
                      return d.id;
                    } catch {
                      return null;
                    }
                  })
                  .filter(id => id);
              })
              .catch(() => []);

            finalImageList = emojiIds.map(sId => {
              if (isAnimated) {
                return `https://stickershop.line-scdn.net/sticonshop/v1/sticon/${pId}/iPhone/${sId}_animation.png`;
              }

              return `https://stickershop.line-scdn.net/sticonshop/v1/sticon/${pId}/iPhone/${sId}.png`;
            });
          }

          if (!finalMainImg || finalImageList.length === 0) {
            finalMainImg = await page
              .getAttribute('.mdCMN38Img img', 'src')
              .catch(() => null);

            finalImageList = await page
              .$$eval('.FnStickerPreviewItem .mdCMN09Image', spans => {
                return spans
                  .map(span => {
                    const style = span.getAttribute('style') || '';
                    const m = style.match(/url\(['"]?([^'")]+)['"]?\)/);
                    return m ? m[1].split('?')[0] : null;
                  })
                  .filter(url => url);
              })
              .catch(() => []);
          }

          finalImageList = [...new Set(finalImageList.filter(Boolean))];

          if (finalImageList.some(url => url.includes('_animation.png'))) {
            isAnimated = true;
          }

          console.log(`      📸 ดึงรูปได้: ${finalImageList.length} รูป (${isAnimated ? 'ดุ๊กดิ๊ก' : 'ภาพนิ่ง'})`);
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
            .from(TABLE_NAME)
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