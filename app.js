const API_URL = "https://script.google.com/macros/s/AKfycbwViyJevP7QwSFQ2-_7nnpDuzAXsio13V_0H9I_BqvzmZ6mJAuWKuyBZNl7RCdnnKTcvg/exec";

const form = document.getElementById("venueForm");
const statusMsg = document.getElementById("statusMsg");
const submitBtn = document.getElementById("submitBtn");
const thanksBox = document.getElementById("thanksBox");

function slugify(text) {
  return (text || "")
    .toString()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formToObject(formEl) {
  const fd = new FormData(formEl);
  const obj = {};
  for (const [k, v] of fd.entries()) obj[k] = v;

  const numFields = [
    "capacity_min","capacity_dinner","capacity_cocktail","capacity_max",
    "salons_count","main_hall_area_m2","outdoor_area_m2","parking_capacity"
  ];
  numFields.forEach(f => {
    if (obj[f] !== undefined && obj[f] !== "") obj[f] = Number(obj[f]);
  });

  const yesNoCheckboxes = [
    "air_conditioning","generator","dance_floor","stage","ceremony_area","rooms_available",
    "lake_view","river_view","garden_view","terrace",
    "furniture_included","decoration_available","lighting_sound","wedding_planner","security_service","cleaning_service"
  ];
  yesNoCheckboxes.forEach(f => { obj[f] = obj[f] ? "sí" : "no"; });

  obj.publish_consent = obj.publish_consent ? "sí" : "no";

  return obj;
}

function setBusy(isBusy) {
  submitBtn.disabled = isBusy;
  submitBtn.textContent = isBusy ? "Enviando..." : "Enviar registro";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  statusMsg.textContent = "";
  thanksBox.hidden = true;
  setBusy(true);

  try {
    // slug automático
    const venueName = form.elements["venue_name"].value;
    const slug = slugify(venueName);
    form.elements["slug"].value = slug;

    const payload = formToObject(form);

    // ✅ IMPORTANTE: no-cors evita el preflight CORS.
    // En no-cors, la respuesta es "opaque" (no la podemos leer),
    // así que asumimos éxito si no lanza error de red.
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        // Forzamos texto para evitar preflight
        "Content-Type": "text/plain;charset=UTF-8"
      },
      body: JSON.stringify(payload)
    });

    statusMsg.textContent = "✅ Enviado correctamente.";
    form.reset();
    thanksBox.hidden = false;
    thanksBox.scrollIntoView({ behavior: "smooth", block: "start" });

  } catch (err) {
    console.error(err);
    statusMsg.textContent = "❌ Error al enviar: " + (err.message || err);
  } finally {
    setBusy(false);
  }
});

