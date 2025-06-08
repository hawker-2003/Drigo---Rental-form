const canvas = document.getElementById("signature-pad");
const ctx = canvas.getContext("2d");
let drawing = false;

const getPosition = (e) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
    y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
  };
};

const startDrawing = (e) => {
  drawing = true;
  const pos = getPosition(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  e.preventDefault();
};

const draw = (e) => {
  if (!drawing) return;
  const pos = getPosition(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  e.preventDefault();
};

const stopDrawing = (e) => {
  if (drawing) {
    drawing = false;
    document.getElementById("signature-url").value = canvas.toDataURL();
  }
  e.preventDefault();
};

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

canvas.addEventListener("touchstart", startDrawing, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", stopDrawing, { passive: false });

function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("signature-url").value = "";
}
