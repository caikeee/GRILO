#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8000

class NoCacheHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Expires', '0')
        self.send_header('Pragma', 'no-cache')
        super().end_headers()

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), NoCacheHTTPHandler) as httpd:
    print(f"Servidor rodando em http://localhost:{PORT}/")
    print(f"Diretório: {os.getcwd()}")
    print(f"Cache desabilitado - CSS sempre atualizado")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor parado.")
