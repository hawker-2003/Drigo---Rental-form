// Signature Pad Setup
let signaturePad = document.getElementById("signature-pad");
let ctx = signaturePad.getContext("2d");
let isDrawing = false;

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

signaturePad.addEventListener("mouseup", () => {
  isDrawing = false;
});

signaturePad.addEventListener("mouseleave", () => {
  isDrawing = false;
});

function clearSignature() {
  ctx.clearRect(0, 0, signaturePad.width, signaturePad.height);
}
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyylByJqwrnsvlDFNSxLmOLobM91htv7ms5TLNZvC8DViQBVaBFYzd1poSLZGn_fzkJ/exec";
async function uploadFile(file, name) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("filename", name);

  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  if (!result.fileUrl) {
    throw new Error(`Failed to upload file: ${name}`);
  }
  return result.fileUrl;
}
document.getElementById("rental-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());

  // Capture signature
  const signatureURL = signaturePad.toDataURL();
  data.signature_url = signatureURL;

  // File fields and labels
  const fileFields = [
    { name: "license_file", label: "Driving_License" },
    { name: "aadhar_front", label: "Aadhar_Front" },
    { name: "aadhar_back", label: "Aadhar_Back" },
    { name: "pan_file", label: "PAN_Card" }
  ];

  try {
    for (let field of fileFields) {
      const fileInput = form.querySelector(`[name="${field.name}"]`);
      if (fileInput && fileInput.files.length > 0) {
        const fileUrl = await uploadFile(fileInput.files[0], field.label);
        data[`${field.name}_url`] = fileUrl;
      } else {
        throw new Error(`Missing file input: ${field.label}`);
      }
    }

    // Final form data POST
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
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
    console.error("Submission Error:", err);
    alert("Error submitting form: " + err.message);
  }
});

