const express = require("express");
const path = require("path");
const { verifyToken } = require("./auth");

const app = express();
const port = 8080;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

// Middleware to protect routes
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send("Missing Authorization header");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await verifyToken(token);
    req.user = decodedToken; // Attach decoded token data to the request object
    next();
  } catch (error) {
    return res.status(401).send("Invalid or expired token");
  }
}

// Define the Hello World route (protected route)
app.get("/helloworld", authenticate, function (req, res) {
  res.send(`Hello World! User authenticated: ${req.user.username}`);
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../public", "404.html"));
});

// Start the server
app.listen(port, function () {
  console.log(`Live on port: ${port}!`);
});
