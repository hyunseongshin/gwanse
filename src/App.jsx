import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import logo from './assets/eye-logo.png';


const App = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [hscode, setHscode] = useState('');
  const [itemName, setItemName] = useState('');
  const [warning, setWarning] = useState('');
  const [showLogo, setShowLogo] = useState(true);

  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => setShowLogo(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const loadImages = () => {
    fetch('http://localhost:5000/api/xrays')
      .then((res) => res.json())
      .then((files) => {
        const urls = files.map((f) => `http://localhost:5000/xrays/${f}`);
        setImages(urls);
        if (urls.length > 0) {
          setSelectedImage(urls[0]);
        }
      })
      .catch((err) => console.error('X-ray 이미지 불러오기 실패:', err));
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        loadImages();
      })
      .catch((err) => console.error('이미지 업로드 실패:', err));
  };

  const handleDoubleClick = () => {
    fileInputRef.current.click();
  };

  const handleScan = async () => {
    if (!selectedImage) return;

    try {
      setBeforeImage(selectedImage);
      setAfterImage(null);
      setItemName('');
      setWarning('');

      const blob = await fetch(selectedImage).then(res => res.blob());
      const formData = new FormData();
      formData.append('file', blob, 'scan.jpg');

      const [drugRes, dangerRes] = await Promise.all([
        fetch('http://localhost:5000/interface/drug', {
          method: 'POST',
          body: formData
        }),
        fetch('http://localhost:5000/interface/dangerous', {
          method: 'POST',
          body: formData
        })
      ]);

      if (!drugRes.ok || !dangerRes.ok) throw new Error('분석 실패');

      const drugBlob = await drugRes.blob();
      const dangerBlob = await dangerRes.blob();

      const drugUrl = URL.createObjectURL(drugBlob);

      setAfterImage(drugUrl);

      // ✅ 여기서 dangerous 결과를 HS 코드 이름으로 임시 지정
      // 실제 dangerous API가 JSON 응답이라면 .json() 사용하세요
      const fakeResult = '위험물'; // 예시값. 실제 dangerous 분석 결과가 있으면 그걸로 대체
      setItemName(fakeResult);

      setShowPreview(true);
      setWarning('detect');
    } catch (err) {
      console.error('분석 실패:', err);
      setWarning('error');
    }
  };

  return (
    <div className="container">
      {showLogo && <img src={logo} alt="logo" className="logo" />}

      {/* 왼쪽: X-ray 리스트 */}
      <div className="left">
        <div className="xray-list">
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`xray-${index}`}
              className="xray-thumb"
              onClick={() => {
                setSelectedImage(src);
                setWarning('');
              }}
            />
          ))}
        </div>
      </div>

      {/* 중앙: before/after */}
      <div className="center" onDoubleClick={handleDoubleClick}>
        {showPreview ? (
          beforeImage && afterImage ? (
            <div className="comparison">
              <div>
                <p style={{ textAlign: 'center' }}>Before</p>
                <img src={beforeImage} alt="before" className="preview" />
              </div>
              <div>
                <p style={{ textAlign: 'center' }}>After</p>
                <img src={afterImage} alt="after" className="preview" />
              </div>
            </div>
          ) : selectedImage ? (
            <img src={selectedImage} alt="selected" className="preview" />
          ) : (
            <p>더블 클릭하여 이미지 업로드</p>
          )
        ) : (
          <p style={{ opacity: 0.4 }}>더블 클릭하여 이미지 업로드</p>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <button
          onClick={() => setShowPreview(!showPreview)}
          style={{ position: 'absolute', bottom: 10, right: 10 }}
        >
          {showPreview ? '미리보기 끄기' : '미리보기 켜기'}
        </button>
      </div>

      {/* 오른쪽: HS Code 입력 및 Scan */}
      <div className="right">
        <input
          type="text"
          placeholder="HS Code"
          value={hscode}
          onChange={(e) => setHscode(e.target.value)}
          className="input"
        />
        <div className="item">{itemName}</div>
        <button onClick={handleScan} className="scan-button">
          Scan
        </button>
      </div>

      {/* 하단: 경고 메시지 */}
      <div className="bottom">Warning: {warning}</div>
    </div>
  );
};

export default App;
