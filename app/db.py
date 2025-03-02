import mysql.connector
from flask import current_app
from mysql.connector import errorcode


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
                password VARCHAR(100) NOT NULL,
                role VARCHAR(50) NOT NULL
            );
        """
        # Execute the SQL queries to create tables
        cursor.execute(create_users_table)
    
        # Insert default users into the 'users' table
        insert_users = """
            INSERT IGNORE INTO users (username, password, role)
            VALUES
            ('admin', 'adminpass', 'manager'),
            ('staff', 'staffpass', 'staff');
        """
        cursor.execute(insert_users)
        
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
