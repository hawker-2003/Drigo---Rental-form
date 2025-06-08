const form = document.getElementById("rental-form");
const canvas = document.getElementById("signature-pad");
const ctx = canvas.getContext("2d");

// === Signature pad setup ===
let drawing = false;

const getPos = (e) => {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
};

const startDrawing = (e) => {
  drawing = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
};

const draw = (e) => {
  if (!drawing) return;
  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.stroke();
  if (e.touches) e.preventDefault();
};

const stopDrawing = () => {
  drawing = false;
  ctx.closePath();
  document.getElementById("signature-url").value = canvas.toDataURL();
};

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);
canvas.addEventListener("touchstart", startDrawing);
canvas.addEventListener("touchmove", draw);
canvas.addEventListener("touchend", stopDrawing);

function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("signature-url").value = "";
}

// === Cloudinary upload ===
async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", "drigo_upload");

  const res = await fetch("https://api.cloudinary.com/v1_1/dugsmijh5/upload", {
    method: "POST",
    body: fd
  });

  if (!res.ok) throw new Error("File upload failed");

  const json = await res.json();
  return json.secure_url;
}

async function uploadSignature() {
  const dataURL = canvas.toDataURL("image/png");
  const blob = await (await fetch(dataURL)).blob();
  const fd = new FormData();
  fd.append("file", blob, "signature.png");
  fd.append("upload_preset", "drigo_upload");

  const res = await fetch("https://api.cloudinary.com/v1_1/dugsmijh5/upload", {
    method: "POST",
    body: fd
  });

  if (!res.ok) throw new Error("Signature upload failed");

  const json = await res.json();
  return json.secure_url;
}

// === Submit handler ===
const GAS_URL = "https://script.google.com/macros/s/AKfycbzgEnHvg1Z0zYphwShqN8JD9vPH5dpAmUQu-IBl1P1fXBGsXxq7AJgZq7pjDc5sN_1P/exec";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    console.log("➡ Starting form submission");

    const name = form.fullname.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const dob = form.dob.value.trim();
    const address = form.address.value.trim();
    const rental_date = form.rental_date.value.trim();
    const duration = form.duration.value.trim();
    const car_model = form.car_model.value.trim();
    const plate = form.car_number.value.trim();

    if (!name || !phone || !email || !rental_date || !car_model || !plate) {
      alert("Please fill all required fields.");
      return;
    }

    console.log("Uploading documents...");

    const license = await uploadFile(form.license_file.files[0]);
    const aadharF = await uploadFile(form.aadhar_front.files[0]);
    const aadharB = await uploadFile(form.aadhar_back.files[0]);
    const pan = await uploadFile(form.pan_file.files[0]);
    const signature = await uploadSignature();

    console.log("All files uploaded successfully.");

    const payload = {
      name,
      phone,
      email,
      dob,
      address,
      rental_date,
      duration,
      car_model,
      plate,
      license,
      aadharF,
      aadharB,
      pan,
      signature
    };

    console.log("Sending data to Google Apps Script...");

    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.text();
    console.log("Response from GAS:", result);

    if (res.ok) {
      alert("✅ Booking submitted successfully!");
      form.reset();
      clearSignature();
    } else {
      alert("❌ Submission failed. Please try again.");
    }
  } catch (err) {
    console.error("🚨 Submission Error:", err);
    alert(❌ Something went wrong. Check console or try again.\n${err.message});
  }
});
