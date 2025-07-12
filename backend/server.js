const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use('/xrays', express.static(path.join(__dirname, '../public/xrays')));

// ✅ 업로드를 위한 multer 설정
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/xrays'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  },
});
const upload = multer({ storage });

// ✅ 이미지 업로드 API
app.post('/api/upload', upload.array('files'), (req, res) => {
  res.json({ success: true, files: req.files.map(f => f.filename) });
});

// ✅ X-ray 목록 API
app.get('/api/xrays', (req, res) => {
  const dir = path.join(__dirname, '../public/xrays');
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).send('Directory error');
    const images = files.filter(f => /\.(png|jpe?g|gif)$/i.test(f));
    res.json(images);
  });
});

app.listen(5000, () => {
  console.log('X-ray server running on http://localhost:5000');
});
