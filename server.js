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

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const mpptSchema = new mongoose.Schema({
  voltage: Number,
  current: Number,
  timestamp: { type: Date, default: Date.now }
});

const MpptData = mongoose.model("MpptData", mpptSchema, "data");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.post("/mppt", async (req, res) => {
  const { voltage, current } = req.body;
  if (voltage == null || current == null) return res.status(400).json({ error: "Missing voltage or current" });

  try {
    const data = new MpptData({ voltage, current });
    await data.save();
    io.emit("mpptData", { voltage, current });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
  console.log("🔌 Dashboard connected:", socket.id);
  MpptData.find().sort({ timestamp: -1 }).limit(10)
    .then((lastData) => socket.emit("history", lastData.reverse()));

  socket.on("disconnect", () => {
    console.log("❌ Dashboard disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});