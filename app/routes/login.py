from flask import Blueprint, request, jsonify, render_template
from app.db import get_db_connection

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

    connection = get_db_connection()
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

    return jsonify({
        'success': success,
        'message': message,
        'role': role
    })
