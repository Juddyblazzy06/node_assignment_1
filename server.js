const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 4050;
const hostname = "localhost";

const requestHandler = (req, res) => {
  //path to HTML files
  const htmlContent = path.join(__dirname, "index.html");
  //getting url and method from request
  const { url, method } = req;

  //rendering the HTML files to the client
  if (url.startsWith("/index.html")){
  let urlPath;
//   checking the url for /index.html
  if (url.includes("/index.html")) {
    urlPath = "index.html";
  } else {
    urlPath = `${url}.html`;
  }
  if (urlPath === "index.html") {
    fs.readFile(htmlContent, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        console.log(err);
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  }
  else if(urlPath !== "index" ){
    res.writeHead(404, {"Content-Type":"text/plain"});
    res.end("404 error page not found!");
        return
  }
}
  //Creating the CRUD functionality for the inventory on "/items"
else if (url.startsWith("./items")|| url.startsWith("/item")){

    //Getting all the items in the list
  if (url === "/items" && method === "GET"){
    const itemsPath = path.join(__dirname, "items.json")
    fs.readFile(itemsPath, "utf8", (err, file)=>{
        if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
            console.log(err);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(file);
    })
  }

  if (method === "GET") { 
    const id = Number(url.split("/")[2]); 
    const itemsPath = path.join(__dirname, "items.json"); 

    fs.readFile(itemsPath, "utf8", (err, file) => { 
        if (err) { 
            res.writeHead(500, { "Content-Type": "text/plain" }); 
            res.end("Internal Server Error"); 
            console.error(err); 
            return; 
        } 

        const data = JSON.parse(file); // Parse the JSON file
        const items = data.items;  // Access the "items" array inside the parsed object
        
        const item = items.find((item) => item.id === id); // Finding the item with matching id 

        if (!item) { 
            res.writeHead(404, { "Content-Type": "text/plain" }); 
            res.end("404 error page not found!"); 
            return; 
        } 

        res.writeHead(200, { "Content-Type": "application/json" }); 
        res.end(JSON.stringify(item)); 
    }); 

    return;
}}};






const server = http.createServer(requestHandler);
server.listen(port, hostname, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`server started successfully at http://${hostname}:${port}`);
});
