FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .
ENV PYTHONUNBUFFERED=1 EXECUTE_LIVE_ORDERS=false
CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
