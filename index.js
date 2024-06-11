const puppeteer = require('puppeteer');
const express = require('express');
require("dotenv").config();

const app = express();

app.get('/screenshot/:branch', async (req, res) => {
    const branch = req.params.branch;
    const browser = await puppeteer.launch({
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote"
        ],
        executablePath: process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    });
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
});

app.listen(4000);