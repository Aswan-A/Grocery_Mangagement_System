from flask import Blueprint, render_template

# Create a Blueprint for manager-related routes
bp = Blueprint('manager', __name__, url_prefix='/manager')

@bp.route('/')
def manager_dashboard():
    return render_template('manager.html')
    