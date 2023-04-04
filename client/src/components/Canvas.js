import React, { useRef, useEffect } from 'react';

const Canvas = ({ selectedColor }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 800;

    canvas.addEventListener('click', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / 10) * 10;
      const y = Math.floor((event.clientY - rect.top) / 10) * 10;

      ctx.fillStyle = selectedColor;
      ctx.fillRect(x, y, 10, 10);
    });
  }, [selectedColor]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ border: '1px solid black' }} />
    </div>
  );
};

export default Canvas;
