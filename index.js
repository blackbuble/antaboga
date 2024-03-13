const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { fetch } = require('aws4fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
//API Endpoint for convert page to JPG
app.post('/html2jpg', async(req, res) => {
    const { url,savePath, filename } = req.body;

    if(!url || !filename){
        return res.status(400).json({ error: 'All parameter is required '});
    }

    try{
        const browser = await puppeteer.launch({ 
		   headless: true,
		   args: ['--no-sandbox'] 
		});
        const page = await browser.newPage();

        // Set custom viewport size to cover the entire page
        await page.setViewport({ width: 1920, height: 1080 });
        // Set viewport to emulate a mobile device
        //await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

        await page.goto(url, { waitUntil: 'networkidle0' });
        
		const savePath = './'; // Save to root directory
        const imagePath = path.join(savePath, filename);
        await page.screenshot({ path: imagePath, type: 'jpeg', fullPage: true });

        await browser.close();
		
		// Upload image to DigitalOcean Space
        const spaceEndpoint = 'https://sgp1.digitaloceanspaces.com'; // Replace with your Space endpoint
        const spaceKey = 'FEZNNG7PSK4BDKSB47GT'; // Replace with your Space key
        const spaceSecret = 'Nhh3QLtinkOyTDHc4oExCabg0JY8fAMpNwWMEMbJ4eM'; // Replace with your Space secret
        const spaceName = 'viding'; // Replace with your Space name
        const spacePath = `invitation/${filename}`; // Replace with the desired path within the Space

        const fileContent = fs.readFileSync(imagePath);
        const signedRequest = await fetch(`${spaceEndpoint}/${spacePath}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'image/jpeg',
                'Authorization': `AWS ${spaceKey}:${spaceSecret}`,
            },
            body: fileContent,
        });

        // Optionally, you can remove the local image after uploading
        fs.unlinkSync(imagePath);

        if (signedRequest.status !== 200) {
            return res.status(signedRequest.status).json({ error: 'Failed to upload image to DigitalOcean Space' });
        }

        const spaceUrl = `https://${spaceName}.${spaceEndpoint}/${spacePath}`;

        return res.json({ success: true, filename: filename, spaceUrl: spaceUrl });

        //return res.json({success: true, filename: filename});

    } catch(error) {
        console.error('Error:', error);
        return res.status(500).json({error:'Internal Server Error'});
    }
});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
