const canvas = document.getElementById("signature-pad");
const ctx = canvas.getContext("2d");
let drawing = false;

const getPos = (e) => {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
};

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
});
canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
});
canvas.addEventListener("mouseup", () => {
  drawing = false;
  document.getElementById("signature-url").value = canvas.toDataURL();
});
canvas.addEventListener("mouseout", () => (drawing = false));

// Mobile Support
canvas.addEventListener("touchstart", (e) => {
  drawing = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
});
canvas.addEventListener("touchmove", (e) => {
  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  e.preventDefault();
});
canvas.addEventListener("touchend", () => {
  drawing = false;
  document.getElementById("signature-url").value = canvas.toDataURL();
});

function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("signature-url").value = "";
}

