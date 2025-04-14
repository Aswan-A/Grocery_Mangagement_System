from errno import errorcode
from mysql.connector import errorcode
from flask import Blueprint, current_app, request, jsonify, render_template
import mysql
from app.db import get_auth_db_connection
import bcrypt

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
    supermarket = data.get('supermarket')
    current_app.config['CURRENT_SUPERMARKET'] = supermarket

    try:
        auth_conn = get_auth_db_connection()
        cursor = auth_conn.cursor()

        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        cursor.close()
        auth_conn.close()
    except mysql.connector.Error as err:
        return jsonify({
            'success': False,
            'message': 'Error connecting to auth database.',
            'error': str(err),
            'role': None
        }), 500

    success = False
    role = None

    if user:
        stored_hash = user[2]
        role = user[3]

        if bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
            success = True
            message = "Login successful!"
        else:
            message = "Invalid username or password!"
    else:
        message = "Invalid username or password!"


    if success:
        try:
            create_tables()
            create_age_check_trigger()
            create_product_id_check_trigger()
        except mysql.connector.Error as err:
            if err.errno == errorcode.ER_BAD_DB_ERROR:
                return jsonify({
                    'success': False,
                    'message': f"Supermarket database '{supermarket}' does not exist.",
                    'role': role
                }), 500
            return jsonify({
                'success': False,
                'message': 'Database setup error',
                'error': str(err),
                'role': role
            }), 500

    return jsonify({
        'success': success,
        'message': message,
        'role': role
    })


def get_db_connection():
    try:
        con = mysql.connector.connect(
            host=current_app.config['MYSQL_HOST'],
            user=current_app.config['MYSQL_USER'],
            password=current_app.config['MYSQL_PASSWORD'],
            database=current_app.config.get('CURRENT_SUPERMARKET')
        )
        return con
    except mysql.connector.Error as err:
        raise err


def create_tables():
    try:
        # Establishing connection to MySQL
        connection = get_db_connection()
        cursor = connection.cursor()

        create_brands_table = """
            CREATE TABLE IF NOT EXISTS brands (
                brandId INT AUTO_INCREMENT PRIMARY KEY,
                brandName VARCHAR(255) NOT NULL UNIQUE
            );
        """

        create_categories_table = """
            CREATE TABLE IF NOT EXISTS categories (
                categoryId INT AUTO_INCREMENT PRIMARY KEY,
                categoryName VARCHAR(255) NOT NULL UNIQUE
            );
        """

        create_stocks_table = """
            CREATE TABLE IF NOT EXISTS stocks (
                productId VARCHAR(50) PRIMARY KEY,
                productName VARCHAR(255) NOT NULL,
                brandId INT,
                categoryId INT,
                quantity INT,
                price DECIMAL(10, 2),
                FOREIGN KEY (brandId) REFERENCES brands(brandId),
                FOREIGN KEY (categoryId) REFERENCES categories(categoryId)
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
                status VARCHAR(15),
                PRIMARY KEY (employeeId, Date),
                FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
            );
            """ 
        
        create_sales_table = """
            CREATE TABLE IF NOT EXISTS sales (
                id INT AUTO_INCREMENT PRIMARY KEY, 
                productId VARCHAR(50) NOT NULL,
                Date DATE NOT NULL,
                quantity INT NOT NULL,
                FOREIGN KEY (productId) REFERENCES stocks(productId) ON DELETE CASCADE
                );
            """ 
        cursor.execute(create_brands_table)
        cursor.execute(create_categories_table)
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
        raise err

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


def create_product_id_check_trigger():
    # Establish database connection
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Drop the trigger if it exists
        cursor.execute("DROP TRIGGER IF EXISTS before_insert_stock;")

        # SQL to create the trigger
        trigger_sql = """
        CREATE TRIGGER before_insert_stock
        BEFORE INSERT ON stocks
        FOR EACH ROW
        BEGIN
            IF EXISTS (SELECT 1 FROM stocks WHERE productId = NEW.productId) THEN
                SIGNAL SQLSTATE '45001'
                SET MESSAGE_TEXT = 'Product with this ID already exists!';
            END IF;
        END;
        """
        
        # Execute the SQL to create the trigger
        cursor.execute(trigger_sql)
        connection.commit()
        print("Trigger created successfully!")

    except Exception as e:
        print(f"Error creating trigger: {str(e)}")
    finally:
        cursor.close()
        connection.close()
