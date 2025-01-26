from flask import Blueprint, render_template, request, jsonify, current_app
from app.db import get_db_connection

# Define Blueprint for staff routes
staff_bp = Blueprint('staff', __name__,url_prefix='/staff')

# Route to render the staff dashboard page
@staff_bp.route('/')
def staff_dashboard():
    return render_template('staff.html')

# --- Stock Management Routes ---

# Fetch all stock data
@staff_bp.route('api/stock', methods=['GET'])
def get_all_stocks():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM stocks")
    stocks = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(stocks)

# # Add new stock item
# @staff_bp.route('/api/stock', methods=['POST'])
# def add_stock():
#     data = request.get_json()
#     product_id = data['productId']
#     product_name = data['product']
#     brand = data['brand']
#     category = data['category']
#     quantity = data['quantity']
#     price = data['price']
    
#     connection = get_db_connection()
#     cursor = connection.cursor()
#     cursor.execute("""
#         INSERT INTO stock (productId, product, brand, category, quantity, price)
#         VALUES (%s, %s, %s, %s, %s, %s)
#     """, (product_id, product_name, brand, category, quantity, price))
#     connection.commit()
#     cursor.close()
#     connection.close()
    
#     return jsonify({"message": "Stock added successfully!"}), 201

# # Update stock details
# @staff_bp.route('/api/stock/<int:product_id>', methods=['PUT'])
# def update_stock(product_id):
#     data = request.get_json()
#     product_name = data['product']
#     brand = data['brand']
#     category = data['category']
#     quantity = data['quantity']
#     price = data['price']
    
#     connection = get_db_connection()
#     cursor = connection.cursor()
#     cursor.execute("""
#         UPDATE stock SET product = %s, brand = %s, category = %s, 
#         quantity = %s, price = %s WHERE productId = %s
#     """, (product_name, brand, category, quantity, price, product_id))
#     connection.commit()
#     cursor.close()
#     connection.close()
    
#     return jsonify({"message": "Stock updated successfully!"})

# # Delete a stock item
# @staff_bp.route('/api/stock/<int:product_id>', methods=['DELETE'])
# def delete_stock(product_id):
#     connection = get_db_connection()
#     cursor = connection.cursor()
#     cursor.execute("DELETE FROM stock WHERE productId = %s", (product_id,))
#     connection.commit()
#     cursor.close()
#     connection.close()
    
#     return jsonify({"message": "Stock deleted successfully!"})

# # --- Employee Management Routes ---

# # Fetch all employee data
# @staff_bp.route('/api/employee', methods=['GET'])
# def get_all_employees():
#     connection = get_db_connection()
#     cursor = connection.cursor(dictionary=True)
#     cursor.execute("SELECT * FROM employee")
#     employees = cursor.fetchall()
#     cursor.close()
#     connection.close()
#     return jsonify(employees)

# # Add a new employee
# @staff_bp.route('/api/employee', methods=['POST'])
# def add_employee():
#     data = request.get_json()
#     employee_id = data['employeeId']
#     employee_name = data['employeeName']
#     mobile_number = data['mobileNumber']
#     dob = data['dob']
#     address = data['address']
#     join_date = data['joinDate']
    
#     connection = get_db_connection()
#     cursor = connection.cursor()
#     cursor.execute("""
#         INSERT INTO employee (employeeId, employeeName, mobileNumber, dob, address, joinDate)
#         VALUES (%s, %s, %s, %s, %s, %s)
#     """, (employee_id, employee_name, mobile_number, dob, address, join_date))
#     connection.commit()
#     cursor.close()
#     connection.close()
    
#     return jsonify({"message": "Employee added successfully!"}), 201

# # Update employee details
# @staff_bp.route('/api/employee/<int:employee_id>', methods=['PUT'])
# def update_employee(employee_id):
#     data = request.get_json()
#     employee_name = data['employeeName']
#     mobile_number = data['mobileNumber']
#     dob = data['dob']
#     address = data['address']
#     join_date = data['joinDate']
    
#     connection = get_db_connection()
#     cursor = connection.cursor()
#     cursor.execute("""
#         UPDATE employee SET employeeName = %s, mobileNumber = %s, dob = %s,
#         address = %s, joinDate = %s WHERE employeeId = %s
#     """, (employee_name, mobile_number, dob, address, join_date, employee_id))
#     connection.commit()
#     cursor.close()
#     connection.close()
    
#     return jsonify({"message": "Employee updated successfully!"})

# # Delete an employee
# @staff_bp.route('/api/employee/<int:employee_id>', methods=['DELETE'])
# def delete_employee(employee_id):
#     connection = get_db_connection()
#     cursor = connection.cursor()
#     cursor.execute("DELETE FROM employee WHERE employeeId = %s", (employee_id,))
#     connection.commit()
#     cursor.close()
#     connection.close()
    
#     return jsonify({"message": "Employee deleted successfully!"})

