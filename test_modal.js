const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://127.0.0.1:8888/frontend/lessons.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Click first lesson card
    const cards = await page.locator('.lp-card[data-lesson-key]').first().boundingBox();
    if (cards) {
      await page.locator('.lp-card[data-lesson-key]').first().click();
      await page.waitForTimeout(500);
    }
    
    // Take screenshot with panel visible
    await page.screenshot({ path: 'modal_open.png' });
    console.log('Screenshot 1: modal_open.png');
    
    // Click toggle button to collapse aside
    const toggleBtn = await page.locator('.lp-modal-aside-toggle').first();
    if (toggleBtn) {
      await toggleBtn.click();
      await page.waitForTimeout(500);
      
      // Take screenshot with panel collapsed
      await page.screenshot({ path: 'modal_collapsed.png' });
      console.log('Screenshot 2: modal_collapsed.png');
    }
    
  } finally {
    await browser.close();
  }
})();
