FROM python:3.12-slim-bookworm

SHELL ["/bin/bash", "-xe", "-c"]
WORKDIR /opt/taskdesk
EXPOSE 8000
ENV PYTHONUNBUFFERED=1 \
    PORT=8000

RUN apt-get update --yes --quiet && apt-get install --yes --quiet --no-install-recommends \
    build-essential \
    libpq-dev \
    libmariadb-dev \
    libjpeg62-turbo-dev \
    zlib1g-dev \
    libwebp-dev \
    git \
 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install uvicorn && pip install -r requirements.txt

USER 1000:1000

ENTRYPOINT "uvicorn TaskDesk.asgi:application --reload --reload-include *.html"
