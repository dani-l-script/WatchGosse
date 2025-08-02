const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;

app.get('/api/data', (req, res) => {
  const filePath = path.join(__dirname, 'realtest.json');
  const readStream = fs.createReadStream(filePath);

  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, application/json');
  readStream.pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});