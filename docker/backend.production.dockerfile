FROM python:3.14.2-alpine

SHELL ["/bin/sh", "-xe", "-c"]
EXPOSE 8000
ENV PYTHONUNBUFFERED=1 \
    PORT=8000

RUN apk update && apk add --no-cache \
    libwebp-dev \
    git vim task \
 && mkdir -p /opt/taskdesk
WORKDIR /opt/taskdesk
COPY requirements.txt .
RUN pip install uvicorn && pip install -r requirements.txt

RUN addgroup --gid 1000 taskdesk && \
    adduser -s /bin/sh -G taskdesk -D -u 1000 taskdesk
USER taskdesk:taskdesk

ENTRYPOINT "uvicorn TaskDesk.asgi:application --host=0.0.0.0 --port=8000 --workers 2"
