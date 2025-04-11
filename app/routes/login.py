from errno import errorcode
from flask import Blueprint, current_app, request, jsonify, render_template
import mysql
from app.db import get_auth_db_connection

# Create a Blueprint for login-related routes
bp = Blueprint('login', __name__)

@bp.route('/')
def home():
    return render_template('login.html')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    supermarket= data.get('supermarket')
    current_app.config['CURRENT_SUPERMARKET'] = supermarket


    connection = get_auth_db_connection()
    cursor = connection.cursor()

    query = "SELECT * FROM users WHERE username = %s AND password = %s"
    cursor.execute(query, (username, password))
    user = cursor.fetchone()

    if user:
        role = user[3]  # Assuming 'role' is in the 4th column of the 'users' table
        message = "Login successful!"
        success = True
    else:
        message = "Invalid username or password!"
        success = False
        role = None

    cursor.close()
    connection.close()
    create_tables()
    create_age_check_trigger()
    return jsonify({
        'success': success,
        'message': message,
        'role': role
    })

def get_db_connection():
    connection = mysql.connector.connect(
        host=current_app.config['MYSQL_HOST'],
        user=current_app.config['MYSQL_USER'],
        password=current_app.config['MYSQL_PASSWORD'],
        database=current_app.config.get('CURRENT_SUPERMARKET')
    )
    return connection

def create_tables():
    try:
        # Establishing connection to MySQL
        connection = get_db_connection()
        cursor = connection.cursor()

        # SQL statements for creating the tables
        create_users_table = """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(100) NOT NULL,
                role VARCHAR(50) NOT NULL
            );
        """
        create_stocks_table = """
            CREATE TABLE IF NOT EXISTS stocks (
                productId VARCHAR(50) PRIMARY KEY,
                productName VARCHAR(255) NOT NULL,
                brand VARCHAR(255),
                category VARCHAR(255),
                quantity INT,
                price DECIMAL(10, 2)
            );
        """
        create_employees_table = """
            CREATE TABLE IF NOT EXISTS employees (
                employeeId VARCHAR(50) PRIMARY KEY,
                employeeName VARCHAR(255) NOT NULL,
                mobileNumber BIGINT,
                DOB DATE,
                address TEXT,
                joinDate DATE NOT NULL
            );
        """
        create_attendance_table = """
            CREATE TABLE IF NOT EXISTS attendance (
                employeeId VARCHAR(50) ,
                Date date ,
                status VARCHAR(15)
            );
            """ 
        
        create_sales_table = """
            CREATE TABLE IF NOT EXISTS sales (
                id INT AUTO_INCREMENT PRIMARY KEY,  -- Unique identifier for each sale
                productId VARCHAR(50) NOT NULL,
                Date DATE NOT NULL,
                quantity INT NOT NULL,
                FOREIGN KEY (productId) REFERENCES stocks(productId) ON DELETE CASCADE
                );
            """ 
        cursor.execute(create_stocks_table)
        cursor.execute(create_employees_table)
        cursor.execute(create_attendance_table)
        cursor.execute(create_sales_table)

        # Commit the changes and close the connection
        connection.commit()
        cursor.close()
        connection.close()

        print("Tables created and data inserted successfully.")
    
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Something is wrong with your MySQL username or password")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist")
        else:
            print(err)

def create_age_check_trigger():
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Drop trigger if it exists
        cursor.execute("DROP TRIGGER IF EXISTS check_employee_age_before_insert;")
        
        # Create the trigger without DELIMITER syntax
        trigger_sql = """
        CREATE TRIGGER check_employee_age_before_insert
        BEFORE INSERT ON employees
        FOR EACH ROW
        BEGIN
            IF TIMESTAMPDIFF(YEAR, NEW.DOB, CURDATE()) < 18 THEN
                SIGNAL SQLSTATE '45000' 
                SET MESSAGE_TEXT = 'Employee must be at least 18 years old.';
            END IF;
        END;
        """
        
        cursor.execute(trigger_sql)
        connection.commit()
        print("Trigger created successfully!")

    except Exception as e:
        print(f"Error creating trigger: {str(e)}")
    finally:
        cursor.close()
        connection.close()