import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function LiveData() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Receive live updates
    socket.on("mpptData", (newData) => {
      setData((prev) => [...prev, newData]);
    });

    // Receive last 10 readings when connected
    socket.on("history", (historyData) => {
      setData(historyData);
    });

    return () => {
      socket.off("mpptData");
      socket.off("history");
    };
  }, []);

  return (
    <div>
      <h2>Live MPPT Data</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}