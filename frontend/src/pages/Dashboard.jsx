import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Dashboard error:", err));
  }, []);

  const money = (value) => {
    return Number(value || 0).toLocaleString("vi-VN") + " VNĐ";
  };

  if (!data) {
    return <h4>Loading dashboard...</h4>;
  }

    const attendanceChart = {
    labels: ["Work Days", "Absent Days"],
    datasets: [
        {
        label: "Attendance",
        data: [data.totalWorkDays, data.totalAbsentDays],
        backgroundColor: [
            "#198754", // xanh lá (work)
            "#dc3545", // đỏ (absent)
        ],
        },
    ],
    };

 const overviewChart = {
  labels: ["Employees", "Departments", "Positions", "Salary Records"],
  datasets: [
    {
      label: "Overview",
      data: [
        data.totalEmployees,
        data.totalDepartments,
        data.totalPositions,
        data.totalSalaries,
      ],
      backgroundColor: [
        "#0d6efd",   // xanh dương
        "#198754",   // xanh lá
        "#ffc107",   // vàng
        "#dc3545",   // đỏ
      ],
    },
  ],
};

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div>
      <h3 className="mb-4">Dashboard Overview</h3>

      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="card p-3 shadow-sm">
            <h6>Total Employees</h6>
            <h3>{data.totalEmployees}</h3>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card p-3 shadow-sm">
            <h6>Departments</h6>
            <h3>{data.totalDepartments}</h3>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card p-3 shadow-sm">
            <h6>Positions</h6>
            <h3>{data.totalPositions}</h3>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card p-3 shadow-sm">
            <h6>Salary Records</h6>
            <h3>{data.totalSalaries}</h3>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card p-3 shadow-sm">
            <h6>Total Payroll</h6>
            <h3>{money(data.totalPayroll)}</h3>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card p-3 shadow-sm">
            <h6>Total Work Days</h6>
            <h3>{data.totalWorkDays}</h3>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card p-3 shadow-sm">
            <h6>Total Absent Days</h6>
            <h3>{data.totalAbsentDays}</h3>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6 mb-3">
          <div className="card p-3 shadow-sm">
            <h5>Overview Chart</h5>
            <div style={{ height: "300px" }}>
              <Bar data={overviewChart} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card p-3 shadow-sm">
            <h5>Attendance Chart</h5>
            <div style={{ height: "300px" }}>
              <Pie data={attendanceChart} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}