document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("rental-form");
  const datetimeInput = document.getElementById("pickup_datetime");
  const endDatetimeInput = document.getElementById("end_datetime");

  // === Set min date-time (no past dates)
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minTime = now.toISOString().slice(0, 16);
  datetimeInput.min = minTime;
  if (endDatetimeInput) endDatetimeInput.min = minTime;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      // Upload files to Cloudinary
      const license = await uploadFile(form.license_file.files[0]);
      const aadharFront = await uploadFile(form.aadhar_front.files[0]);
      const aadharBack = await uploadFile(form.aadhar_back.files[0]);
      const pan = await uploadFile(form.pan_file.files[0]);
      const signature = await uploadSignature(); // Now handled separately

      // Prepare data
      const data = {
        first_name: form.first_name.value,
        last_name: form.last_name.value,
        email: form.email.value,
        phone: form.phone.value,
        alt_phone: form.alt_phone?.value || "",
        pickup_datetime: form.pickup_datetime.value,
        end_datetime: form.end_datetime.value,
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
        aadhar_front_url: aadharFront,
        aadhar_back_url: aadharBack,
        pan_file_url: pan
      };

      // Submit to Google Apps Script
      const response = await fetch("https://script.google.com/macros/s/AKfycbxaELEu-_gBaQ8-FjYko-pdmQOqu00vBa9JB66kYLm9EThU7oBwWRg8fHL31U6Zb1P6/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert("✅ Booking submitted successfully!");
        form.reset();
        clearSignature(); // Also in signature-pad.js
      } else {
        alert("❌ Submission failed. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("❌ Something went wrong. Check your connection or input.");
    }
  });
});

// === Upload a file to Cloudinary
async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", "drigo_upload"); // your Cloudinary preset

  const res = await fetch("https://api.cloudinary.com/v1_1/dugsmijh5/upload", {
    method: "POST",
    body: fd
  });

  const json = await res.json();
  return json.secure_url;
}


