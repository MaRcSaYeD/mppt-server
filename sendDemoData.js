const axios = require("axios");

// If using Render (recommended):
const SERVER_URL = "https://mppt-server.onrender.com/mppt";

// If testing locally, use this instead:
// const SERVER_URL = "http://localhost:3000/mppt";

function sendRandomData() {
  // Generate random voltage and current
  const voltage = +(11 + Math.random() * 4).toFixed(2);
  const current = +(0.8 + Math.random() * 1.2).toFixed(2);

  // Create data object
  const data = {
    voltage,
    current,
    pvPower: +(voltage * current).toFixed(2), // ✅ correct
    dutyCycle: +(Math.random() * 100).toFixed(2) // %
  };

  axios.post(SERVER_URL, data)
    .then(() => console.log("✅ Sent:", data))
    .catch(err => console.error("❌ Error sending data:", err.message));
}

// Send data every 2 seconds
setInterval(sendRandomData, 2000);