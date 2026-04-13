from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path


class ResumePreviewHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript; charset=utf-8",
        ".mjs": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
    }


def main() -> None:
    root = Path(__file__).resolve().parent
    server = ThreadingHTTPServer(("127.0.0.1", 8000), ResumePreviewHandler)
    print(f"Serving {root} at http://127.0.0.1:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping preview server...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
