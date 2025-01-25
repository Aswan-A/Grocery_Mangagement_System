from flask import Flask, request, jsonify, render_template
import mysql.connector,os
from dotenv import load_dotenv


# Load environment variables from the .env file
load_dotenv()

app = Flask(__name__)

# MySQL database configuration
app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB')


# MySQL connection
def get_db_connection():
    connection = mysql.connector.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        database=app.config['MYSQL_DB']
    )
    return connection

@app.route('/')
def home():
    return render_template('login.html')


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    connection = get_db_connection()
    cursor = connection.cursor()

    query = "SELECT * FROM users WHERE username = %s AND password = %s"
    cursor.execute(query, (username, password))
    user = cursor.fetchone()

    if user:
        role = user[3]  # Assuming 'role' is in the 4th column of the 'users' table
        print(role)
        message = "Login successful!"
        success = True
    else:
        message = "Invalid username or password!"
        success = False
        role = None

    cursor.close()
    connection.close()

    return jsonify({
        'success': success,
        'message': message,
        'role': role
    })

# Add a route to render the manager dashboard
@app.route('/manager')
def manager_dashboard():
    return render_template('manager.html')  # Ensure this is the correct path to the manager HTML

# Add a route to render the staff dashboard (if needed)
@app.route('/staff')
def staff_dashboard():
    return render_template('staff.html')  # Ensure this is the correct path to the staff HTML

if __name__ == '__main__':
    app.run(debug=True)
