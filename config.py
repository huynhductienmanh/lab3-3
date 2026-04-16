import pyodbc
import mysql.connector

def get_sqlsever_connection():
    try:
        conn = pyodbc.connect(
            "DRIVER={ODBC Driver 17 for SQL Sever};"
            "SERVER=localhost"
            "DATABASE=HUMAN"
            "UID=sa"
            "PWD=1233456;",
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
            user="root",
            password="1233456",
            database="payroll_2026",
            autocommit=False
        )
        return conn
    except Exception as e:
        print("loi ket noi mysql:", str(e))
        raise