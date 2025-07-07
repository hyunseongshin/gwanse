import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import logo from './assets/eye-logo.png'; // ⬅️ /assets 에 이미지 저장 필요

const App = () => {
  const [image, setImage] = useState(null);
  const [hscode, setHscode] = useState('');
  const [itemName, setItemName] = useState('');
  const [warning, setWarning] = useState('');
  const [showLogo, setShowLogo] = useState(true);

  const fileInputRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => setShowLogo(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setWarning(''); // 업로드 시 경고 초기화
    };
    reader.readAsDataURL(file);
  };

  const handleDoubleClickImage = () => {
    fileInputRef.current.click();
  };

  const handleScan = () => {
    // HS Code → 품목명 매핑 예시
    const codeMap = {
      '1234': '전자제품',
      '5678': '의류',
      '9012': '액세서리',
    };

    setItemName(codeMap[hscode] || '알 수 없음');

    // 이미지 검출 예시 (랜덤 처리)
    const detected = image && Math.random() > 0.5;
    setWarning(detected ? 'detect' : 'good');
  };

  return (
    <div className="container">
      {showLogo && <img src={logo} alt="logo" className="logo" />}

      <div className="left">X-ray list<br />(추후 업로드 메서드 구현하면 될듯합니다)</div>

      <div className="center" onDoubleClick={handleDoubleClickImage}>
        {image ? (
          <img src={image} alt="uploaded" className="preview" />
        ) : (
          <p>더블 클릭하여 이미지 업로드</p>
        )}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
      </div>

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

      <div className="bottom">Warning: {warning}</div>
    </div>
  );
};

export default App;
