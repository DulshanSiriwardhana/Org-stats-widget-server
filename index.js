const puppeteer = require('puppeteer');
const express = require('express');

const app = express();

app.get('/screenshot/:branch', async (req, res) => {
    const branch = req.params.branch;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://organization-repo-branch-stats-by-mantis.vercel.app/${branch}`,
        {waitUntil: 'networkidle0'});
    const screenshotBuffer = await page.screenshot();

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': screenshotBuffer.length
    });
    res.end(screenshotBuffer);

    await browser.close();
})

app.listen(4000);