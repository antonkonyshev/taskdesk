FROM python:3.14.2-slim-trixie

SHELL ["/bin/bash", "-xe", "-c"]
WORKDIR /opt/taskdesk
ENV PYTHONUNBUFFERED=1

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
RUN pip install -r requirements.txt

RUN groupadd -g 1000 taskdesk && \
    useradd -ms /bin/bash -u 1000 -g taskdesk taskdesk
USER taskdesk:taskdesk

ENTRYPOINT "celery -A TaskDesk worker --loglevel=error"
