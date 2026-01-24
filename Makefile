VENV = ../env
PYTHON = $(VENV)/bin/python

.PHONY: dev down_dev test vitest shell logs clean_static production_up production_run production_down production_logs minimal_run minimal_up minimal_down minimal_deploy

dev:
	sudo docker compose -f docker/compose.dev.yaml run --service-ports --remove-orphans taskdesk

down:
	sudo docker compose -f docker/compose.dev.yaml down

test:
	$(PYTHON) manage.py test --settings=TaskDesk.settings.testing

vitest:
	npm run test

logs:
	sudo docker compose -f docker/compose.dev.yaml logs -f

shell:
	sudo docker compose -f docker/compose.dev.yaml exec -it taskdesk python manage.py shell

clean_static:
	rm -rf ./static/vite/*
	rm -rf ./static/dist/*

static: clean_static
	npm run build
	$(PYTHON) manage.py collectstatic

production_up:
	sudo docker compose -f docker/compose.production.yaml up -d

production_run:
	sudo docker compose -f docker/compose.production.yaml run --service-ports --remove-orphans taskdesk

production_down:
	sudo docker compose -f docker/compose.production.yaml down

production_build:
	sudo docker compose -f docker/compose.production.yaml build

production_logs:
	sudo docker compose -f docker/compose.production.yaml logs -f

minimal%: export DJANGO_SETTINGS_MODULE = TaskDesk.settings.minimal

minimal_run:
	$(PYTHON) -m uvicorn TaskDesk.asgi:application --host 127.0.0.1 --port 8000 --workers 2

minimal_up:
	sudo systemctl start taskdesk.service

minimal_down:
	sudo systemctl stop taskdesk.service

minimal_debug:
	$(PYTHON) -m uvicorn TaskDesk.asgi:application --host 127.0.0.1 --port 8000 --workers 1 --reload --reload-include *.html

minimal_deploy:
	sudo cp -n docker/example_configs/example.systemd.service /etc/systemd/system/taskdesk.service && \
	python -m venv $(VENV) && \
	$(VENV)/bin/pip install -r requirements.txt && \
	$(PYTHON) manage.py migrate
