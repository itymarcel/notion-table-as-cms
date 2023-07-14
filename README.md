# Use a Notion Table Database as a super simple CMS
Simple node.js server to fetch a Notion table via NotionAPI, including each page's attributes and its content. It translates the content into HTML and adds it to the objects, then returns the entire thing as a JSON to the client.

## On the client, to retrieve all articles with content
```javascript
const server: string = 'your-server-address';

fetch(server + '/all-articles')
  .then((response) => response.json())
  .then((response) => {
      console.log('response ', response);
  })
```


## On the client, to retrieve a specific article
```javascript
fetch(server + '/article?id=' + page_id)
  .then((response) => response.json())
  .then((response) => {
      console.log('response ', response);
  })
```