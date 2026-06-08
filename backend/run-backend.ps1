# Install dependencies if needed
pip install -r requirements.txt

# Start FastAPI dev server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
