import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('http://127.0.0.1:8080');
  await page.waitForSelector('.home-screen, main');
  
  // click the first game (open-game)
  console.log("clicking open-game...");
  await page.click('[data-action="open-game"]');
  await new Promise(r => setTimeout(r, 500));
  
  // click start-game
  console.log("clicking start-game...");
  await page.click('[data-action="start-game"]');
  await new Promise(r => setTimeout(r, 500));

  console.log("clicking game-back...");
  await page.click('[data-action="game-back"]');
  await new Promise(r => setTimeout(r, 500));
  
  await browser.close();
  console.log("Success!");
})();
