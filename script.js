// === script.js ===

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("rental-form");
  const datetimeInput = document.getElementById("pickup_datetime");

  // === Set min date-time (no past dates)
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  datetimeInput.min = now.toISOString().slice(0, 16);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Upload all files to Cloudinary
    const license = await uploadFile(form.license_file.files[0]);
    const aadharFront = await uploadFile(form.aadhar_front.files[0]);
    const aadharBack = await uploadFile(form.aadhar_back.files[0]);
    const pan = await uploadFile(form.pan_file.files[0]);

    // Prepare form data
    const data = {
      first_name: form.first_name.value,
      last_name: form.last_name.value,
      email: form.email.value,
      phone: form.phone.value,
      pickup_datetime: form.pickup_datetime.value,
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
      signature_url: document.getElementById("signature-url").value,
      license_file_url: license,
      aadhar_front_url: aadharFront,
      aadhar_back_url: aadharBack,
      pan_file_url: pan
    };

    // Send to Google Apps Script
    try {
      const response = await fetch("YOUR_GOOGLE_SCRIPT_URL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert("✅ Booking submitted successfully!");
        form.reset();
        clearSignature();
      } else {
        alert("❌ Submission failed. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("❌ Network error. Please check your connection.");
    }
  });
});

// === Upload file to Cloudinary
async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", "YOUR_UPLOAD_PRESET"); // 🔁 Replace
  const res = await fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload", {
    method: "POST",
    body: fd
  });
  const json = await res.json();
  return json.secure_url;
}
