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

// drug 부분 요청 부분 api
// 이미지 분석 요청 API
app.post('/interface/drug', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;

    // FormData 구성
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    // 분석 서버로 요청 전송
    const response = await axios.post('http://192.168.0.20:8000/inference/drug', form, {
      headers: form.getHeaders(),
      responseType: 'arraybuffer' // 결과 이미지 받기 위해
    });

    // 결과 이미지 그대로 전달
    res.set('Content-Type', 'image/jpeg');
    res.send(response.data);
  } catch (error) {
    console.error('분석 요청 실패:', error.message);
    res.status(500).json({ error: 'Drug 분석 실패' });
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

// 이미지 전송해서 추론 값 뱉어내기
// curl -X POST http://192.168.0.20:8000/inference/drug \
//   -F "file=@./hs_1.png" \
//   --output result.jpg