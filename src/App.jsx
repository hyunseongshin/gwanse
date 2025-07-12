import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './assets/eye-logo.png';

const App = () => {
  const [images, setImages] = useState([]); // X-ray 리스트
  const [selectedImage, setSelectedImage] = useState(null); // 중앙에 표시할 이미지
  const [hscode, setHscode] = useState('');
  const [itemName, setItemName] = useState('');
  const [warning, setWarning] = useState('');
  const [showLogo, setShowLogo] = useState(true);

  // 앱 시작 후 3초 후 로고 사라지기
  useEffect(() => {
    const timer = setTimeout(() => setShowLogo(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 서버에서 /xrays 폴더 이미지 목록 불러오기
  useEffect(() => {
    fetch('http://localhost:5000/api/xrays')
      .then((res) => res.json())
      .then((files) => {
        const urls = files.map((f) => `http://localhost:5000/xrays/${f}`);
        setImages(urls);
        if (urls.length > 0) {
          setSelectedImage(urls[0]); // 첫 번째 이미지를 기본 선택
        }
      })
      .catch((err) => console.error('X-ray 이미지 불러오기 실패:', err));
  }, []);

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

      {/* 중앙: 이미지 미리보기 */}
      <div className="center">
        {selectedImage ? (
          <img src={selectedImage} alt="selected" className="preview" />
        ) : (
          <p>이미지를 선택해주세요</p>
        )}
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
