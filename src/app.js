const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');

//Get routes
const routes = require("./routes.js");

//Start Express-js
const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, '../public')));

//Add bodyparser and CORS.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Start the server.
try {
  //Listen mode.
  app.listen(8080, "127.0.0.1", () => {
    console.log("Server running");
  });

  //Assign routes controller.
  app.use("/auth", routes);
} catch (err) {
  console.log("error", err);
}

const onClose = () => {
  process.exit();
};

//Handle process server.
process.on("SIGTERM", onClose);
process.on("SIGINT", onClose);
process.on("uncaughtException", onClose);
