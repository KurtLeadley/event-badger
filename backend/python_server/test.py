import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), 'evolis'))
import evolis

printer_name = "Evolis Primacy 2 (Copy 1)"

try:
    print(f"Attempting to connect to printer: {printer_name}")
    co = evolis.Connection(printer_name, False)
    
    if not co.is_open():
        print("Failed to connect to printer")
    else:
        print("Successfully connected to printer")
        all_settings = co.get_settings()
        print("> Printer Settings:")
        for key, value in all_settings.items():
            print(f"-   {key}: {value}")
finally:
    co.close()
