// ===== Configuración =====

// Frases (selección cuidada para evitar demasiadas repeticiones visuales)
const PHRASES = [
  "Te amo", "I love you", "Je t’aime", "Ti amo", "Ich liebe dich",
  "Eu te amo", "Я тебя люблю", "愛してる", "사랑해", "我爱你",
  "Seni seviyorum", "Ik hou van jou", "Jeg elsker deg", "Jag älskar dig",
  "Σ’αγαπώ", "Kocham cię", "Te iubesc", "Mahal kita", "T’estimo",
  "Volim te", "Ljubim te", "Szeretlek", "Aloha wau iā ‘oe",
  "Ua here vau ia ‘oe", "Mi amas vin", "Aku cinta kamu", "Nakupenda",
  "Ngiyakuthanda", "Ek het jou lief", "Mina rakastan sinua"
];

// Número de líneas (corazones concéntricos)
const LINES = 12;          // más líneas = más relleno
const SCALE_OUTER = 1.00;  // escala del corazón exterior
const SCALE_INNER = 0.25;  // escala del corazón más interior
// El tamaño de letra disminuirá suavemente hacia el interior
const FONT_OUTER = 22;     // px
const FONT_INNER = 12;     // px

// Rotación máxima con el mouse
const MAX_ROT_X = 16;  // grados
const MAX_ROT_Y = 26;  // grados

// ===== Construcción del relleno =====
const svg = document.getElementById('heartSVG');
const linesGroup = document.getElementById('lines');
const heartPath = document.getElementById('heartPath');
const baseLength = heartPath.getTotalLength(); // 1000 por pathLength, pero lo medimos por robustez

// Easing cuadrático para transiciones suaves
const ease = t => t * t * (3 - 2 * t);

// Genera texto para una línea, repitiendo lo justo para llenar el camino
function makeLineText(minChars = 40) {
  // Mezclamos frases para variedad
  const shuffled = [...PHRASES].sort(() => Math.random() - 0.5);
  // Usamos separadores sutiles para legibilidad
  const sep = "  •  ";
  let str = shuffled.join(sep);
  while (str.length < minChars) {
    // Añadimos pequeñas porciones, no todo el bloque, para evitar patrones largos
    const chunk = shuffled.slice(0, Math.max(3, Math.floor(Math.random()*6))).join(sep);
    str += sep + chunk;
  }
  return str;
}

function buildHeartLines() {
  linesGroup.innerHTML = "";

  for (let i = 0; i < LINES; i++) {
    const t = i / (LINES - 1); // 0..1
    const s = SCALE_OUTER - (SCALE_OUTER - SCALE_INNER) * ease(t); // escala de la línea
    const fontSize = FONT_OUTER - (FONT_OUTER - FONT_INNER) * ease(t);

    // Longitud visual de esta línea (escala aplicada)
    const visualLength = baseLength * s;

    // Estimación de caracteres necesarios (aprox 0.55em por carácter)
    const approxCharWidth = fontSize * 0.55;
    const minChars = Math.max(30, Math.floor(visualLength / approxCharWidth));

    const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textEl.setAttribute("font-size", fontSize.toFixed(1));
    textEl.setAttribute("lengthAdjust", "spacing");        // Ajusta solo espaciado
    textEl.setAttribute("textLength", visualLength);        // Estírala para cubrir la línea
    textEl.setAttribute("text-anchor", "middle");

    // Centrado de la línea
    const textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
    textPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#heartPath");
    textPath.setAttribute("startOffset", "50%"); // centra el texto en la ruta

    textPath.textContent = makeLineText(minChars);

    // Agrupamos con transformación de escala para generar corazones concéntricos
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `scale(${s.toFixed(4)})`);

    textEl.appendChild(textPath);
    g.appendChild(textEl);
    linesGroup.appendChild(g);
  }
}

buildHeartLines();

// ===== Interacción: rotación con mouse/touch =====
const scene = document.getElementById('scene');
const heart3d = document.getElementById('heart3d');

let targetRotX = 8;
let targetRotY = 0;
let currentRotX = targetRotX;
let currentRotY = targetRotY;

function updateTargetFromPointer(clientX, clientY) {
  const rect = scene.getBoundingClientRect();
  const nx = (clientX - rect.left) / rect.width;   // 0..1
  const ny = (clientY - rect.top) / rect.height;   // 0..1
  targetRotY = (nx - 0.5) * 2 * MAX_ROT_Y;
  targetRotX = -(ny - 0.5) * 2 * MAX_ROT_X;
}

scene.addEventListener('mousemove', (e) => updateTargetFromPointer(e.clientX, e.clientY));
scene.addEventListener('mouseenter', (e) => updateTargetFromPointer(e.clientX, e.clientY));
scene.addEventListener('touchmove', (e) => {
  if (e.touches && e.touches.length) {
    const t = e.touches[0];
    updateTargetFromPointer(t.clientX, t.clientY);
  }
}, { passive: true });

function animate() {
  currentRotX += (targetRotX - currentRotX) * 0.12;
  currentRotY += (targetRotY - currentRotY) * 0.12;
  heart3d.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
  requestAnimationFrame(animate);
}
animate();

// Reconstruir si cambia el viewport (opcional)
window.addEventListener('resize', () => {
  // Recalcular longitudes (viewBox no cambia, pero por si ajustas path/escala)
  buildHeartLines();
});