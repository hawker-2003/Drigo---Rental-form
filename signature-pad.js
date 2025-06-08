// === Initialize canvas drawing and upload functionality ===
window.addEventListener("load", () => {
  const canvas = document.getElementById("signature-pad");
  const ctx = canvas.getContext("2d");
  let drawing = false;

  // Get position for both mouse and touch
  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  // Start drawing
  const startDrawing = (e) => {
    drawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  // Draw line
  const draw = (e) => {
    if (!drawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    if (e.touches) e.preventDefault(); // prevent scrolling on touch
  };

  // Stop drawing
  const stopDrawing = () => {
    drawing = false;
    ctx.closePath();
    document.getElementById("signature-url").value = canvas.toDataURL();
  };

  // Event Listeners for desktop
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseout", stopDrawing);

  // Event Listeners for mobile
  canvas.addEventListener("touchstart", startDrawing);
  canvas.addEventListener("touchmove", draw);
  canvas.addEventListener("touchend", stopDrawing);
});

// === Upload signature canvas to Cloudinary
async function uploadSignature() {
  const canvas = document.getElementById("signature-pad");
  const dataURL = canvas.toDataURL("image/png");

  const blob = await (await fetch(dataURL)).blob();
  const fd = new FormData();
  fd.append("file", blob, "signature.png");
  fd.append("upload_preset", "drigo_upload");

  const res = await fetch("https://api.cloudinary.com/v1_1/dugsmijh5/upload", {
    method: "POST",
    body: fd
  });

  const json = await res.json();
  return json.secure_url;
}

// === Clear signature canvas
function clearSignature() {
  const canvas = document.getElementById("signature-pad");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("signature-url").value = "";
}

