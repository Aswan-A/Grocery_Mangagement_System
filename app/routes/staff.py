import datetime
from flask import Blueprint, Response, json, render_template, request, jsonify
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

# Add new stock item
@staff_bp.route('api/stock', methods=['POST'])
def add_stock():
    data = request.get_json()
    product_id = data['productId']
    product_name = data['product']
    brand = data['brand']
    category = data['category']
    quantity = data['quantity']
    price = data['price']
    
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO stocks (productId, productName, brand, category, quantity, price)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (product_id, product_name, brand, category, quantity, price))
    connection.commit()
    cursor.close()
    connection.close()
    
    return jsonify({"message": "Stock added successfully!"}), 201


# Fetch single stock by product ID
@staff_bp.route('/api/stock/<string:product_id>', methods=['GET'])
def get_stock(product_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM stocks WHERE productId = %s", (product_id,))
    stock = cursor.fetchone()  # Only fetch one row based on productId
    cursor.close()
    connection.close()
    
    if stock:
        return jsonify(stock)
    else:
        return jsonify({"error": "Stock not found"}), 404



# Update stock details
@staff_bp.route('/api/stock/<string:product_id>', methods=['PUT'])
def update_stock(product_id):
    data = request.get_json()
    product_name = data['product']
    brand = data['brand']
    category = data['category']
    quantity = data['quantity']
    price = data['price']
    
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("""
        UPDATE stocks SET productName = %s, brand = %s, category = %s, 
        quantity = %s, price = %s WHERE productId = %s
    """, (product_name, brand, category, quantity, price, product_id))
    connection.commit()
    cursor.close()
    connection.close()
    
    return jsonify({"message": "Stock updated successfully!"})

# Delete a stock item
@staff_bp.route('/api/stock/<string:product_id>', methods=['DELETE'])
def delete_stock(product_id):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM stocks WHERE productId = %s", (product_id,))
    connection.commit()
    cursor.close()
    connection.close()
    
    return jsonify({"message": "Stock deleted successfully!"})




# # --- Employee Management Routes ---

# Endpoint to add a new employee
@staff_bp.route('/api/employee', methods=['POST'])
def add_employee():
    try:
        # Get data from request
        data = request.get_json()
        employee_id = data.get('employeeId')
        employee_name = data.get('employeeName')
        mobile_number = data.get('mobileNumber')
        dob = data.get('DOB')
        address = data.get('address')
        join_date = data.get('joinDate')
        
        # Validate data
        if not employee_id or not employee_name or not join_date:
            return jsonify({"error": "Employee ID, Name, and Join Date are required"}), 400
                
        # Establish DB connection
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Insert new employee data into the database
        cursor.execute('''INSERT INTO employees (employeeId, employeeName, mobileNumber, DOB, address, joinDate) 
                          VALUES (%s, %s, %s, %s, %s, %s)''', 
                          (employee_id, employee_name, mobile_number, dob, address, join_date))
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            "message": "Employee added successfully!",
            "employeeId": employee_id
        }), 201

    except Exception as e:
        print(f"Error: {str(e)}")  # Log the error to the console
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

# Delete an employee by employeeId
@staff_bp.route('/api/employee/<string:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    try:
        # Establish DB connection
        connection = get_db_connection()
        cursor = connection.cursor()

        # Delete the employee by employeeId
        cursor.execute("DELETE FROM employees WHERE employeeId = %s", (employee_id,))
        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({"message": "Employee deleted successfully!"})

    except Exception as e:
        return jsonify({"error": "Error deleting employee", "details": str(e)}), 500



def custom_serializer(obj):
    if isinstance(obj, datetime.date):
        return obj.strftime('%d-%m-%Y')  # Format as YYYY-MM-DD
    raise TypeError("Type not serializable")


# Fetch all employee data
@staff_bp.route('/api/employee', methods=['GET'])
def get_all_employees():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM employees")
    employees = cursor.fetchall()
    cursor.close()
    connection.close()
    json_data = json.dumps(employees, default=custom_serializer)
    return Response(json_data, mimetype='application/json')

