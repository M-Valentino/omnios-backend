const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const routes = require("./routes.js");

const app = express();

// Add bodyparser and CORS middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", routes);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Start the server
try {
  app.listen(8080, "localhost", () => {
    console.log("Server running on http://localhost:8080");
  });
} catch (err) {
  console.log("Error starting server:", err);
}

// Clean server shutdown
const onClose = () => {
  process.exit();
};

// Handle process server
process.on("SIGTERM", onClose);
process.on("SIGINT", onClose);
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  onClose();
});
