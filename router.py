from flask import Blueprint,jsonify,request
from flask import Flask, request, jsonify
from config import get_sqlsever_connection,get_mysql_connection

router = Blueprint("router",__name__)

@router.route("/api/departments")
def get_departments():
    sql = get_sqlsever_connection()

    cur = sql.cursor()

    cur.execute("""
        SELECT DepartmentID,DepartmentName
        FROM dbo.Departments
        ORDER BY DepartmentName
    """)

    rows = [
        {"DepartmentID":r[0], "DepartmentName":r[1]}
        for r in cur.fetchall()
    ]

    return jsonify(rows)

@router.route("/api/positions")
def get_positions():
    sql = get_sqlsever_connection()
    cur = sql.cursor()
    cur.execute("""
        SELECT PositionID,PositionName
        FROM Positions
        ORDER BY PositionName
        """)
    rows = [
        {"PositionID":r[0],"PositionName":r[1]}
        for r in cur.fetchall()
    ]

    return jsonify(rows)

@router.route("/api/employees")
def get_employees():
    sql = get_sqlsever_connection()
    cur = sql.cursor()
    cur.execute("""
        SELECT e.EmployeeID,e.FullName,d.DepartmentName,p.PositionName
        FROM Employees e
        LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN Positions p ON e.PositionID = p.PositionID
        ORDER BY e.EmployeeID
     """)
    rows = []
    for r in cur.fetchall():
        rows.append({
            "EmployeeID": r[0],
            "FullName":r[1],
            "Department":r[2],
            "Position": r[3]
        })
    return jsonify(rows)

@router.route("/api/employees/<int:emp_id>")
def get_employee_detail(emp_id):
    sql = get_sqlsever_connection()
    cur = sql.cursor()

    cur.execute("""
    SELECT
        e.EmployeeID,
        e.FullName,
        e.Email,
        e.DateOfBirth,
        e.Gender,
        e.PhoneNumber,
        e.HireDate,
        e.Status,
        d.DepartmentID,
        d.DepartmentName,
        p.PositionID,
        p.PositionName
    FROM Employees e
    LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
    LEFT JOIN Positions p ON e.PositionID = p.PositionID
    WHERE EmployeeID = ?
    """, emp_id)

    r = cur.fetchone()

    if not r:
        return jsonify({"msg": "Employee not found"}),404
    
    return jsonify({
    "EmployeeID": r[0],
    "FullName": r[1],
    "Email": r[2],
    "DateOfBirth": r[3],
    "Gender": r[4],
    "PhoneNumber": r[5],
    "HireDate": r[6],
    "Status": r[7],
    "DepartmentID": r[8],
    "DepartmentName": r[9],
    "PositionID": r[10],
    "PositionName": r[11]
})


@router.route("/api/employees", methods=["POST"])
def add_employee():
    data = request.get_json()
    full_name = data.get("FullName")
    dob       = data.get("DateOfBirth")
    gender    = data.get("Gender")
    phone     = data.get("PhoneNumber")
    email     = data.get("Email")
    hire_date = data.get("HireDate")
    dept_id   = data.get("DepartmentID") or None
    pos_id    = data.get("PositionID") or None
    status    = data.get("Status") or "Active"

    sql = get_sqlsever_connection()
    cur = sql.cursor()

    cur.execute("SELECT COUNT(*) FROM Employees WHERE Email = ?", email)

    if cur.fetchone()[0]>0:
        return jsonify({"status": "error","msg":"Email da ton tai"}), 400
    
    my = get_mysql_connection()

    sql.autocommit = False
    my.start_transaction()

    try:
        cur.execute("""
            INSERT INTO Employees
            (FullName,DateOfBirth,Gender,PhoneNumber,Email,
            HireDate,DepartmentID,PositionID,Status)
            OUTPUT INSERTED.EmployeeID
            VALUES(?,?,?,?,?,?,?,?,?)
        """, (
            full_name,dob,gender,phone,email,hire_date,dept_id,pos_id,status
        ))

        row = cur.fetchone()
        new_id = int(row[0])

        my_cur = my.cursor(dictionary=True)

        my_cur.execute("""
        INSERT INTO employees_payroll
        (EmployeeID, FullName, DepartmentID, PositionID, Status)
        VALUES (%s, %s, %s, %s, %s)
        """, (
            new_id, full_name, dept_id, pos_id, status
        ))

        sql.commit()
        my.commit()

    except Exception as e :
        sql.rollback()
        my.rollback()

        return jsonify({"status":"error","msg":str(e)}),500
    
    return jsonify({
        "status":"success",
        "msg": f"Them nhan vien thanh cong (ID = {new_id})"
    })

@router.route("/api/employees/<int:emp_id>", methods=["PUT"])
def update_employee(emp_id):
    data = request.get_json()

    full_name = data.get("FullName")
    dob       = data.get("DateOfBirth")
    gender    = data.get("Gender")
    phone     = data.get("PhoneNumber")
    email     = data.get("Email")
    hire_date = data.get("HireDate")
    dept_id   = data.get("DepartmentID")

    pos_id    = data.get("PositionID")
    status    = data.get("Status")

    sql = get_sqlsever_connection()
    my = get_mysql_connection()

    sql.autocommit = False
    my.start_transaction()

    try:
        cur = sql.cursor()
        cur.execute("""
            UPDATE Employees
            SET
                FullName=?,
                DateOfBirth=?,
                Gender=?,
                PhoneNumber=?,
                Email=?,
                HireDate=?,
                DepartmentID=?,
                PositionID=?,
                Status=?
            WHERE EmployeeID=?
            """, (
                full_name,
                dob,
                gender,
                phone,
                email,
                hire_date,
                dept_id,
                pos_id,
                status,
                emp_id
        ))

        my_cur = my.cursor(dictionary=True)
        my_cur.execute("""
            UPDATE employees_payroll
            SET
                FullName=%s,
                DepartmentID=%s,
                PositionID=%s,  
                Status=%s
            WHERE EmployeeID=%s
        """, (
            full_name,
            dept_id,
            pos_id,
            status,
            emp_id
        ))
        
        sql.commit()
        my.commit()
        return jsonify({
            "status": "success",
            "msg": "cap nhat thanh cong"
        })
        

    except Exception as e:
        sql.rollback()
        my.rollback()

        return jsonify({
            "status": "error",
            "msg":str(e)
        }),500
    

@router.route("/api/employees/<int:emp_id>",methods=["DELETE"])
def delete_employee(emp_id):
    sql = get_sqlsever_connection()
    my = get_mysql_connection()

    sql.autocommit= False
    my.start_transaction()

    try:
        cur=sql.cursor()
        cur.execute("SELECT COUNT(*) FROM Dividends WHERE EmployeeID=?",emp_id)
        if cur.fetchone()[0] > 0:
            return jsonify({
                "status" : "error",
                "msg": "khong the xoa - nhan vien co Dividends"
            }),400
        
        cur.execute("DELETE FROM Employees WHERE EmployeeID=?",emp_id)

        my_cur = my.cursor(dictionary=True)
        my_cur.execute("DELETE FROM employees_payroll WHERE EmployeeID=%s",(emp_id,))
        my_cur.execute("DELETE FROM attendance WHERE EmployeeID=%s",(emp_id,))
        my_cur.execute("DELETE FROM salaries WHERE EmployeeID=%s",(emp_id,))

        sql.commit()
        my.commit()
    except Exception as e:
        sql.rollback()
        my.rollback()
        return jsonify({"status":"error","msg":str(e)}),500
    return jsonify({"status":"success", "msg":"xoa thanh cong"})

@router.route("/api/payroll-employees")
def get_payroll_employees():
    my = get_mysql_connection()
    cur = my.cursor(dictionary=True)

    cur.execute("""
        SELECT EmployeeID, FullName, Status
        FROM employees_payroll
        ORDER BY FullName
    """)
    rows = cur.fetchall()
    return jsonify(rows)

@router.route("/api/attendance")
def get_attendance():
    month = request.args.get("month")
    employee_id = request.args.get("employee_id")

    my = get_mysql_connection()
    cur = my.cursor(dictionary=True)

    sql = """
        SELECT 
            a.AttendanceID,
            a.EmployeeID,
            e.FullName,
            a.WorkDays,
            a.AbsentDays,
            a.LeaveDays,
            a.AttendanceMonth,
            a.CreatedAt
        FROM attendance a
        LEFT JOIN employees_payroll e ON a.EmployeeID = e.EmployeeID
        WHERE 1=1
    """
    params = []

    if month:
        sql += " AND DATE_FORMAT(a.AttendanceMonth, '%Y-%m') = %s"
        params.append(month)

    if employee_id:
        sql += " AND a.EmployeeID = %s"
        params.append(employee_id)

    sql += " ORDER BY a.AttendanceMonth DESC, a.EmployeeID ASC"

    cur.execute(sql, tuple(params))
    rows = cur.fetchall()
    return jsonify(rows)

@router.route("/api/attendance/<int:att_id>")
def get_attendance_detail(att_id):
    my = get_mysql_connection()
    cur = my.cursor(dictionary=True)

    cur.execute("""
        SELECT 
            AttendanceID,
            EmployeeID,
            WorkDays,
            AbsentDays,
            LeaveDays,
            AttendanceMonth,
            CreatedAt
        FROM attendance
        WHERE AttendanceID = %s
    """, (att_id,))

    row = cur.fetchone()
    if not row:
        return jsonify({"msg": "Attendance not found"}), 404

    return jsonify(row)

@router.route("/api/attendance", methods=["POST"])
def add_attendance():
    data = request.get_json()

    employee_id = data.get("EmployeeID")
    work_days = int(data.get("WorkDays", 0))
    absent_days = int(data.get("AbsentDays", 0))
    leave_days = int(data.get("LeaveDays", 0))
    attendance_month = data.get("AttendanceMonth")

    if not employee_id or not attendance_month:
        return jsonify({"status": "error", "msg": "Thiếu dữ liệu bắt buộc"}), 400

    if work_days < 0 or absent_days < 0 or leave_days < 0:
        return jsonify({"status": "error", "msg": "Số ngày không được âm"}), 400

    if work_days + absent_days + leave_days > 31:
        return jsonify({"status": "error", "msg": "Tổng số ngày không hợp lệ"}), 400

    my = get_mysql_connection()
    cur = my.cursor(dictionary=True)

    cur.execute("""
        SELECT COUNT(*) AS total
        FROM attendance
        WHERE EmployeeID = %s
          AND DATE_FORMAT(AttendanceMonth, '%Y-%m') = %s
    """, (employee_id, attendance_month))

    existed = cur.fetchone()["total"]
    if existed > 0:
        return jsonify({
            "status": "error",
            "msg": "Nhân viên đã có chấm công trong tháng này"
        }), 400

    try:
        cur.execute("""
            INSERT INTO attendance (
                EmployeeID,
                WorkDays,
                AbsentDays,
                LeaveDays,
                AttendanceMonth
            )
            VALUES (%s, %s, %s, %s, %s)
        """, (
            employee_id,
            work_days,
            absent_days,
            leave_days,
            attendance_month + "-01"
        ))
        my.commit()

        return jsonify({
            "status": "success",
            "msg": "Thêm chấm công thành công"
        })
    except Exception as e:
        my.rollback()
        return jsonify({
            "status": "error",
            "msg": str(e)
        }), 500
    
@router.route("/api/attendance/<int:att_id>", methods=["PUT"])
def update_attendance(att_id):
    data = request.get_json()

    employee_id = data.get("EmployeeID")
    work_days = int(data.get("WorkDays", 0))
    absent_days = int(data.get("AbsentDays", 0))
    leave_days = int(data.get("LeaveDays", 0))
    attendance_month = data.get("AttendanceMonth")

    if not employee_id or not attendance_month:
        return jsonify({"status": "error", "msg": "Thiếu dữ liệu bắt buộc"}), 400

    if work_days < 0 or absent_days < 0 or leave_days < 0:
        return jsonify({"status": "error", "msg": "Số ngày không được âm"}), 400

    if work_days + absent_days + leave_days > 31:
        return jsonify({"status": "error", "msg": "Tổng số ngày không hợp lệ"}), 400

    my = get_mysql_connection()
    cur = my.cursor(dictionary=True)

    cur.execute("""
        SELECT COUNT(*) AS total
        FROM attendance
        WHERE EmployeeID = %s
          AND DATE_FORMAT(AttendanceMonth, '%Y-%m') = %s
          AND AttendanceID <> %s
    """, (employee_id, attendance_month, att_id))

    existed = cur.fetchone()["total"]
    if existed > 0:
        return jsonify({
            "status": "error",
            "msg": "Nhân viên đã có chấm công trong tháng này"
        }), 400

    try:
        cur.execute("""
            UPDATE attendance
            SET
                EmployeeID = %s,
                WorkDays = %s,
                AbsentDays = %s,
                LeaveDays = %s,
                AttendanceMonth = %s
            WHERE AttendanceID = %s
        """, (
            employee_id,
            work_days,
            absent_days,
            leave_days,
            attendance_month + "-01",
            att_id
        ))
        my.commit()

        return jsonify({
            "status": "success",
            "msg": "Cập nhật chấm công thành công"
        })
    except Exception as e:
        my.rollback()
        return jsonify({
            "status": "error",
            "msg": str(e)
        }), 500

@router.route("/api/attendance/<int:att_id>", methods=["DELETE"])
def delete_attendance(att_id):
    my = get_mysql_connection()
    cur = my.cursor(dictionary=True)

    try:
        cur.execute("DELETE FROM attendance WHERE AttendanceID = %s", (att_id,))
        my.commit()

        return jsonify({
            "status": "success",
            "msg": "Xóa chấm công thành công"
        })
    except Exception as e:
        my.rollback()
        return jsonify({
            "status": "error",
            "msg": str(e)
        }), 500


@router.route("/api/salaries")
def get_salaries():
    my = get_mysql_connection()
    cur = my.cursor(dictionary=True)

    cur.execute("""
        SELECT 
            s.SalaryID,
            s.EmployeeID,
            e.FullName,
            s.SalaryMonth,
            s.BaseSalary,
            s.Bonus,
            s.Deductions,
            s.NetSalary,
            s.CreatedAt
        FROM salaries s
        LEFT JOIN employees_payroll e ON s.EmployeeID = e.EmployeeID
        ORDER BY s.SalaryID DESC
    """)

    return jsonify(cur.fetchall())

@router.route("/api/salaries/<int:salary_id>")
def get_salary_detail(salary_id):
    my = get_mysql_connection()
    cur = my.cursor(dictionary=True)

    cur.execute("""
        SELECT *
        FROM salaries
        WHERE SalaryID = %s
    """, (salary_id,))

    row = cur.fetchone()

    if not row:
        return jsonify({"status": "error", "msg": "Không tìm thấy bảng lương"}), 404

    return jsonify(row)

