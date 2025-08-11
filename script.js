<script>
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

  // Touch events
  signaturePad.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const rect = signaturePad.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
    isDrawing = true;
  });
  signaturePad.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (isDrawing) {
      const rect = signaturePad.getBoundingClientRect();
      ctx.lineTo(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
      ctx.stroke();
    }
  });
  signaturePad.addEventListener("touchend", () => isDrawing = false);

  // Clear signature
  document.getElementById("clear-signature").addEventListener("click", () => {
    ctx.clearRect(0, 0, signaturePad.width, signaturePad.height);
  });

  // Convert file to Base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]); // Remove data URL prefix
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // Submit form
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybxt4RMSy3jGkh17S8ekNDNwBjNw4g9pDFxmWQYF3xsFVkpJLM_OZlSnL22OFvLqtW/exec"; // Replace with your Apps Script URL
  document.getElementById("rental-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const data = Object.fromEntries(new FormData(form).entries());

    // Convert signature to Base64
    data.signature_url = signaturePad.toDataURL("image/png").split(",")[1];

    // Required file fields
    const fileFields = [
      { name: "license_file", label: "Driving License" },
      { name: "aadhar_front", label: "Aadhar Front" },
      { name: "aadhar_back", label: "Aadhar Back" },
      { name: "pan_file", label: "PAN Card" }
    ];

    // Validate file uploads
    for (let field of fileFields) {
      const fileInput = form.querySelector(`[name="${field.name}"]`);
      if (!fileInput || fileInput.files.length === 0) {
        alert(`Please upload: ${field.label}`);
        return;
      }
    }

    // Convert files to Base64
    for (let field of fileFields) {
      const fileInput = form.querySelector(`[name="${field.name}"]`);
      data[field.name] = await fileToBase64(fileInput.files[0]);
    }

    // Send data
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: new URLSearchParams(data), // URL-encoded form data
      });

      const result = await response.json();
      if (result.status === "success") {
        alert("Form submitted successfully!");
        form.reset();
        ctx.clearRect(0, 0, signaturePad.width, signaturePad.height);
      } else {
        alert("Form submission failed: " + result.message);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Error: " + err.message);
    }
  });
});
</script>

