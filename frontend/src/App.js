import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Employees from "./pages/Employees";
import EmployeeAdd from "./pages/EmployeeAdd";
import EmployeeEdit from "./pages/EmployeeEdit";

import Attendance from "./pages/Attendance";
import AttendanceAdd from "./pages/AttendanceAdd";
import AttendanceEdit from "./pages/AttendanceEdit";

import Salaries from "./pages/Salaries";
import SalaryAdd from "./pages/SalaryAdd";
import SalaryEdit from "./pages/SalaryEdit";

import Departments from "./pages/Departments";
import Positions from "./pages/Positions";

import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";

import Reports from "./pages/Reports";
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Employees />} />
          <Route path="/employees/add" element={<EmployeeAdd />} />
          <Route path="/employees/:id" element={<EmployeeEdit />} />

          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance/add" element={<AttendanceAdd />} />
          <Route path="/attendance/:id" element={<AttendanceEdit />} />

          <Route path="/salaries" element={<Salaries />} />
          <Route path="/salaries/add" element={<SalaryAdd />} />
          <Route path="/salaries/:id" element={<SalaryEdit />} />

          <Route path="/departments" element={<Departments />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;