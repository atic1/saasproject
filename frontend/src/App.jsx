import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/")
      .then((res) => {
        setMessage(res.data); // backend response
      })
      .catch((err) => {
        console.log(err);
        setMessage("Backend not connected ❌");
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>MERN Frontend</h1>
      <h2>Backend Message:</h2>
      <p>{message}</p>
    </div>
  );
}

export default App;