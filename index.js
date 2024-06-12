const { args, defaultViewport, executablePath, headless } = require('chrome-aws-lambda');
const express = require('express');
const app = express();
require("dotenv").config();

let chrome ={};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    chrome = require("chrome-aws-lambda");
    puppeteer = require("puppeteer-core");
} else {
    puppeteer = require("puppeteer");
}

app.get('/screenshot/:branch', async (req, res) => {
    let options = {};
    const branch = req.params.branch;

    if(process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        options = {
            args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath,
            headless: true,
            ignoreHTTPSErrors: true
        }
    }

    try {
        let browser = await puppeteer.launch(options);

        let page = await browser.newPage();
        await page.goto(`https://organization-repo-branch-stats-by-mantis.vercel.app/${branch}`,
            {waitUntil: 'networkidle0'}
        );
        const screenshotBuffer = await page.screenshot();

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': screenshotBuffer.length
        });
        res.end(screenshotBuffer);
        await browser.close();
    } catch (error) {
        console.error(error);
        return null;
    }
});


/*
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
*/

app.listen(process.env.PORT || 5000);

module.exports = app;
