import { useEffect,useState } from "react";
import { useNavigate,useParams } from "react-router-dom";
export default function EmployeeEdit(){
    const nav = useNavigate();
    const { id } = useParams();
    const [form,setForm]= useState({
        FullName: "",
        DateOfBirth:"",
        Gender:"",
        PhoneNumber:"",
        Email:"",
        HireDate:"",
        DepartmentID:"",
        PositionID:"",
        Status:"",
    });

    const [departments,setDepartments]=useState([]);
    const [positions,setPositions]=useState([]);
    const handleChange = (e) =>{
        setForm({
            ...form,
            [e.target.id]:e.target.value,
        });
    };

    const converDate = (dt)=>{
        if(!dt) return "";
        return new Date(dt)
        .toISOString()
        .substring(0,10);

    };

    const loadDropdowns = ()=>{
        fetch("http://localhost:5000/api/departments")
        .then((res)=>res.json())
        .then((data)=>setDepartments(data))
        .catch(()=> alert("khong load dc danh sach phong ban"));


        fetch("http://localhost:5000/api/positions")
        .then((res)=> res.json())
        .then((data)=> setPositions(data))
        .catch(()=> alert("khong load dc danh sach chuc vu "));
    };

    const loadEmployee = () => {
        fetch(`http://localhost:5000/api/employees/${id}`)
        .then((res)=>res.json())
        .then((data)=>{
            setForm({
                FullName: data.FullName || "" ,
                DateOfBirth: converDate(data.DateOfBirth),
                Gender:data.Gender || "",
                PhoneNumber: data.PhoneNumber||"",
                Email: data.Email||"",
                HireDate: converDate(data.HireDate),
                DepartmentID:data.DepartmentID||"",
                PositionID:data.PositionID||"",
                Status:data.Status||"Active",
            });
        })
        .catch(()=>alert("khong tai duoc du lieu nhan vien"))
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`http://localhost:5000/api/employees/${id}`,{
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(form),
        })

        .then((res)=> res.json())
        .then((rs)=>{
            alert(rs.msg);
            if(rs.status==="success"){
                nav("/");
            }
        })
        .catch(()=> alert("khong the cap nhat nhan vien"));
    };

    useEffect(()=>{
        loadDropdowns();
        loadEmployee();
    },[]);


    return(
        <div>
            <h3>Edit Employee</h3>
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
                    className="form-control mb-2"
                    value={form.Email}
                    onChange={handleChange}
                    required
                />

                <label>Hire Date</label>
                <input
                    type="date"
                    id="HireDate"
                    className="form-control mb-2"
                    value={form.HireDate}
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
                required
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
                <option value="Dang lam viec">Dang lam viec</option>
                </select>

                <button className="btn btn-primary mt-2">
                    save Change
                </button>
            </form>
        </div>
    )
}