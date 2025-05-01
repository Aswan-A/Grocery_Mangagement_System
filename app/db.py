import mysql.connector
from flask import current_app
from mysql.connector import errorcode
import bcrypt


def get_auth_db_connection():
    connection = mysql.connector.connect(
        host=current_app.config['MYSQL_HOST'],
        user=current_app.config['MYSQL_USER'],
        password=current_app.config['MYSQL_PASSWORD'],
        database=current_app.config['MYSQL_DB']
    )
    return connection



def create_auth_tables():
    try:
        # Establishing connection to MySQL
        connection = get_auth_db_connection()  
        cursor = connection.cursor()

        # SQL statements for creating the tables
        create_users_table = """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL
            );
        """
        
        cursor.execute(create_users_table)

        insert_users = """
            INSERT IGNORE INTO users (username, password, role)
            VALUES
            (%s, %s, %s),
            (%s, %s, %s);
        """
        
        # Hash passwords using bcrypt before inserting
        hashed_admin_pass = bcrypt.hashpw('adminpass'.encode('utf-8'), bcrypt.gensalt())
        hashed_staff_pass = bcrypt.hashpw('staffpass'.encode('utf-8'), bcrypt.gensalt())
        
        cursor.execute(insert_users, (
            'admin', hashed_admin_pass.decode('utf-8'), 'manager',
            'staff', hashed_staff_pass.decode('utf-8'), 'staff'
        ))

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
