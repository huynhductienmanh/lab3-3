import { useEffect, useState } from "react";

export default function Reports() {
  const [hr, setHr] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/reports/hr")
      .then((r) => r.json())
      .then(setHr);

    fetch("http://localhost:5000/api/reports/payroll")
      .then((r) => r.json())
      .then(setPayroll);

    fetch("http://localhost:5000/api/reports/attendance")
      .then((r) => r.json())
      .then(setAttendance);
  }, []);

  const money = (v) => Number(v || 0).toLocaleString("vi-VN");

  return (
    <div>
      <h3 className="mb-4">Reports</h3>

      {/* HR */}
      <h5>HR Report</h5>
      <table className="table table-bordered mb-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Position</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {hr.map((e) => (
            <tr key={e.EmployeeID}>
              <td>{e.EmployeeID}</td>
              <td>{e.FullName}</td>
              <td>{e.Department}</td>
              <td>{e.Position}</td>
              <td>{e.Status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payroll */}
      <h5>Payroll Report</h5>
      <table className="table table-bordered mb-4">
        <thead>
          <tr>
            <th>Name</th>
            <th>Month</th>
            <th>Base</th>
            <th>Bonus</th>
            <th>Deductions</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody>
          {payroll.map((p, i) => (
            <tr key={i}>
              <td>{p.FullName}</td>
              <td>{p.SalaryMonth}</td>
              <td>{money(p.BaseSalary)}</td>
              <td>{money(p.Bonus)}</td>
              <td>{money(p.Deductions)}</td>
              <td>{money(p.NetSalary)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Attendance */}
      <h5>Attendance Report</h5>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Month</th>
            <th>Work</th>
            <th>Absent</th>
            <th>Leave</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((a, i) => (
            <tr key={i}>
              <td>{a.FullName}</td>
              <td>{a.AttendanceMonth}</td>
              <td>{a.WorkDays}</td>
              <td>{a.AbsentDays}</td>
              <td>{a.LeaveDays}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}