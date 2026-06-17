# Install dependencies if needed
.\.venv\Scripts\pip.exe install -r requirements.txt

# Start FastAPI dev server
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
