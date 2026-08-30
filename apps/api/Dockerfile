# Tesseract OCR needs its system binary + English trained data - pip
# cannot install these, they have to come from the OS package manager.
# Render's native (non-Docker) Python runtime has no reliable way to add
# system packages, which is why this app deploys as a container.
FROM python:3.11-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1

# $PORT is provided by the hosting platform at runtime (e.g. Render) -
# shell-form CMD so it's expanded at container start, not build time.
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
