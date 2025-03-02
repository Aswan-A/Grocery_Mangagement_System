from flask import Blueprint, render_template, jsonify
import mysql.connector
from app.db import get_db_connection

# Create a Blueprint for manager-related routes
bp = Blueprint('manager', __name__, url_prefix='/manager')

@bp.route('/')
def manager_dashboard():
    return render_template('manager.html')

@bp.route('/api/attendance', methods=['GET'])
def get_all_attendance():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    # ✅ Ensure the date format is 'YYYY-MM-DD' for JavaScript compatibility
    cursor.execute("SELECT employeeId, DATE_FORMAT(date, '%Y-%m-%d') AS formatted_date, status FROM attendance")
    attendance = cursor.fetchall()
    
    cursor.close()
    connection.close()
    
    # ✅ Rename 'formatted_date' to 'date' in response
    for row in attendance:
        row['date'] = row.pop('formatted_date')
    
    return jsonify(attendance)


