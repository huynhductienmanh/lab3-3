import { useEffect, useState } from "react";

export default function Departments() {
  const [data, setData] = useState([]);
  const [name, setName] = useState("");

  const load = () => {
    fetch("http://localhost:5000/api/departments")
      .then((r) => r.json())
      .then(setData);
  };

  useEffect(() => {
    load();
  }, []);

  const add = () => {
    fetch("http://localhost:5000/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ DepartmentName: name }),
    }).then(() => {
      setName("");
      load();
    });
  };

  const del = (id) => {
    if (!window.confirm("Xóa phòng ban?")) return;

    fetch(`http://localhost:5000/api/departments/${id}`, {
      method: "DELETE",
    }).then(load);
  };

  return (
    <div>
      <h3>Departments</h3>

      <input
        className="form-control mb-2"
        placeholder="Department name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button className="btn btn-primary mb-3" onClick={add}>
        Add
      </button>

      <ul className="list-group">
        {data.map((d) => (
          <li key={d.DepartmentID} className="list-group-item d-flex justify-content-between">
            {d.DepartmentName}
            <button className="btn btn-danger btn-sm" onClick={() => del(d.DepartmentID)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}