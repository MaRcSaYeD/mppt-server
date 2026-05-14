require("dotenv").config();

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const mpptSchema = new mongoose.Schema({
  voltage: Number,
  current: Number,
  pvPower: Number,
  dutyCycle: Number,

  batteryVoltage: Number,   
  batteryCurrent: Number,   
  chargingStage: String,    

  timestamp: { type: Date, default: Date.now }
});

const MpptData = mongoose.model("MpptData", mpptSchema, "data");

app.post("/mppt", async (req, res) => {
  console.log("Received from Arduino:", req.body);


  const {
    voltage,
    current,
    pvPower,
    dutyCycle,
    batteryVoltage,
    batteryCurrent,
    chargingStage,
  } = req.body;

  if (
    voltage == null ||
    current == null ||
    pvPower == null ||
    dutyCycle == null
  ) {
    return res.status(400).json({
      error: "Missing required data"
    });
  }

  try {

    const data = new MpptData({
      voltage,
      current,
      pvPower,
      dutyCycle,
      batteryVoltage,
      batteryCurrent,
      chargingStage,
    });

    await data.save();

    io.emit("mpptData", data);

    res.json({
      success: true,
      data
    });

  } catch (err) {

    console.error("POST /mppt error:", err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

app.get("/history", async (req, res) => {
  try {
    const history = await MpptData.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    res.json(
      history.reverse().map((item) => ({
        voltage: item.voltage,
        current: item.current,
        pvPower: item.pvPower,
        dutyCycle: item.dutyCycle,
        batteryVoltage: item.batteryVoltage,
        batteryCurrent: item.batteryCurrent,
        chargingStage: item.chargingStage,
        timestamp: item.timestamp
      }))
    );
  } catch (err) {
    console.error("GET /history error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

io.on("connection", async (socket) => {
  console.log("🔌 Dashboard connected:", socket.id);

  try {
    const lastData = await MpptData.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    socket.emit(
      "history",
      lastData.reverse().map((item) => ({
        voltage: item.voltage,
        current: item.current,
        pvPower: item.pvPower,
        dutyCycle: item.dutyCycle,
        batteryVoltage: item.batteryVoltage,
        batteryCurrent: item.batteryCurrent,
        chargingStage: item.chargingStage,
        timestamp: item.timestamp
      }))
    );
  } catch (err) {
    console.error("Socket history error:", err);
  }

  socket.on("disconnect", () => {
    console.log("❌ Dashboard disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("MPPT backend server is running");
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    server.listen(PORT, () => {
      console.log(`🌐 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });