from flask import Blueprint,jsonify,request
from config import get_sqlsever_connection,get_mysql_connection

router = Blueprint("router,__name__")

@router.route("/api/departments")
def get_departments():
    sql = get_sqlsever_connection()

    cur = sql.cursor

    cur.excute("""
        SELECT DepartmentID,DepartmentName
        FROM Departments
        ORDER BY DepartmentName
    """)

    rows = [
        {"DepartmentID":r[0], "DepartmentName":r[1]}
        for r in cur.fetchall()
    ]

    return jsonify(rows)

@router.route("/api/positions")
def get_position():
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
        LEFT JOIN Departnments d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN Positions p ON e.PositionID = p.PositionID
        ORDER BY e.EmployeeID
     """)
    rows = []
    for r in cur.fetchall():
        rows.append({
            "EmployeeID": r[0],
            "FullName":r[1],
            "Department":[2],
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
            HireDate,DepartmentID,PositionID,Satus)
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

router.route("/api/employees/<int:em_id", methods=["PUT"])
def update_employee(em_id):
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
                em_id
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
            em_id
        ))
        
        sql.commit()
        my.commit()

    except Exception as e:
        sql.rollback()
        my.rollback()

        return jsonify({
            "status": "error",
            "msg":str(e)
        }),500
    

@router.route("/api/employees/<int:emp_id>",methods=["DELETE"])
def delete_employee(em_id):
    sql = get_sqlsever_connection()
    my = get_mysql_connection()

    sql.autocommit= False
    my.start_transaction()

    try:
        cur=sql.cursor()
        cur.execute("SELECT COUNT(*) FROM Dividends WHERE EmployeeID=?",em_id)
        if cur.fetchone()[0] > 0:
            return jsonify({
                "status" : "error",
                "msg": "khong the xoa - nhan vien co Dividends"
            }),400
        
        cur.execute("DELETE FROM Employees WHERE EmployeeID=?",em_id)

        my_cur = my.cursor(dictionary=True)
        my_cur.execute("DELETE FROM employees_payroll WHERE EmployeeID=%s",(em_id))
        my_cur.execute("DELETE FROM attendance WHERE EmployeeID=%s",(em_id))
        my_cur.execute("DELETE FROM salaries WHERE EmployeeID=%s",(em_id))

        sql.commit()
        my.commit()
    except Exception as e:
        sql.rollback()
        my.rollback()
        return jsonify({"status":"error","msg":str(e)}),500
    return jsonify({"status":"success", "msg":"xoa thanh cong"})
