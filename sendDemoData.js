const axios = require("axios");


const SERVER_URL = "https://mppt-server.onrender.com/mppt";

const stages = ["BULK", "ABSORPTION", "FLOAT"];

function sendRandomData() {

  const voltage = +(11 + Math.random() * 4).toFixed(2);
  const current = +(0.8 + Math.random() * 1.2).toFixed(2);

 
 
 const data = {

    voltage,
    current,

    pvPower: +(voltage * current).toFixed(2),

    dutyCycle: +(Math.random() * 100).toFixed(2),

    batteryVoltage: +(12 + Math.random() * 2).toFixed(2),

    batteryCurrent: +(1 + Math.random() * 3).toFixed(2),

    chargingStage:
      stages[Math.floor(Math.random() * stages.length)]

  };

  axios.post(SERVER_URL, data)

    .then(() => console.log("✅ Sent:", data))

    .catch(err =>
      console.error("❌ Error:", err.message)
    );
}


setInterval(sendRandomData, 2000);