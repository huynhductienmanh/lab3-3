import pyodbc
import mysql.connector

def get_sqlsever_connection():
    try:
        conn = pyodbc.connect(
            "DRIVER={ODBC Driver 17 for SQL Server};"
            "SERVER=localhost\\MSSQLSERVER01;"
            "DATABASE=HUMAN_2025;"
            "Trusted_Connection=yes;",
            timeout=5   
        )
        return conn
    except Exception as e:
        print("Loi ket noi SQL Server:", str(e))
        raise

def get_mysql_connection():
    try:
        conn = mysql.connector.connect(
            host = "localhost",
            port=3307,
            user="root",
            password="123456",
            database="payroll_2026",
            autocommit=False
        )
        return conn
    except Exception as e:
        print("loi ket noi mysql:", str(e))
        raise