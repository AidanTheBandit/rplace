import React, { useState } from 'react';
import './App.css';
import Canvas from './components/Canvas';
import ColorPalette from './components/ColorPalette';

function App() {
  const [selectedColor, setSelectedColor] = useState('#000000');

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  return (
    <div className="App">
      <>
        <Canvas selectedColor={selectedColor} />
        <ColorPalette onColorChange={handleColorChange} />
      </>
    </div>
  );
}

export default App;
