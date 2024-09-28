const express = require('express');
const path = require('path');

const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname, '/public')));

app.use((req, res) => {
  res.status(404);
  res.sendFile(path.join(__dirname, '/public', '404.html'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
