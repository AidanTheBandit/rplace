import React from 'react';

const colors = [
  '#000000', '#FFFFFF', '#C0C0C0', '#808080',
  '#800000', '#FF0000', '#800080', '#FF00FF',
  '#008000', '#00FF00', '#808000', '#FFFF00',
  '#000080', '#0000FF', '#008080', '#00FFFF'
];

const ColorPalette = ({ onColorChange }) => {
  return (
    <div>
      {colors.map((color, index) => (
        <button
          key={index}
          onClick={() => onColorChange(color)}
          style={{
            backgroundColor: color,
            width: '24px',
            height: '24px',
            border: '1px solid black'
          }}
        ></button>
      ))}
    </div>
  );
};

export default ColorPalette;
