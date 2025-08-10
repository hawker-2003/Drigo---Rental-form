document.addEventListener("DOMContentLoaded", function () {

  const signaturePad = document.getElementById("signature-pad");
  const ctx = signaturePad.getContext("2d");
  let isDrawing = false;

  // Mouse events
  signaturePad.addEventListener("mousedown", (e) => {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });
  signaturePad.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    }
  });
  signaturePad.addEventListener("mouseup", () => isDrawing = false);
  signaturePad.addEventListener("mouseleave", () => isDrawing = false);

  // Touch events (mobile)
  signaturePad.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = signaturePad.getBoundingClientRect();
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  });
  signaturePad.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (isDrawing) {
      const touch = e.touches[0];
      const rect = signaturePad.getBoundingClientRect();
      ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
      ctx.stroke();
    }
  });
  signaturePad.addEventListener("touchend", () => isDrawing = false);

  // Clear signature
  function clearSignature() {
    ctx.clearRect(0, 0, signaturePad.width, signaturePad.height);
  }

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhE0tDEuElWdLcUwMO9ZOs9r-XP-1XTTn1_66VMdt4XqZ2Qx1I5B6VrbApRDsFzvzU/exec";

  document.getElementById("rental-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const data = Object.fromEntries(new FormData(form).entries());

    // Signature as image
    const signatureURL = signaturePad.toDataURL();
    data.signature_url = signatureURL;

    // Required files
    const fileFields = [
      { name: "license_file", label: "Driving License" },
      { name: "aadhar_front", label: "Aadhar Front" },
      { name: "aadhar_back", label: "Aadhar Back" },
      { name: "pan_file", label: "PAN Card" }
    ];
    for (let field of fileFields) {
      const fileInput = form.querySelector(`[name="${field.name}"]`);
      if (!fileInput || fileInput.files.length === 0) {
        alert(`Please upload: ${field.label}`);
        return;
      }
    }

    try {
      const formData = new FormData();
      for (const pair of Object.entries(data)) {
        formData.append(pair[0], pair[1]);
      }
      fileFields.forEach(field => {
        const fileInput = form.querySelector(`[name="${field.name}"]`);
        formData.append(field.name, fileInput.files[0]);
      });

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.status === "success") {
        alert("Form submitted successfully!");
        form.reset();
        clearSignature();
      } else {
        alert("Form submission failed: " + result.message);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Error: " + err.message);
    }
  });

});
