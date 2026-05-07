import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="bg-light border-end" style={{ width: "220px", height: "100vh" }}>
      <div className="list-group list-group-flush">
        <Link to="/" className="list-group-item list-group-item-action">
          Employees
        </Link>

        <Link to="/employees/add" className="list-group-item list-group-item-action">
          Add Employee
        </Link>

        <Link to="/attendance" className="list-group-item list-group-item-action">
          Attendance
        </Link>

        <Link to="/attendance/add" className="list-group-item list-group-item-action">
          Add Attendance
        </Link>

        <Link to="/salaries" className="list-group-item list-group-item-action">
          Salaries2
        </Link>

        <Link to="/salaries/add" className="list-group-item list-group-item-action">
          Add Salary
        </Link>

        <Link to="/departments" className="list-group-item list-group-item-action">
          Departments
        </Link>

        <Link to="/positions" className="list-group-item list-group-item-action">
          Positions
        </Link>

        <Link to="/dashboard" className="list-group-item list-group-item-action">
          Dashboard
        </Link>

        <Link to="/alerts" className="list-group-item list-group-item-action">
          Alerts
        </Link>
        <Link to="/reports" className="list-group-item list-group-item-action">
          Reports
        </Link>
      </div>
    </div>
  );
}