const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
//API Endpoint for convert page to JPG
app.post('/html2jpg', async(req, res) => {
    const { url,savePath, filename } = req.body;

    if(!url || !savePath || !filename){
        return res.status(400).json({ error: 'All parameter is required '});
    }

    try{
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set custom viewport size to cover the entire page
        await page.setViewport({ width: 1920, height: 1080 });
        // Set viewport to emulate a mobile device
        //await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

        await page.goto(url, { waitUntil: 'networkidle0' });

        //Generate unique filename
        //const filename = `${Date.now()}.jpg`;

        //Create directory if doesn't exist
        if(!fs.existsSync(savePath)){
            fs.mkdirSync(savePath, {recursive: true});
        }

        //Capture screenshot and save as jpg
        await page.screenshot({path: path.join(savePath, filename), type: 'jpeg', fullPage: true});
        
        await browser.close();

        return res.json({success: true, filename: filename});

    } catch(error) {
        console.error('Error:', error);
        return res.status(500).json({error:'Internal Server Error'});
    }
});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
