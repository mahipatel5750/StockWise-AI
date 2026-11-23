"""
StockWise AI - Local Development Server & Secure Backend Proxy
Zero external dependencies (uses standard Python 3 libraries: http.server, urllib, json, os, webbrowser).

Features:
1. Serves the `web-version` frontend at http://localhost:8000
2. Provides a secure server-side backend proxy at POST /api/gemini-assistant
   (Guarantees GEMINI_API_KEY remains secret on the server and is never exposed to the client)
3. Automatically opens your default web browser on launch.
"""

import http.server
import socketserver
import os
import json
import urllib.request
import urllib.error
import webbrowser

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, "web-version")

class StockWiseHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def do_POST(self):
        # Handle secure Gemini AI proxy endpoint
        if self.path == "/api/gemini-assistant":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            
            try:
                payload = json.loads(post_data.decode("utf-8"))
                user_prompt = payload.get("prompt", "")
                inventory_context = payload.get("context", [])

                api_key = os.environ.get("GEMINI_API_KEY", "").strip()

                if not api_key:
                    # Provide informative message if API key is not yet set in environment
                    response_data = {
                        "reply": (
                            "ℹ️ **Backend Proxy Active:** The secure server proxy received your request, "
                            "but `GEMINI_API_KEY` is not set in the server environment. "
                            "To enable live cloud Gemini AI, set `GEMINI_API_KEY=your_key` in your system environment, "
                            "or enjoy the built-in deterministic local intelligence engine which is fully operational!"
                        ),
                        "status": "local_fallback"
                    }
                else:
                    # Securely call Google Gemini API server-side
                    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                    
                    system_context = (
                        "You are StockWise AI, an expert retail inventory & procurement assistant. "
                        f"Current inventory data summary: {json.dumps(inventory_context[:10])}. "
                        "Provide concise, actionable recommendations."
                    )

                    gemini_payload = {
                        "contents": [
                            {
                                "parts": [
                                    {"text": f"{system_context}\n\nUser Question: {user_prompt}"}
                                ]
                            }
                        ]
                    }

                    req = urllib.request.Request(
                        gemini_url,
                        data=json.dumps(gemini_payload).encode("utf-8"),
                        headers={"Content-Type": "application/json"}
                    )

                    try:
                        with urllib.request.urlopen(req, timeout=15) as resp:
                            gemini_res = json.loads(resp.read().decode("utf-8"))
                            text_reply = gemini_res["candidates"][0]["content"]["parts"][0]["text"]
                            response_data = {"reply": text_reply, "status": "success"}
                    except urllib.error.HTTPError as he:
                        response_data = {
                            "reply": f"Gemini API returned status {he.code}: {he.reason}",
                            "status": "error"
                        }
                    except Exception as ge:
                        response_data = {
                            "reply": f"Error calling Gemini: {str(ge)}",
                            "status": "error"
                        }

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode("utf-8"))
                return

            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
                return

        # Default fallback
        self.send_response(404)
        self.end_headers()

    def do_OPTIONS(self):
        # CORS preflight
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

def run_server():
    os.chdir(WEB_DIR)
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), StockWiseHandler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 65)
        print("📦 StockWise AI Web Application Server Running")
        print("=" * 65)
        print(f"👉 Local Web App URL:    {url}")
        print(f"👉 AI Backend Proxy API: {url}/api/gemini-assistant")
        print("=" * 65)
        print("Press Ctrl+C to stop the server anytime.\n")
        
        try:
            webbrowser.open(url)
        except Exception:
            pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server gracefully...")
            httpd.server_close()

if __name__ == "__main__":
    run_server()
