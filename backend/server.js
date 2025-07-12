const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');

app.use(cors()); // CORS 허용
app.use('/xrays', express.static(path.join(__dirname, '../public/xrays')));

app.get('/api/xrays', (req, res) => {
  const dir = path.join(__dirname, '../public/xrays');
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).send('Error reading directory');
    const images = files.filter(f => /\.(png|jpe?g|gif)$/i.test(f));
    res.json(images);
  });
});

app.listen(5000, () => {
  console.log('X-ray API running on http://localhost:5000');
});
