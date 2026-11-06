/* ==========================================================
   CapeForge Hero Gear Co. - Service Estimator
   Matric 2024649372 -> Superhero Equipment Store + Service Estimator
   ========================================================== */

const SERVICES = {
  cape:     { name: "Cape Repair & Re-stitching", price: 60 },
  gauntlet: { name: "Power Gauntlet Tune-Up",     price: 120 },
  belt:     { name: "Utility Belt Restoration",   price: 80 },
  mask:     { name: "Mask & Shield Polishing",    price: 50 },
  jetpack:  { name: "Jetpack Engine Servicing",   price: 250 }
};

const CONDITIONS = {
  good:    { name: "Good",            rate: 0 },
  worn:    { name: "Worn",            rate: 0.20 },
  damaged: { name: "Damaged",         rate: 0.50 },
  smashed: { name: "Villain-smashed", rate: 1.00 }
};

const URGENCY = {
  standard:  { name: "Standard (5 days)",          rate: 0 },
  express:   { name: "Express (24 hours)",         rate: 0.25 },
  emergency: { name: "Emergency (within 2 hours)", rate: 0.60 }
};

const EXTRAS = {
  coating:  { name: "Anti-villain coating", price: 30 },
  pickup:   { name: "Sidekick pickup",      price: 15 },
  warranty: { name: "30-day warranty",      price: 25 }
};

function money(value) {
  return "RM " + value.toFixed(2);
}

function escapeHTML(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;")
             .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function setError(id, message) {
  document.getElementById(id).textContent = message;
}

function clearErrors() {
  const ids = ["custNameError", "custEmailError", "serviceTypeError",
               "quantityError", "conditionError", "urgencyError"];
  ids.forEach(function (id) { setError(id, ""); });
}

function validateForm() {
  clearErrors();
  let isValid = true;

  const name = document.getElementById("custName").value.trim();
  const email = document.getElementById("custEmail").value.trim();
  const service = document.getElementById("serviceType").value;
  const quantityText = document.getElementById("quantity").value.trim();
  const conditionInput = document.querySelector('input[name="condition"]:checked');
  const urgency = document.getElementById("urgency").value;

  if (name === "") {
    setError("custNameError", "Hero name is required.");
    isValid = false;
  } else if (name.length < 2) {
    setError("custNameError", "Name must be at least 2 characters.");
    isValid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (email === "") {
    setError("custEmailError", "Email is required.");
    isValid = false;
  } else if (!emailPattern.test(email)) {
    setError("custEmailError", "Enter a valid email, e.g. hero@example.com.");
    isValid = false;
  }

  if (service === "" || !SERVICES[service]) {
    setError("serviceTypeError", "Please choose a service type.");
    isValid = false;
  }

  const quantity = Number(quantityText);
  if (quantityText === "") {
    setError("quantityError", "Number of items is required.");
    isValid = false;
  } else if (isNaN(quantity) || !Number.isInteger(quantity)) {
    setError("quantityError", "Enter a whole number.");
    isValid = false;
  } else if (quantity < 1 || quantity > 10) {
    setError("quantityError", "Quantity must be between 1 and 10.");
    isValid = false;
  }

  if (conditionInput === null) {
    setError("conditionError", "Please select the condition of the gear.");
    isValid = false;
  }

  if (urgency === "" || !URGENCY[urgency]) {
    setError("urgencyError", "Please choose an urgency level.");
    isValid = false;
  }

  if (!isValid) {
    alert("Invalid input, please check your form.");
    return null;
  }

  const extras = [];
  document.querySelectorAll('input[name="extras"]:checked').forEach(function (box) {
    extras.push(box.value);
  });

  return {
    name: name,
    email: email,
    service: service,
    quantity: quantity,
    condition: conditionInput.value,
    urgency: urgency,
    extras: extras
  };
}

function calculateEstimate(data) {
  const service = SERVICES[data.service];
  const condition = CONDITIONS[data.condition];
  const urgency = URGENCY[data.urgency];

  const base = service.price * data.quantity;

  const conditionCharge = base * condition.rate;
  const subtotal = base + conditionCharge;

  const urgencyCharge = subtotal * urgency.rate;

  let extrasTotal = 0;
  const extraNames = [];
  data.extras.forEach(function (key) {
    extrasTotal += EXTRAS[key].price;
    extraNames.push(EXTRAS[key].name + " (" + money(EXTRAS[key].price) + ")");
  });

  const total = subtotal + urgencyCharge + extrasTotal;

  const resultBox = document.getElementById("result");
  resultBox.innerHTML =
    "<h3>Your estimate</h3>" +
    "<table>" +
      "<tr><th colspan='2'>Your request</th></tr>" +
      "<tr><td>Hero name</td><td>" + escapeHTML(data.name) + "</td></tr>" +
      "<tr><td>Email</td><td>" + escapeHTML(data.email) + "</td></tr>" +
      "<tr><td>Service</td><td>" + service.name + " (" + money(service.price) + " each)</td></tr>" +
      "<tr><td>Quantity</td><td>" + data.quantity + "</td></tr>" +
      "<tr><td>Condition</td><td>" + condition.name + " (+" + (condition.rate * 100) + "%)</td></tr>" +
      "<tr><td>Urgency</td><td>" + urgency.name + " (+" + (urgency.rate * 100) + "%)</td></tr>" +
      "<tr><td>Extras</td><td>" + (extraNames.length ? extraNames.join("<br>") : "None") + "</td></tr>" +
    "</table>" +
    "<table>" +
      "<tr><th colspan='2'>Charges</th></tr>" +
      "<tr><td>Base (" + money(service.price) + " x " + data.quantity + ")</td><td>" + money(base) + "</td></tr>" +
      "<tr><td>Condition surcharge</td><td>" + money(conditionCharge) + "</td></tr>" +
      "<tr><td>Subtotal</td><td>" + money(subtotal) + "</td></tr>" +
      "<tr><td>Urgency surcharge</td><td>" + money(urgencyCharge) + "</td></tr>" +
      "<tr><td>Extras</td><td>" + money(extrasTotal) + "</td></tr>" +
      "<tr class='total-row'><td>Total service charge</td><td>" + money(total) + "</td></tr>" +
    "</table>";

  resultBox.hidden = false;
  resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

const form = document.getElementById("estimateForm");

if (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();               
    const data = validateForm();          
    if (data === null) {
      document.getElementById("result").hidden = true;
      return;
    }
    calculateEstimate(data);
    alert("Calculation complete!");
  });

  form.addEventListener("reset", function () {
    clearErrors();
    document.getElementById("result").hidden = true;
  });
}
