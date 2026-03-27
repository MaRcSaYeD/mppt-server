// sendDemoData.js
const axios = require("axios");

// Replace with your server URL if running locally
const SERVER_URL = "http://localhost:3000/mppt";

function sendRandomData() {
  // Generate random values
  const data = {
    voltage: +(11 + Math.random() * 4).toFixed(2),      // 11V to 15V
    current: +(0.8 + Math.random() * 1.2).toFixed(2),  // 0.8A to 2.0A
    power: 0, // Will calculate below
    dutyCycle: +(0.1 + Math.random() * 0.8).toFixed(2), // 0.1 to 0.9
    temperature: +(20 + Math.random() * 15).toFixed(1), // 20°C to 35°C
    timestamp: new Date().toISOString()                 // Current time
  };

  // Calculate power = voltage * current
  data.power = +(data.voltage * data.current).toFixed(2);

  axios.post(SERVER_URL, data)
    .then(() => console.log("✅ Sent:", data))
    .catch(err => console.error("❌ Error sending data:", err));
}

// Send data every 2 seconds
setInterval(sendRandomData, 2000);