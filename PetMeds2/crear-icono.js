const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const size = 1024;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Fondo morado con esquinas redondeadas
ctx.fillStyle = '#6c63ff';
ctx.beginPath();
ctx.roundRect(0, 0, size, size, 180);
ctx.fill();

// Color blanco para las patitas
ctx.fillStyle = 'white';

// Almohadilla principal (grande, abajo al centro)
ctx.beginPath();
ctx.ellipse(512, 620, 150, 130, 0, 0, Math.PI * 2);
ctx.fill();

// Almohadilla izquierda
ctx.beginPath();
ctx.ellipse(320, 490, 75, 100, -0.3, 0, Math.PI * 2);
ctx.fill();

// Almohadilla derecha
ctx.beginPath();
ctx.ellipse(704, 490, 75, 100, 0.3, 0, Math.PI * 2);
ctx.fill();

// Dedito izquierda
ctx.beginPath();
ctx.ellipse(390, 340, 58, 72, -0.2, 0, Math.PI * 2);
ctx.fill();

// Dedito centro
ctx.beginPath();
ctx.ellipse(512, 300, 58, 72, 0, 0, Math.PI * 2);
ctx.fill();

// Dedito derecha
ctx.beginPath();
ctx.ellipse(634, 340, 58, 72, 0.2, 0, Math.PI * 2);
ctx.fill();

// Guardar como PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'assets', 'icon.png'), buffer);
fs.writeFileSync(path.join(__dirname, 'assets', 'splash-icon.png'), buffer);

console.log('✅ Íconos creados en assets/');