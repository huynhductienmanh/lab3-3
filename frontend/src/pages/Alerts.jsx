import { useEffect, useState } from "react";

export default function Alerts() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/alerts")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h3 className="mb-3">⚠ Alerts</h3>

      {data.length === 0 && (
        <div className="alert alert-success">
          No alerts. Everything looks good!
        </div>
      )}

      {data.map((a, i) => (
        <div key={i} className="alert alert-warning">
          {a.message}
        </div>
      ))}
    </div>
  );
}