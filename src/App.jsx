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
  const [showPreview, setShowPreview] = useState(true); // 중앙 이미지 미리보기 on/off

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
        loadImages(); // 업로드 후 최신 리스트 불러오기
      })
      .catch((err) => console.error('이미지 업로드 실패:', err));
  };

  const handleDoubleClick = () => {
    fileInputRef.current.click();
  };

  const handleScan = () => {
    const codeMap = {
      '1234': '전자제품',
      '5678': '의류',
      '9012': '액세서리',
    };

    setItemName(codeMap[hscode] || '알 수 없음');

    const detected = selectedImage && Math.random() > 0.5;
    setWarning(detected ? 'detect' : 'good');
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

      {/* 중앙: 이미지 미리보기 & 업로드 */}
      <div className="center" onDoubleClick={handleDoubleClick}>
        {showPreview ? (
          selectedImage ? (
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
        <button onClick={() => setShowPreview(!showPreview)} style={{ position: 'absolute', bottom: 10, right: 10 }}>
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
