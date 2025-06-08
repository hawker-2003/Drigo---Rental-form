document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("rental-form");
  const pickup = document.getElementById("pickup_datetime");
  const end = document.getElementById("end_datetime");

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minVal = now.toISOString().slice(0, 16);
  pickup.min = minVal;
  end.min = minVal;

  // === Signature Pad Setup ===
  const canvas = document.getElementById("signature-pad");
  const ctx = canvas.getContext("2d");
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

    const json = await res.json();
    if (!res.ok) throw new Error("Cloudinary signature upload failed");
    return json.secure_url;
  }

  async function uploadFile(file) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "drigo_upload");

    const res = await fetch("https://api.cloudinary.com/v1_1/dugsmijh5/upload", {
      method: "POST",
      body: fd
    });

    const json = await res.json();
    if (!res.ok) throw new Error("Cloudinary file upload failed");
    return json.secure_url;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const license = await uploadFile(form.license_file.files[0]);
      const aadharF = await uploadFile(form.aadhar_front.files[0]);
      const aadharB = await uploadFile(form.aadhar_back.files[0]);
      const pan = await uploadFile(form.pan_file.files[0]);
      const signature = await uploadSignature();

      const payload = {
        first_name: form.first_name.value,
        last_name: form.last_name.value,
        email: form.email.value,
        phone: form.phone.value,
        alt_phone: form.alt_phone.value || "",
        pickup_datetime: pickup.value,
        end_datetime: end.value,
        street: form.street.value,
        address2: form.address2.value,
        city: form.city.value,
        state: form.state.value,
        zip: form.zip.value,
        country: form.country.value,
        license_number: form.license_number.value,
        paid_amount: form.paid_amount.value,
        car_model: form.car_model.value,
        plate_number: form.plate_number.value,
        signature_url: signature,
        license_file_url: license,
        aadhar_front_url: aadharF,
        aadhar_back_url: aadharB,
        pan_file_url: pan
      };

      const res = await fetch("https://script.google.com/macros/s/AKfycbxaELEu-_gBaQ8-FjYko-pdmQOqu00vBa9JB66kYLm9EThU7oBwWRg8fHL31U6Zb1P6/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("✅ Booking submitted successfully!");
        form.reset();
        clearSignature();
      } else {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        alert("❌ Submission failed. Please try again.");
      }
    } catch (err) {
      console.error("🚨 Submission error:", err);
      alert("❌ Something went wrong. Please check console or try again.");
    }
  });

  // Expose clearSignature globally if needed for button click
  window.clearSignature = clearSignature;
});
