import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Salaries() {
  const [salaries, setSalaries] = useState([]);

  const loadSalaries = () => {
    fetch("http://localhost:5000/api/salaries")
      .then((res) => res.json())
      .then((data) => setSalaries(data))
      .catch((err) => console.error("Lỗi tải lương:", err));
  };

  useEffect(() => {
    loadSalaries();
  }, []);

  const deleteSalary = (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bảng lương này?")) return;

    fetch(`http://localhost:5000/api/salaries/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((rs) => {
        alert(rs.msg);
        if (rs.status === "success") loadSalaries();
      });
  };

  const formatMoney = (value) => {
    return Number(value).toLocaleString("vi-VN") + " VNĐ";
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().substring(0, 10);
  };

  return (
    <div>
      <h3>Salary List</h3>

      <Link to="/salaries/add" className="btn btn-success mb-3">
        + Add Salary
      </Link>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Employee</th>
            <th>Month</th>
            <th>Base Salary</th>
            <th>Bonus</th>
            <th>Deductions</th>
            <th>Net Salary</th>
            <th style={{ width: "150px" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {salaries.map((s) => (
            <tr key={s.SalaryID}>
              <td>{s.SalaryID}</td>
              <td>{s.FullName}</td>
              <td>{formatDate(s.SalaryMonth)}</td>
              <td>{formatMoney(s.BaseSalary)}</td>
              <td>{formatMoney(s.Bonus)}</td>
              <td>{formatMoney(s.Deductions)}</td>
              <td>{formatMoney(s.NetSalary)}</td>
              <td>
                <Link
                  to={`/salaries/${s.SalaryID}`}
                  className="btn btn-primary btn-sm me-2"
                >
                  Edit
                </Link>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteSalary(s.SalaryID)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {salaries.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center text-muted">
                No salary data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}