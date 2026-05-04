const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    console.log('Navigating to login...');
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle2' });
    
    // Wait for a second to let any client-side crashes happen
    await new Promise(r => setTimeout(r, 2000));
    
    await browser.close();
    console.log('Done.');
})();
