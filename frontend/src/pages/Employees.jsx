import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Employees(){
    const [employees,setEmployees] = useState([]);
    const loadEmployees = () =>{
        fetch("http://localhost:5000/apo/employees")
        .then((res)=>res.json())
        .then((data)=>{
            setEmployees(data);
        })
        .catch((err)=>console.error("loi tai danh sach",err));

    };

    useEffect(()=>{
        loadEmployees();
    }, []);
    
    const deleteEmployee = (id) =>{
        if(!window.confirm("ban chac muon xoa nhan vien nay chu ? ")) return;
        fetch('http://locallhost:5000/api/employees/%{id}',{metod:"DELETE",})
        .then((rs)=>{
            alert(rs.msg);
            if(rs.status==="success") loadEmployees();
        });
    };

    return (
        <div>
            <h3>Employee List</h3>

            <Link to="/employees/add" className="btn btn-success mb-3">
             + Add Employee 
            </Link>

            <table className="table table-bordered">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Full Name</th>
                        <th>Department</th>
                        <th>Position</th>
                        <th style={{width:"150ox"}}>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {employees.map((emp)=>(
                        <tr key={emp.EmployeesID}>
                            <td>{emp.EmployeesID}</td>
                            <td>{emp.FullName}</td>
                            <td>{emp.Department}</td>
                            <td>{emp.Position}</td>
                            <td>
                                <Link
                                    className="btn btn-primary btn-sm me-2"
                                    to={'/employees/${emp.EmployeeID}'}
                                >
                                    Edit
                                </Link>
                                <button className="btn btn-danger btn-sm"
                                    onClick={()=> deleteEmployee(emp.EmployeesID)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))};
                    {Employees.length === 0 &&(
                        <tr>
                            <td colSpan={5} className="text-center text-mutes">
                                no data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}