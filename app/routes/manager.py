from datetime import datetime
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

# ✅ Route to get total sales
@bp.route('/get_total_sales', methods=['GET'])
def get_total_sales():
    date = request.args.get('date')

    try:
        datetime.strptime(date, "%Y-%m-%d")
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT SUM(s.quantity * p.price) AS total_sales_amount
            FROM sales s
            JOIN stocks p ON s.productId = p.productId
            WHERE s.Date = %s
        """
        cursor.execute(query, (date,))
        result = cursor.fetchone()
        total_sales_amount = result["total_sales_amount"] if result["total_sales_amount"] is not None else 0.0
        return jsonify({"date": date, "total_sales_amount": f"{total_sales_amount:.2f}"})

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        cursor.close()
        connection.close()

# ✅ Route to get top-selling items
@bp.route('/get_top_selling_items', methods=['GET'])
def get_top_selling_items():
    date = request.args.get('date')

    try:
        datetime.strptime(date, "%Y-%m-%d")
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT p.productName, SUM(s.quantity) AS total_quantity
            FROM sales s
            JOIN stocks p ON s.productId = p.productId
            WHERE s.Date = %s
            GROUP BY s.productId
            ORDER BY total_quantity DESC
            LIMIT 5
        """
        cursor.execute(query, (date,))
        result = cursor.fetchall()

        return jsonify({"date": date, "top_selling_items": result})

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        cursor.close()
        connection.close()

# ✅ New Route to Check Out-of-Stock Items
@bp.route('/api/check_out_of_stock', methods=['GET'])
def check_out_of_stock():
    """Fetch items with quantity = 0"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT productId, productName, brand FROM stocks WHERE quantity = 0"
        cursor.execute(query)
        out_of_stock_items = cursor.fetchall()

        return jsonify(out_of_stock_items)

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        cursor.close()
        connection.close()
