const express = require("express");
const path = require("path");

const app = express();
const port = 8080;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

// Define the Hello World route
app.get("/helloworld", function (req, res) {
  res.send("Hello World!");
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../public", "404.html"));
});

// Start the server
app.listen(port, function () {
  console.log(`Live on port: ${port}!`);
});

