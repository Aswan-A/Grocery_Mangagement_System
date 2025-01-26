from flask import Flask
from app.routes import login, manager, staff
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # App configuration
    app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST')
    app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')
    app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
    app.config['MYSQL_DB'] = os.getenv('MYSQL_DB')

    # Register Blueprints
    app.register_blueprint(login.bp)
    app.register_blueprint(manager.bp)
    app.register_blueprint(staff.staff_bp)

    return app
