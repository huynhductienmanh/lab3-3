import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SalaryAdd() {
  const nav = useNavigate();

  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    EmployeeID: "",
    SalaryMonth: "",
    BaseSalary: "",
    Bonus: 0,
    Deductions: 0,
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const loadEmployees = () => {
    fetch("http://localhost:5000/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data));
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/api/salaries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((rs) => {
        alert(rs.msg);
        if (rs.status === "success") {
          nav("/salaries");
        }
      });
  };

  const netSalary =
    Number(form.BaseSalary || 0) +
    Number(form.Bonus || 0) -
    Number(form.Deductions || 0);

  return (
    <div>
      <h3>Add Salary</h3>

      <form onSubmit={handleSubmit} className="card p-4 mt-3">
        <label>Employee</label>
        <select
          id="EmployeeID"
          className="form-control mb-2"
          value={form.EmployeeID}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Employee --</option>
          {employees.map((e) => (
            <option key={e.EmployeeID} value={e.EmployeeID}>
              {e.FullName}
            </option>
          ))}
        </select>

        <label>Salary Month</label>
        <input
          type="date"
          id="SalaryMonth"
          className="form-control mb-2"
          value={form.SalaryMonth}
          onChange={handleChange}
          required
        />

        <label>Base Salary</label>
        <input
          type="number"
          id="BaseSalary"
          className="form-control mb-2"
          value={form.BaseSalary}
          onChange={handleChange}
          required
        />

        <label>Bonus</label>
        <input
          type="number"
          id="Bonus"
          className="form-control mb-2"
          value={form.Bonus}
          onChange={handleChange}
        />

        <label>Deductions</label>
        <input
          type="number"
          id="Deductions"
          className="form-control mb-2"
          value={form.Deductions}
          onChange={handleChange}
        />

        <div className="alert alert-info mt-2">
          Net Salary: {netSalary.toLocaleString("vi-VN")} VNĐ
        </div>

        <button className="btn btn-primary mt-2">Add Salary</button>
      </form>
    </div>
  );
}