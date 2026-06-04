from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os
from pathlib import Path


class ResumePreviewHandler(SimpleHTTPRequestHandler):
    content_types = {
        ".js": "text/javascript; charset=utf-8",
        ".mjs": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
    }

    def guess_type(self, path: str) -> str:
        suffix = Path(path).suffix.lower()
        return self.content_types.get(suffix, super().guess_type(path))

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main() -> None:
    root = Path(__file__).resolve().parent
    os.chdir(root)
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
