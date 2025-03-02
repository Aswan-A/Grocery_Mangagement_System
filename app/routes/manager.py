from flask import Blueprint, render_template, jsonify, request
import mysql.connector
from app.db import get_db_connection  # Ensure this is correctly set up

# Create a Blueprint for manager-related routes
bp = Blueprint('manager', __name__, url_prefix='/manager')

@bp.route('/')
def manager_dashboard():
    return render_template('manager.html')

# ✅ Route to get all attendance records
@bp.route('/api/attendance', methods=['GET'])
def get_all_attendance():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
    SELECT 
        attendance.employeeId, 
        employees.employeeName,  -- Ensure this column exists
        DATE_FORMAT(attendance.date, '%Y-%m-%d') AS formatted_date, 
        attendance.status 
    FROM attendance 
    JOIN employees ON attendance.employeeId = employees.employeeId  
    ORDER BY formatted_date DESC
    """
    
    cursor.execute(query)
    attendance = cursor.fetchall()

    cursor.close()
    connection.close()

    # ✅ Rename 'formatted_date' to 'date' before returning
    for row in attendance:
        row['date'] = row.pop('formatted_date')

    return jsonify(attendance)

# ✅ Route to get absentee list
@bp.route('/api/get_absentees', methods=['GET'])
def get_absentees():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)  # ✅ Use dictionary cursor for JSON response

    date = request.args.get('date')
    if not date:
        return jsonify({"error": "Date is required"}), 400

    # ✅ Fix query to correctly fetch absent employees
    query = """
    SELECT e.employeeId, e.employeeName
    FROM employees e
    LEFT JOIN attendance a ON e.employeeId = a.employeeId AND a.date = %s
    WHERE a.status IS NULL OR a.status = 'Absent';
    """
    
    cursor.execute(query, (date,))
    absentees = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(absentees)
