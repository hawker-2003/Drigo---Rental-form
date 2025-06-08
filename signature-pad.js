// === signature-pad.js ===
const canvas = document.getElementById("signature-pad");
const signatureInput = document.getElementById("signature-url");
const ctx = canvas.getContext("2d");

let drawing = false;

function getXY(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => {
  drawing = false;
  ctx.beginPath();
  saveSignature();
});
canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const pos = getXY(e);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
});
canvas.addEventListener("mouseleave", () => drawing = false);

// ✍️ Touch support
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  drawing = true;
});
canvas.addEventListener("touchend", () => {
  drawing = false;
  saveSignature();
});
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!drawing) return;
  const pos = getXY(e);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
});

function saveSignature() {
  signatureInput.value = canvas.toDataURL("image/png");
}

function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  signatureInput.value = "";
}
