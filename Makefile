VENV = ../env
PYTHON = $(VENV)/bin/python

.PHONY: dev down_dev test vitest shell clean_static production_up production_run production_down

dev:
	sudo docker compose -f docker/compose.dev.yaml run --service-ports --remove-orphans taskdesk

down:
	sudo docker compose -f docker/compose.dev.yaml down

test:
	$(PYTHON) manage.py test --settings=TaskDesk.settings.testing

vitest:
	npm run test

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
