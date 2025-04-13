from datetime import datetime
from flask import Blueprint, json, render_template, jsonify, request
import mysql.connector
from app.routes.login import get_db_connection


# Create a Blueprint for manager-related routes
bp = Blueprint('manager', __name__, url_prefix='/manager')

@bp.route('/')
def manager_dashboard():
    return render_template('manager.html')

@bp.route('/api/sales', methods=['GET'])
def get_all_sales():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT `Date`,quantity,productId FROM sales")
    stocks = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(stocks)

@bp.route('api/stock', methods=['GET'])
def get_all_stocks():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            s.productId,
            s.productName,
            b.brandName AS brand,
            c.categoryName AS category,
            s.quantity,
            s.price
        FROM stocks s
        LEFT JOIN brands b ON s.brandId = b.brandId
        LEFT JOIN categories c ON s.categoryId = c.categoryId
    """)

    stocks = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(stocks)


@bp.route('/api/categories', methods=['GET'])
def get_categories():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    cursor.execute("SELECT DISTINCT categoryName FROM categories")
    categories = cursor.fetchall()
    
    connection.close()
    
    return jsonify(categories)










@bp.route('/attendance/<date>')
def get_attendance(date):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Get all employees
    cursor.execute("SELECT employeeId, employeeName FROM employees")
    all_employees = cursor.fetchall()

    # Get attendance records for that date
    cursor.execute("SELECT employeeId, status FROM attendance WHERE Date = %s", (date,))
    attendance_records = cursor.fetchall()

    # Build a dictionary of employeeId -> status
    attendance_dict = {record['employeeId']: record['status'] for record in attendance_records}

    # Merge attendance info with employee list
    attendance_list = []
    for emp in all_employees:
        status = attendance_dict.get(emp['employeeId'], 'absent')
        attendance_list.append({
            'employee_id': emp['employeeId'],
            'employee_name': emp['employeeName'],
            'date': date,
            'status': status
        })

    cursor.close()
    connection.close()
    return jsonify(attendance_list)



# Route to get total sales
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

# Route to get top-selling items
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

# Check Out-of-Stock Items
@bp.route('/api/check_out_of_stock', methods=['GET'])
def check_out_of_stock():
    """Fetch items with quantity = 0 (out of stock)"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT 
                s.productId,
                s.productName,
                b.brandName AS brand
            FROM stocks s
            LEFT JOIN brands b ON s.brandId = b.brandId
            WHERE s.quantity = 0
        """
        cursor.execute(query)
        out_of_stock_items = cursor.fetchall()

        return jsonify(out_of_stock_items)

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        cursor.close()
        connection.close()
