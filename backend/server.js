const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

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

// 이미지 분석 요청 API
app.post('/interface/drug', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post(
      'https://022d168353f8.ngrok-free.app/inference/drug',
      form,
      {
        headers: form.getHeaders(),
        responseType: 'arraybuffer'
      }
    );

    res.set('Content-Type', 'image/jpeg');
    res.send(response.data);
  } catch (error) {
    console.error('분석 요청 실패:', error.message);
    res.status(500).json({ error: 'Drug 분석 실패' });
  }
});

// 위험물 분석 추가 API
app.post('/interface/dangerous', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post(
      'https://022d168353f8.ngrok-free.app/inference/dangerous',
      form,
      {
        headers: form.getHeaders(),
        responseType: 'arraybuffer'
      }
    );

    res.set('Content-Type', 'image/jpeg');
    res.send(response.data);
  } catch (err) {
    console.error('위험물 분석 실패:', err.message);
    res.status(500).json({ error: 'Dangerous 분석 실패' });
  }
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


