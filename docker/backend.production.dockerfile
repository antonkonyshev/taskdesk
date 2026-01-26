FROM python:3.14.2-slim-trixie

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
    git vim taskwarrior \
 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install uvicorn && pip install -r requirements.txt

RUN groupadd -g 1000 taskdesk && \
    useradd -ms /bin/bash -u 1000 -g taskdesk taskdesk
USER taskdesk:taskdesk

ENTRYPOINT "uvicorn TaskDesk.asgi:application --host=0.0.0.0 --port=8000 --workers 2"
