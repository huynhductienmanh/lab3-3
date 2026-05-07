import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [month, setMonth] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const loadEmployees = () => {
    fetch("http://localhost:5000/api/payroll-employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Lỗi tải nhân viên:", err));
  };

  const loadAttendance = () => {
    let url = "http://localhost:5000/api/attendance";
    const params = new URLSearchParams();

    if (month) params.append("month", month);
    if (employeeId) params.append("employee_id", employeeId);

    if (params.toString()) {
      url += "?" + params.toString();
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => setAttendance(data))
      .catch((err) => console.error("Lỗi tải chấm công:", err));
  };

  const deleteAttendance = (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bản ghi chấm công này?")) return;

    fetch(`http://localhost:5000/api/attendance/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((rs) => {
        alert(rs.msg);
        if (rs.status === "success") loadAttendance();
      });
  };

  const formatMonth = (value) => {
    if (!value) return "";
    return new Date(value).toISOString().substring(0, 7);
  };

  useEffect(() => {
    loadEmployees();
    loadAttendance();
  }, []);

  return (
    <div>
      <h3>Attendance Management</h3>

      <div className="card p-3 mb-3">
        <div className="row">
          <div className="col-md-3">
            <label>Filter by Month</label>
            <input
              type="month"
              className={`form-control ${!month ? "text-muted" : ""}`}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label>Filter by Employee</label>
            <select
              className="form-control"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">-- All Employees --</option>
              {employees.map((emp) => (
                <option key={emp.EmployeeID} value={emp.EmployeeID}>
                  {emp.FullName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-5 d-flex align-items-end gap-2">
            <button className="btn btn-primary" onClick={loadAttendance}>
              Search
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setMonth("");
                setEmployeeId("");
                setTimeout(loadAttendance, 0);
              }}
            >
              Reset
            </button>
            <Link to="/attendance/add" className="btn btn-success">
              + Add Attendance
            </Link>
          </div>
        </div>
      </div>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Employee ID</th>
            <th>Full Name</th>
            <th>Work Days</th>
            <th>Absent Days</th>
            <th>Leave Days</th>
            <th>Month</th>
            <th style={{ width: "150px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((item) => (
            <tr key={item.AttendanceID}>
              <td>{item.AttendanceID}</td>
              <td>{item.EmployeeID}</td>
              <td>{item.FullName}</td>
              <td>{item.WorkDays}</td>
              <td>{item.AbsentDays}</td>
              <td>{item.LeaveDays}</td>
              <td>{formatMonth(item.AttendanceMonth)}</td>
              <td>
                <Link
                  className="btn btn-primary btn-sm me-2"
                  to={`/attendance/${item.AttendanceID}`}
                >
                  Edit
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteAttendance(item.AttendanceID)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {attendance.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center text-muted">
                No attendance data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}