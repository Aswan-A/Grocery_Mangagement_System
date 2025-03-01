from datetime import datetime , date
from flask import Blueprint, Response, json, render_template, request, jsonify
import mysql
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


# Fetch all employee data
@staff_bp.route('/api/employee', methods=['GET'])
def get_all_employees():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM employees")
    employees = cursor.fetchall()
    cursor.close()
    connection.close()
     # Convert datetime fields to "DDMMYYYY" format
    for emp in employees:
        for key, value in emp.items():
            if isinstance(value,( datetime,date)):  # Check if it's a date object
                emp[key] = value.strftime('%d-%m-%Y')  # Convert to "DD-MM-YYYY"
    return jsonify(employees)



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
     
    absentees = cursor.fetchall()

    # Format the absentee data into a list of dictionaries
    absentee_list = [{'employeeId': absentee[0], 'employeeName': absentee[1]} for absentee in absentees]

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

            cursor.execute("Select id, quantity from sales where productId = %s and Date = CURDATE()",(product_id,))
            record=cursor.fetchone()
            if (record):
                nquantity=quantity_billed+record['quantity']
                cursor.execute("""
                UPDATE sales SET  quantity =%s where id=%s 
                """, (nquantity, record['id']))
            else:
                cursor.execute("""
                INSERT INTO sales (productId, Date, quantity)
                VALUES (%s, CURDATE(), %s)
                """, (product_id, quantity_billed))
                

            connection.commit()

            cursor.close()
            connection.close()
            # Update total amount
            total_amount += price * quantity_billed


        
        return jsonify({"success": True, "totalAmount": total_amount}), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@staff_bp.route('/get_total_sales', methods=['GET'])
def get_total_sales():
    """Fetch total sales amount for a given date from the database"""
    date = request.args.get('date')

    # Validate the date format
    try:
        datetime.strptime(date, "%Y-%m-%d")  # Ensures correct date format
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        # Calculate total sales amount
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



@staff_bp.route('/get_top_selling_items', methods=['GET'])
def get_top_selling_items():
    """Fetch the top 5 best-selling items based on sales quantity."""
    date = request.args.get('date')

    # Validate the date format
    try:
        datetime.strptime(date, "%Y-%m-%d")  # Ensures correct date format
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
