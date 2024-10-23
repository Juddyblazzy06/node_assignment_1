const http = require("http");
const fs = require("fs");
const path = require("path");
const { update } = require("lodash");

const port = 4050;
const hostname = "localhost";

const requestHandler = (req, res) => {
  //path to HTML files
  const htmlContent = path.join(__dirname, "index.html");
  //getting url and method from request
  const { url, method } = req;

  //rendering the HTML files to the client
  if (url.startsWith("/index.html")) {
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
    } else if (urlPath !== "index") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 error page not found!");
      return;
    }
  }
  //Creating the CRUD functionality for the inventory on "/items"
  else if (url.startsWith("./items") || url.startsWith("/item")) {
    //Getting all the items in the list
    if (url === "/items" && method === "GET") {
      const itemsPath = path.join(__dirname, "items.json");
      fs.readFile(itemsPath, "utf8", (err, file) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
          console.log(err);
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(file);
      });
    } else if (method === "GET") {
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
        const items = data.items; // Access the "items" array inside the parsed object

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
    } else if (method === "POST") {
      console.log("A post request was made"); // a log to be sure the data is being received
      let body = [];
      req.on("data", (chunk) => {
        body.push(chunk);
      });
      req.on("end", () => {
        const parsedBody = Buffer.concat(body).toString();
        const newItem = JSON.parse(parsedBody);
        console.log(newItem); // a log to be sure the data is being received

        const itemsPath = path.join(__dirname, "items.json");
        fs.readFile(itemsPath, "utf8", (err, file) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
            console.error(err); // a log to be sure the data is being received
          }
          const data = JSON.parse(file); // Parse the JSON file
          const items = data.items; // Access the "items" array inside the parsed object
          const newId = items.length + 1;
          newItem.id = newId;
          items.push(newItem);
          data.items = items;
          updatedData = JSON.stringify(data);
          fs.writeFile(itemsPath, updatedData, (err) => {
            if (err) {
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Internal Server Error");
              console.error(err); // a log to be sure the data is being received
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(updatedData);
          });
        });
      });
    } else if (method === "PUT") {
      console.log("A put request was made");
      const body = [];
      req.on("data", (chunk) => {
        body.push(chunk);
        console.log(body); // a log to be sure the data is being received
      });
      req.on("end", () => {
        const parsedBody = Buffer.concat(body).toString();
        const updatedItem = JSON.parse(parsedBody);
        console.log(updatedItem.id); // a log to be sure the data is being received

        const itemsPath = path.join(__dirname, "items.json");
        fs.readFile(itemsPath, "utf8", (err, file) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
            console.error(err); // a log to be sure the data is being received
          }
          const data = JSON.parse(file); // Parse the JSON file
          const items = data.items; // Access the "items" array inside the parsed object
          const itemIndex = items.findIndex(
            (item) => item.id === updatedItem.id
          );
          if (itemIndex === -1) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("You are trying to update an item that does not exist");
            return;
          }

          items[itemIndex] = { ...items[itemIndex], ...updatedItem };
          data.items = items;
          console.log(items[itemIndex]); // a log to be sure the data is being received
          updatedData = JSON.stringify(data);
          fs.writeFile(itemsPath, updatedData, (err) => {
            if (err) {
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Internal Server Error");
              console.error(err); // a log to be sure the data is being received
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(updatedData);
          });
        });
      });
    }

    else if (method === "DELETE"){
      console.log("A delete request was made");
      let id;
      let urlId;
      const body = [];
      req.on("data", (chunk) => {
        body.push(chunk);
        console.log(body); // a log to be sure the data is being received
      });
      req.on("end", () =>{
        const parsedBody = Buffer.concat(body).toString();
        if (parsedBody === undefined || parsedBody === "") { 
          urlId = Number(url.split("/")[2])
        } else {
        console.log(parsedBody); // a log to be sure the data is being received
        const newBody = JSON.parse(parsedBody);
        const bodyId = newBody.id;
        console.log(newBody.id)}; // a log to be sure the data is being received 
        if (urlId){
          id = urlId;
        } else {
          id = bodyId;
        }
        const itemsPath = path.join(__dirname, "items.json");
        fs.readFile(itemsPath, "utf8", (err, file)=>{
          if (err){
            res.writeHead(500, {"Content-Type": "text/plain"});
            res.end("Internal Server Error");
            console.error(err); // a log to be sure the data is being received
          }
          const data = JSON.parse(file); // Parse the JSON file
          const items = data.items; // Access the "items" array inside the parsed object
          const itemIndex = items.findIndex((item) => item.id === id);
          if (itemIndex === -1){
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.end("You are trying to delete an item that does not exist");
            return;
          }
          items.splice(itemIndex, 1);
          data.items = items;
          updatedData = JSON.stringify(data);
          fs.writeFile(itemsPath, updatedData, (err) => {
            if (err){
              res.writeHead(500, {"Content-Type": "text/plain"});
              res.end("Internal Server Error");
              console.error(err); // a log to be sure the data is being received
            }
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(updatedData);
          });
        })

      })
    }
  }
};

const server = http.createServer(requestHandler);
server.listen(port, hostname, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`server started successfully at http://${hostname}:${port}`);
});
