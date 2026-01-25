[README на русском языке](https://github.com/antonkonyshev/taskdesk/blob/master/README_ru.md)

# TaskDesk

Web-application designed for news feeds reading and tasks management based on TaskWarrior approach.

## Tech stack

1. *Python*, *[Django](https://github.com/antonkonyshev/taskdesk/tree/master/news)* and Wagtail CMS for backend functionality, database interactions with ORM and administrator interface providing.
2. *[FastAPI](https://github.com/antonkonyshev/taskdesk/tree/master/api)* for HTTP API and WebSocket endpoints organization.
3. *[Celery](https://github.com/antonkonyshev/taskdesk/blob/master/news/tasks.py)* and RabbitMQ for organization of background tasks.
4. *[Vue.js](https://github.com/antonkonyshev/taskdesk/tree/master/news/static/news)* and *TypeScript* for the implementation of web-applications.
5. *[Tailwind CSS](https://github.com/antonkonyshev/taskdesk/tree/master/news/static/news/components)* for the graphical user iterface implementation.
6. *Vite* and [Vitest](https://github.com/antonkonyshev/taskdesk/tree/master/news/static/news/test) for packaging of statics and assets and unit testing of the client-side logic.
7. *PWA* technology for app usage convenience.
8. *[Docker](https://github.com/antonkonyshev/taskdesk/tree/master/docker)* for organization of fast deployment in different environments.

## Screenshots

![Screenshots](https://raw.githubusercontent.com/antonkonyshev/taskdesk/refs/heads/master/TaskDesk/static/pwa/screenshots/viewports.webp)