require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname, '../public')));


// Handle 404 errors
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public', '404.html'));
});

// Start the server
app.listen(port, function () {
  console.log(`Live on port: ${port}!`);
});
