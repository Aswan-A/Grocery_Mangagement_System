import datetime
import sqlite3
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



@staff_bp.route('/api/get_absentees', methods=['GET'])
def get_absentees():
    connection = get_db_connection()
    cursor = connection.cursor()
    date = request.args.get('date')     
    # print(date)
    cursor.execute("""
        SELECT e.employeeId, e.employeeName
        FROM employees e
        LEFT JOIN attendance a ON e.employeeId = a.employeeId AND a.Date = %s
        WHERE a.Status is null;
    """,(date,))
    
    print("SDFSDFSDG") 
    absentees = cursor.fetchall()
    print("SDFSDFSDGGGG")

    # Format the absentee data into a list of dictionaries
    absentee_list = [{'employeeId': absentee[0], 'employeeName': absentee[1]} for absentee in absentees]
    print(absentee_list)

    connection.close()
    return jsonify(absentee_list)

@staff_bp.route('/api/mark_attendance', methods=['POST'])
def mark_attendance():
    data = request.get_json()  # Getting the data sent from the frontend
    employee_id = data['employeeId']
    date = data['date']
    status = 'present'  # Default status, you can modify this if needed (e.g., for absent status)

    connection = get_db_connection()
    cursor = connection.cursor()

    # Check if the employee already has attendance for today
    cursor.execute("""
    SELECT * FROM attendance WHERE employeeId = %s AND Date = %s
    """, (employee_id, date))
    existing_attendance = cursor.fetchone()

    if existing_attendance:
        # If attendance already exists for today, return a response saying so
        return jsonify({'success': False, 'message': 'Attendance already marked for today.'}), 400

    # If attendance doesn't exist for today, insert the new record
    cursor.execute("""
    INSERT INTO attendance (employeeId, Date, Status)
    VALUES (%s, %s, %s)
    """, (employee_id, date, status))

    connection.commit()
    connection.close()

    return jsonify({'success': True, 'message': 'Attendance marked successfully!'}), 200


# Fetch product details by productId (for billing section)
@staff_bp.route('/api/billing/stock/<string:product_id>', methods=['GET'])
def get_product_for_billing(product_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT productId, productName, price, quantity FROM stocks WHERE productId = %s", (product_id,))
    product = cursor.fetchone()  # Fetch one product by productId
    
    cursor.close()
    connection.close()
    
    if product:
        return jsonify(product)
    else:
        return jsonify({"error": "Product not found"}), 404


# Update stock quantity after the billing operation
@staff_bp.route('/api/billing/update_quantity', methods=['POST'])
def update_stock_quantity_after_billing():
    data = request.get_json()
    product_id = data['productId']
    quantity_sold = data['quantitySold']
    
    # Validate if the quantity is greater than zero
    if quantity_sold <= 0:
        return jsonify({"error": "Quantity sold must be greater than zero."}), 400
    
    # Check if enough stock is available
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT quantity FROM stocks WHERE productId = %s", (product_id,))
    current_stock = cursor.fetchone()
    
    if not current_stock:
        cursor.close()
        connection.close()
        return jsonify({"error": "Product not found."}), 404
    
    if current_stock['quantity'] < quantity_sold:
        cursor.close()
        connection.close()
        return jsonify({"error": "Not enough stock available."}), 400

    # Update the stock quantity in the database
    new_quantity = current_stock['quantity'] - quantity_sold
    cursor.execute("UPDATE stocks SET quantity = %s WHERE productId = %s", (new_quantity, product_id))
    connection.commit()
    
    cursor.close()
    connection.close()
    
    return jsonify({"message": "Stock quantity updated successfully!"}), 200


# Generate the bill after adding products
@staff_bp.route('/api/billing/generate_bill', methods=['POST'])
def generate_bill():
    try:
        data = request.get_json()  # Get the billing data
        items = data['items']  # Extract items from the request data
        total_amount = 0  # Initialize total amount

        # Loop through each item in the bill
        for item in items:
            product_id = item['productId']
            quantity_billed = int(item['quantity'])
            price = float(item['price'])

            # Fetch the current stock for the product from the database
            connection = get_db_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT quantity FROM stocks WHERE productId = %s", (product_id,))
            stock = cursor.fetchone()
            
            if stock is None:
                return jsonify({"error": f"Product with ID {product_id} not found in stock."}), 404
            
            current_quantity = stock['quantity']
            
            # Check if there's enough stock for the requested quantity
            if current_quantity < quantity_billed:
                return jsonify({"error": f"Not enough stock for product {product_id}. Available: {current_quantity}, Requested: {quantity_billed}."}), 400

            # Reduce the stock in the database
            new_quantity = current_quantity - quantity_billed
            cursor.execute("""
                UPDATE stocks 
                SET quantity = %s 
                WHERE productId = %s
            """, (new_quantity, product_id))
            connection.commit()

            cursor.close()

            # Update total amount
            total_amount += price * quantity_billed

        # Optionally, you can add code here to store the generated bill in a "bills" table or something similar.
        
        return jsonify({"success": True, "totalAmount": total_amount}), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
