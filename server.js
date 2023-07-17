import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Client } from "@notionhq/client";

const server = express();
const port = 3001;

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

server.use(cors({
    origin: '*'
}));

server.get('/all-articles', async (req, res) => {
    try {
        const response = await queryDatabase(databaseId);
        const pagePromises = response.results.map(async (page) => {
            const pageContent = await retrieveBlocksForPage(page.id);
            return {
                ...page,
                pageContent: jsonToHtml(pageContent)
            };
        });

        const pagesWithContent = await Promise.all(pagePromises);
        res.json(pagesWithContent);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

server.get('/article', async (req, res) => {
    const id = req.query.id;
    try {
        const page = await retrievePage(id);
        const pageBlocks = await retrieveBlocksForPage(id);
        const pageWithContent =  {
            ...page,
            pageContent: jsonToHtml(pageBlocks)
        }
        res.json(pageWithContent);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

async function queryDatabase(databaseId) {
    try {
        const response = await notion.databases.query({
            database_id: databaseId
        });
        return response;
    } catch (error){
        console.log(error.body);
    }
}

async function retrievePage(pageId) {
    try {
        const response = await notion.pages.retrieve({ page_id: pageId });
        return response;
    } catch (error){
        console.log(error.body);
    }
}

async function retrieveBlocksForPage(pageId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: pageId,
            page_size: 100,
          });
        return response;
    } catch (error){
        console.log(error.body);
    }
}

const jsonToHtml = (json) => {
    let html = '';
    console.log(json);
    json.results.forEach(block => {
        console.log(block);
        switch (block.type) {
            case 'heading_1':
                html += `<h1>${block.heading_1.rich_text[0].plain_text}</h1>`;
                break;
            case 'heading_2':
                html += `<h2>${block.heading_2.rich_text[0].plain_text}</h2>`;
                break;
            case 'heading_3':
                html += `<h3>${block.heading_3.rich_text[0].plain_text}</h3>`;
                break;
            case 'paragraph':
                let paragraph = '';
                block.paragraph.rich_text.forEach(text => {
                    if (text.href) {
                        paragraph += `<a href="${text.href}">${text.plain_text}</a>`;
                    } else {
                        paragraph += text.plain_text;
                    }
                });
                html += `<p>${paragraph}</p>`;
                break;
            case 'quote':
                html += `<blockquote>${block.quote.rich_text[0].plain_text}</blockquote>`;
                break;
            case 'image':
                html += `<img src="${block.image.file.url}" alt="${block.image.caption[0]?.plain_text || ''}"/>`;
                break;
            default:
                console.log(`Unsupported block type: ${block.type}`);
        }
    });
    return html;
}
