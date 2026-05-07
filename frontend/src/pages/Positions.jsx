import { useEffect, useState } from "react";

export default function Positions() {
  const [data, setData] = useState([]);
  const [name, setName] = useState("");

  const load = () => {
    fetch("http://localhost:5000/api/positions")
      .then((r) => r.json())
      .then(setData);
  };

  useEffect(() => {
    load();
  }, []);

  const add = () => {
    fetch("http://localhost:5000/api/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ PositionName: name }),
    }).then(() => {
      setName("");
      load();
    });
  };

  const del = (id) => {
    if (!window.confirm("Xóa chuc vu?")) return;

    fetch(`http://localhost:5000/api/positions/${id}`, {
      method: "DELETE",
    }).then(load);
  };

  return (
    <div>
      <h3>Positions</h3>

      <input
        className="form-control mb-2"
        placeholder="Position name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button className="btn btn-primary mb-3" onClick={add}>
        Add
      </button>

      <ul className="list-group">
        {data.map((d) => (
          <li key={d.PositionID} className="list-group-item d-flex justify-content-between">
            {d.PositionName}
            <button className="btn btn-danger btn-sm" onClick={() => del(d.PositionID)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}