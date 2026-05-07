import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AttendanceAdd() {
  const nav = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    EmployeeID: "",
    WorkDays: 0,
    AbsentDays: 0,
    LeaveDays: 0,
    AttendanceMonth: "",
  });

  const loadEmployees = () => {
    fetch("http://localhost:5000/api/payroll-employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch(() => alert("Không tải được danh sách nhân viên"));
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((rs) => {
        alert(rs.msg);
        if (rs.status === "success") {
          nav("/attendance");
        }
      })
      .catch(() => alert("Không thể thêm chấm công"));
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <div>
      <h3>Add Attendance</h3>

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
          {employees.map((emp) => (
            <option key={emp.EmployeeID} value={emp.EmployeeID}>
              {emp.FullName}
            </option>
          ))}
        </select>

        <label>Attendance Month</label>
        <input
          type="month"
          id="AttendanceMonth"
          className="form-control mb-2"
          value={form.AttendanceMonth}
          onChange={handleChange}
          required
        />

        <label>Work Days</label>
        <input
          type="number"
          id="WorkDays"
          className="form-control mb-2"
          value={form.WorkDays}
          onChange={handleChange}
          min="0"
          required
        />

        <label>Absent Days</label>
        <input
          type="number"
          id="AbsentDays"
          className="form-control mb-2"
          value={form.AbsentDays}
          onChange={handleChange}
          min="0"
          required
        />

        <label>Leave Days</label>
        <input
          type="number"
          id="LeaveDays"
          className="form-control mb-2"
          value={form.LeaveDays}
          onChange={handleChange}
          min="0"
          required
        />

        <button className="btn btn-primary mt-2">Add Attendance</button>
      </form>
    </div>
  );
}