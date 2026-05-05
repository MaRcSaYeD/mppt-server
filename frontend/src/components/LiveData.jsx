import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function LiveData() {
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("history", (data) => {
      setHistory(data);
    });

    socket.on("mpptData", (data) => {
      setLatest(data);
      setHistory((prev) => [...prev, data]);
    });

    return () => {
      socket.off("connect");
      socket.off("history");
      socket.off("mpptData");
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>MPPT Dashboard</h2>

      {latest && (
        <div style={{ marginBottom: "20px" }}>
          <h3>Latest Data</h3>
          <p>Voltage: {latest.voltage} V</p>
          <p>Current: {latest.current} A</p>
        </div>
      )}

      <div>
        <h3>History</h3>
        {history.length === 0 ? (
          <p>No data yet</p>
        ) : (
          history.map((item, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              Voltage: {item.voltage} V | Current: {item.current} A
            </div>
          ))
        )}
      </div>
    </div>
  );
}