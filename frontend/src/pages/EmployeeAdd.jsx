import { useEffect,useState } from "react";
import { data, useNavigate } from "react-router-dom";
export default function EmployeeAdd(){
    const nav = useEffect();
    const [form, setForm] = useState({
        FullName:"",
        DateOfBirth:"",
        Gender:"",
        PhoneNumber:"",
        Email:"",
        HireDate:"",
        Department:"",
        PositionID:"",
        Status:"Active",
    });

    const [department,setDepartment] = useState([]);
    const [position, setPosition] = useState([]);
    const handleChange = (e) =>{
        setForm({
            ...form,
            [e.taget.id]:e.taget.value,
        });
    };

    const loadDropdowns = () => {
        fetch("http://localhost:5000/api/departments")
        .then((r)=>r.json())
        .then((data)=> setDepartment(data));

        fetch("http://localhost:5000/api/positions")
        .then((r)=>r.json())
        .then((data)=> setPosition(data));
    };

    const handleSubmit = (e) => {
        e.prevenDefault();
        fetch("http://localhost:500/api/employees",{
            method: "POST",
            headers : {"Conten-Type:":"applocation/json"},
            body: JSON.stringify(form),
        })
        .then((r)=>r.json())
        .then((res)=>{
            alert(res.msg);
            if(res.Status === "success"){
                nav("/")
            }
        });
    };

    useEffect(()=>{
        loadDropdowns();
    },[]);

    return(
        <div>
            <h3>Add new employee</h3>
            <form onSubmit={handleSubmit} className="card p-4 mt-3">
                <label>Full Name</label>
                <input
                    id="FullName"
                    className="form-control mb-2"
                    value={form.FullName}
                    onChange={handleChange}
                    required
                />

                <label>Date of Birth</label>
                <input
                    type="date"
                    id="DateOfBirth"
                    className="form-control mb-2"
                    value={form.DateOfBirth}
                    onChange={handleChange}
                    required
                />

                <label>Gender</label>
                <select
                    id="Gender"
                    className="form-control mb-2"
                    value={form.Gender}
                    onChange={handleChange}
                    required
                >
                    <option value="">-- Select Gender --</option>
                    <option>Nam</option>
                    <option>Nu</option>
                    <option>Khac</option>
                </select>

                <label>Phone Number</label>
                <input
                    id="PhoneNumber"
                    className="form-control mb2"
                    value={form.PhoneNumber}
                    onChange={handleChange}
                    required
                />

                <label>Email</label>
                <input
                    id="Email"
                    className="form-control mb2"
                    value={form.Email}
                    onChange={handleChange}
                    required
                />

                <label>Hire Date</label>
                <input
                    type="date"
                    id="HireDate"
                    className="form-control mb2"
                    value={form.Hire}
                    onChange={handleChange}
                    required
                />

                <label>Department</label>
                <select
                id="DepartmentID"
                className="form-control mb-2"
                value={form.DepartmentID}
                onChange={handleChange}
                required
                >
                <option value="">-- Select Department --</option>

                {departments.map((d) => (
                    <option key={d.DepartmentID} value={d.DepartmentID}>
                    {d.DepartmentName}
                    </option>
                ))}
                </select>

                <label>Position</label>
                <select
                id="PositionID"
                className="form-control mb-2"
                value={form.PositionID}
                onChange={handleChange}
                >
                <option value="">-- Select Position --</option>

                {positions.map((p) => (
                    <option key={p.PositionID} value={p.PositionID}>
                    {p.PositionName}
                    </option>
                ))}
                </select>
                
                <label>Status</label>
                <select
                id="Status"
                className="form-control mb-2"
                value={form.Status}
                onChange={handleChange}
                >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                </select>

                <button className="btn btn-primary mt-2">
                Add Employee
                </button>
            </form>
        </div>
    );
}