@router.route("/api/salaries", methods=["POST"])
def add_salary():
    data = request.get_json()

    employee_id = data.get("EmployeeID")
    salary_month = data.get("SalaryMonth")
    base_salary = float(data.get("BaseSalary") or 0)
    bonus = float(data.get("Bonus") or 0)
    deductions = float(data.get("Deductions") or 0)

    net_salary = base_salary + bonus - deductions

    my = get_mysql_connection()
    cur = my.cursor(dictionary=True)

    try:
        cur.execute("""
            INSERT INTO salaries
            (EmployeeID, SalaryMonth, BaseSalary, Bonus, Deductions, NetSalary)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            employee_id,
            salary_month,
            base_salary,
            bonus,
            deductions,
            net_salary
        ))

        my.commit()

        return jsonify({
            "status": "success",
            "msg": "Thêm bảng lương thành công"
        })

    except Exception as e:
        my.rollback()
        return jsonify({
            "status": "error",
            "msg": str(e)
        }), 500
    
@router.route("/api/salaries/<int:salary_id>", methods=["PUT"])
def update_salary(salary_id):
    data = request.get_json()

    employee_id = data.get("EmployeeID")
    salary_month = data.get("SalaryMonth")
    base_salary = float(data.get("BaseSalary") or 0)
    bonus = float(data.get("Bonus") or 0)
    deductions = float(data.get("Deductions") or 0)

    net_salary = base_salary + bonus - deductions

    my = get_mysql_connection()
    cur = my.cursor(dictionary=True)

    try:
        cur.execute("""
            UPDATE salaries
            SET 
                EmployeeID = %s,
                SalaryMonth = %s,
                BaseSalary = %s,
                Bonus = %s,
                Deductions = %s,
                NetSalary = %s
            WHERE SalaryID = %s
        """, (
            employee_id,
            salary_month,
            base_salary,
            bonus,
            deductions,
            net_salary,
            salary_id
        ))

        my.commit()

        return jsonify({
            "status": "success",
            "msg": "Cập nhật lương thành công"
        })

    except Exception as e:
        my.rollback()
        return jsonify({
            "status": "error",
            "msg": str(e)
        }), 500
    
@router.route("/api/salaries/<int:salary_id>", methods=["DELETE"])
def delete_salary(salary_id):
    my = get_mysql_connection()
    cur = my.cursor(dictionary=True)

    try:
        cur.execute("DELETE FROM salaries WHERE SalaryID = %s", (salary_id,))
        my.commit()

        return jsonify({
            "status": "success",
            "msg": "Xóa bảng lương thành công"
        })

    except Exception as e:
        my.rollback()
        return jsonify({
            "status": "error",
            "msg": str(e)
        }), 500
    
@router.route("/api/departments", methods=["POST"])
def add_department():
    data = request.get_json()
    name = data.get("DepartmentName")

    sql = get_sqlsever_connection()
    cur = sql.cursor()

    try:
        cur.execute("""
            INSERT INTO Departments (DepartmentName)
            VALUES (?)
        """, name)

        sql.commit()

        return jsonify({"status": "success", "msg": "Thêm phòng ban thành công"})
    except Exception as e:
        sql.rollback()
        return jsonify({"status": "error", "msg": str(e)}), 500
    
@router.route("/api/departments/<int:id>", methods=["PUT"])
def update_department(id):
    data = request.get_json()
    name = data.get("DepartmentName")

    sql = get_sqlsever_connection()
    cur = sql.cursor()

    try:
        cur.execute("""
            UPDATE Departments
            SET DepartmentName = ?
            WHERE DepartmentID = ?
        """, (name, id))

        sql.commit()

        return jsonify({"status": "success", "msg": "Cập nhật thành công"})
    except Exception as e:
        sql.rollback()
        return jsonify({"status": "error", "msg": str(e)}), 500
    
@router.route("/api/departments/<int:id>", methods=["DELETE"])
def delete_department(id):
    sql = get_sqlsever_connection()
    cur = sql.cursor()

    try:
        # Check nếu có nhân viên
        cur.execute("SELECT COUNT(*) FROM Employees WHERE DepartmentID = ?", id)
        if cur.fetchone()[0] > 0:
            return jsonify({
                "status": "error",
                "msg": "Không thể xoá – phòng ban đang có nhân viên"
            }), 400

        cur.execute("DELETE FROM Departments WHERE DepartmentID = ?", id)
        sql.commit()

        return jsonify({"status": "success", "msg": "Xóa thành công"})
    except Exception as e:
        sql.rollback()
        return jsonify({"status": "error", "msg": str(e)}), 500
    

@router.route("/api/positions", methods=["POST"])
def add_position():
    data = request.get_json()
    name = data.get("PositionName")

    sql = get_sqlsever_connection()
    cur = sql.cursor()

    try:
        cur.execute("""
            INSERT INTO Positions (PositionName)
            VALUES (?)
        """, name)

        sql.commit()

        return jsonify({"status": "success", "msg": "Thêm chuc vu thành công"})
    except Exception as e:
        sql.rollback()
        return jsonify({"status": "error", "msg": str(e)}), 500
    

@router.route("/api/positions/<int:id>", methods=["PUT"])
def update_position(id):
    data = request.get_json()
    name = data.get("PositionName")

    sql = get_sqlsever_connection()
    cur = sql.cursor()

    try:
        cur.execute("""
            UPDATE Positions
            SET PositionName = ?
            WHERE PositionID = ?
        """, (name, id))

        sql.commit()

        return jsonify({"status": "success", "msg": "Cập nhật thành công"})
    except Exception as e:
        sql.rollback()
        return jsonify({"status": "error", "msg": str(e)}), 500
    
    
@router.route("/api/positions/<int:id>", methods=["DELETE"])
def delete_position(id):
    sql = get_sqlsever_connection()
    cur = sql.cursor()

    try:
        # Check nếu có nhân viên
        cur.execute("SELECT COUNT(*) FROM Employees WHERE PositionID = ?", id)
        if cur.fetchone()[0] > 0:
            return jsonify({
                "status": "error",
                "msg": "Không thể xoá – vi tri đang có nhân viên"
            }), 400

        cur.execute("DELETE FROM Positions WHERE PositionID = ?", id)
        sql.commit()

        return jsonify({"status": "success", "msg": "Xóa thành công"})
    except Exception as e:
        sql.rollback()
        return jsonify({"status": "error", "msg": str(e)}), 500

@router.route("/api/dashboard")
def get_dashboard():
    sql = get_sqlsever_connection()
    my = get_mysql_connection()

    sql_cur = sql.cursor()
    my_cur = my.cursor(dictionary=True)

    # Tổng nhân viên
    sql_cur.execute("SELECT COUNT(*) FROM Employees")
    total_employees = sql_cur.fetchone()[0]

    # Tổng phòng ban
    sql_cur.execute("SELECT COUNT(*) FROM Departments")
    total_departments = sql_cur.fetchone()[0]

    # Tổng chức vụ
    sql_cur.execute("SELECT COUNT(*) FROM Positions")
    total_positions = sql_cur.fetchone()[0]

    # Tổng bảng lương
    my_cur.execute("SELECT COUNT(*) AS total FROM salaries")
    total_salaries = my_cur.fetchone()["total"]

    # Tổng lương đã trả
    my_cur.execute("SELECT IFNULL(SUM(NetSalary), 0) AS total FROM salaries")
    total_payroll = my_cur.fetchone()["total"]

    # Tổng ngày công
    my_cur.execute("SELECT IFNULL(SUM(WorkDays), 0) AS total FROM attendance")
    total_workdays = my_cur.fetchone()["total"]

    # Tổng ngày nghỉ
    my_cur.execute("SELECT IFNULL(SUM(AbsentDays), 0) AS total FROM attendance")
    total_absentdays = my_cur.fetchone()["total"]

    return jsonify({
        "totalEmployees": total_employees,
        "totalDepartments": total_departments,
        "totalPositions": total_positions,
        "totalSalaries": total_salaries,
        "totalPayroll": float(total_payroll),
        "totalWorkDays": int(total_workdays),
        "totalAbsentDays": int(total_absentdays)
    })

@router.route("/api/alerts")
def get_alerts():
    my = get_mysql_connection()
    cur = my.cursor(dictionary=True)

    alerts = []

    cur.execute("""
        SELECT e.FullName, a.AbsentDays
        FROM attendance a
        JOIN employees_payroll e ON a.EmployeeID = e.EmployeeID
        WHERE a.AbsentDays >= 3
    """)
    for row in cur.fetchall():
        alerts.append({
            "type": "ABSENT",
            "message": f"{row['FullName']} nghỉ {row['AbsentDays']} ngày"
        })

    cur.execute("""
        SELECT e.FullName
        FROM employees_payroll e
        WHERE e.EmployeeID NOT IN (
            SELECT EmployeeID FROM attendance
        )
    """)
    for row in cur.fetchall():
        alerts.append({
            "type": "NO_ATTENDANCE",
            "message": f"{row['FullName']} chưa có chấm công"
        })

    cur.execute("""
        SELECT e.FullName, s.NetSalary
        FROM salaries s
        JOIN employees_payroll e ON s.EmployeeID = e.EmployeeID
        WHERE s.NetSalary < 1000000
    """)
    for row in cur.fetchall():
        alerts.append({
            "type": "LOW_SALARY",
            "message": f"{row['FullName']} có lương thấp: {row['NetSalary']}"
        })

    return jsonify(alerts)

@router.route("/api/reports/hr")
def report_hr():
    sql = get_sqlsever_connection()
    cur = sql.cursor()

    cur.execute("""
        SELECT 
            e.EmployeeID,
            e.FullName,
            d.DepartmentName,
            p.PositionName,
            e.Status
        FROM Employees e
        LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN Positions p ON e.PositionID = p.PositionID
        ORDER BY e.EmployeeID
    """)

    rows = []
    for r in cur.fetchall():
        rows.append({
            "EmployeeID": r[0],
            "FullName": r[1],
            "Department": r[2],
            "Position": r[3],
            "Status": r[4]
        })

    return jsonify(rows)

@router.route("/api/reports/payroll")
def report_payroll():
    my = get_mysql_connection()
    cur = my.cursor(dictionary=True)

    cur.execute("""
        SELECT 
            e.FullName,
            s.SalaryMonth,
            s.BaseSalary,
            s.Bonus,
            s.Deductions,
            s.NetSalary
        FROM salaries s
        JOIN employees_payroll e ON s.EmployeeID = e.EmployeeID
        ORDER BY s.SalaryMonth DESC
    """)

    return jsonify(cur.fetchall())

@router.route("/api/reports/attendance")
def report_attendance():
    my = get_mysql_connection()
    cur = my.cursor(dictionary=True)

    cur.execute("""
        SELECT 
            e.FullName,
            a.AttendanceMonth,
            a.WorkDays,
            a.AbsentDays,
            a.LeaveDays
        FROM attendance a
        JOIN employees_payroll e ON a.EmployeeID = e.EmployeeID
        ORDER BY a.AttendanceMonth DESC
    """)

    return jsonify(cur.fetchall())

@router.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if username == "admin" and password == "123456":
        return jsonify({
            "success": True,
            "username": "admin"
        })

    return jsonify({
        "success": False,
        "message": "Sai tài khoản hoặc mật khẩu"
    }), 401