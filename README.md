# Use a Notion Table Database as a super simple CMS
Simple node.js repo to fetch a Notion table via NotionAPI, including each page's attributes and its content. It translates the content into HTML and adds it to the objects, then returns the entire thing as a JSON to the client.

## On the client side, you only have to do this.
```javascript
const server: string = 'your-server-address';

fetch(server)
  .then((response) => response.json())
  .then((response) => {
      console.log('response ', response);
  })
```