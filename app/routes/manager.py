from flask import Blueprint, render_template, jsonify
import mysql.connector
from app.db import get_db_connection


# Create a Blueprint for manager-related routes
bp = Blueprint('manager', __name__, url_prefix='/manager')

# Database connection function

@bp.route('/')
def manager_dashboard():
    return render_template('manager.html')

@bp.route('/attendance')
def fetch_attendance():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        query = "SELECT employeeId, Date, status FROM attendance"
        cursor.execute(query)
        attendance_data = cursor.fetchall()
        return jsonify(attendance_data)  # Return data as JSON
    finally:
        cursor.close()
        connection.close()
