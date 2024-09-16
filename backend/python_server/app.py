from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import imgkit
import os
import sys
import logging
import json
from datetime import datetime
from types import MappingProxyType as mappingproxy
import evolis
from dotenv import load_dotenv

# Ensure the evolis library path is added to the system path
sys.path.append(os.path.join(os.path.dirname(__file__), 'evolis'))

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Load environment variables from .env file
load_dotenv()
API_IP_ADDRESS = os.getenv('API_IP_ADDRESS')

# Static map of printer IPs to printer names
PRINTER_MAP = {
    "192.168.8.50": "Evolis Primacy 2 (LAN)",
    "192.168.8.51": "Evolis Primacy 2 (LAN)",
    "192.168.0.50": "Evolis Primacy 2 (PC)"
}

class EvolisEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (evolis.Mark, evolis.Model, evolis.Type, evolis.RibbonType)):
            return obj.name
        elif isinstance(obj, datetime):
            return obj.isoformat()
        elif isinstance(obj, mappingproxy):
            return dict(obj)
        elif callable(obj):
            return str(obj)
        elif hasattr(obj, '__dict__'):
            return obj.__dict__
        elif isinstance(obj, (list, tuple)):
            return list(obj)
        return json.JSONEncoder.default(self, obj)

@app.route('/list-printers', methods=['GET'])
def list_printers():
    try:
        devices = evolis.Evolis.get_devices()
        printer_list = [{"name": device.name} for device in devices]
        return jsonify({"printers": printer_list, "status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/print-badge', methods=['POST'])
def print_badge():
    data = request.json
    participant = data.get('participant', {})
    formattedQrCodeBase64 = data.get('formattedQrCodeBase64', '')
    logoBase64 = data.get('logoBase64', '')
    printer = data.get('printer')

    if not printer or not isinstance(printer, dict):
        app.logger.error('Printer details are required and must be a dictionary')
        return jsonify({'status': 'error', 'message': 'Printer details are required'}), 400

    printer_ip = printer.get('ip')
    printer_name = PRINTER_MAP.get(printer_ip)

    if not printer_name:
        app.logger.error('Printer not found for the provided IP address')
        return jsonify({'status': 'error', 'message': 'Printer not found for the provided IP address'}), 400

    # Read the HTML template file
    template_path = os.path.join(os.path.dirname(__file__), 'badge_template.html')
    with open(template_path, 'r') as file:
        html_template = file.read()

    # Ensure logoBase64 is correctly formatted
    if logoBase64.startswith("data:image/png;base64,"):
        logo_html = f'<img src="{logoBase64}" alt="Logo"/>'
    else:
        logo_html = f'<img src="data:image/png;base64,{logoBase64}" alt="Logo"/>'
        
    # Render the HTML template with the variables
    html_content = render_template_string(html_template, first_name=participant.get('first_name', 'First Name'),
                                          last_name=participant.get('last_name', 'Last Name'),
                                          formattedQrCodeBase64=formattedQrCodeBase64,
                                          logo_html=logo_html)

    if not html_content:
        app.logger.error('No content provided')
        return jsonify({'status': 'error', 'message': 'No content provided'}), 400

    # Convert HTML to BMP using imgkit
    bmp_path = os.path.join(os.path.dirname(__file__), 'badge.bmp')
    options = {
        'format': 'bmp',
        'width': 192,   # 2 inches in pixels at 96 DPI
        'height': 312,  # 3.25 inches in pixels at 96 DPI
        'disable-smart-width': '',
        'zoom': 1.0     # Adjust zoom level to control scaling
    }
    config = imgkit.config(wkhtmltoimage='C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltoimage.exe')
    imgkit.from_string(html_content, bmp_path, options=options, config=config)

    if not os.path.exists(bmp_path):
        app.logger.error('BMP file not found')
        return jsonify({'status': 'error', 'message': 'BMP file not found'}), 400

    try:
        app.logger.info(f"Attempting to connect to printer: {printer_name} at {printer_ip}")
        co = evolis.Connection(printer_name, False)
        
        if not co.is_open():
            app.logger.error("Failed to connect to printer")
            return jsonify({'status': 'error', 'message': 'Failed to connect to printer'}), 500

        # Log printer properties
        printer_info = co.get_info()
        ribbon_info = co.get_ribbon_info()
        cleaning_info = co.get_cleaning_info()

        log_data = {
            "Printer Info": printer_info,
            "Ribbon Info": ribbon_info,
            "Cleaning Info": cleaning_info,
        }
        app.logger.info(json.dumps(log_data, cls=EvolisEncoder))

        # Attempt to print
        # ps = evolis.PrintSession(co)
        # ps.set_image(evolis.CardFace.FRONT, bmp_path)
        # app.logger.info("Sending print job to printer")
        # rc = ps.print()

        # if rc == evolis.ReturnCode.PRINT_NEEDACTION:
        #     # Get detailed status
        #     status_info = co.get_status()
        #     detailed_message = f"Printer needs action. Status: {status_info}"
        #     app.logger.error(detailed_message)
        #     return jsonify({'status': 'error', 'message': detailed_message}), 500

        # app.logger.info(f"Print job result: {rc}")
        
        # Return the print session object directly
        return jsonify({
            'status': 'success', 
            'message': 'Print is OK', 
            'log_data': json.loads(json.dumps(log_data, cls=EvolisEncoder))
            # 'print_session': json.loads(json.dumps(ps, cls=EvolisEncoder))
        })
        
    except Exception as e:
        app.logger.error(f"Exception occurred: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        co.close()

if __name__ == '__main__':
    app.run(host=API_IP_ADDRESS, port=5001, debug=True)
