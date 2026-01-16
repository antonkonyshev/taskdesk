dev:
	sudo docker compose run --service-ports --remove-orphans taskdesk

test:
	python manage.py test --settings=TaskDesk.settings.testing

down:
	sudo docker compose down
