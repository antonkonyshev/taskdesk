[README in English](https://github.com/antonkonyshev/taskdesk/blob/master/README.md)

# TaskDesk

Веб-приложение, разработанное для чтения новостных лент и управления задачами на основе подхода, реализованного в TaskWarrior.

## Технологический стек

1. **Python**, **[Django](https://github.com/antonkonyshev/taskdesk/blob/master/news/)** и Wagtail CMS для реализации серверной логики, взаимодействия с базой данных средствами ORM и предоставления интерфейса администратора.
2. **[FastAPI](https://github.com/antonkonyshev/taskdesk/tree/master/api)** для организации HTTP API и точек подключения с использованием WebSockets.
3. **[Celery](https://github.com/antonkonyshev/taskdesk/blob/master/news/tasks.py)** и RabbitMQ для выполнения фоновых задач.
4. **[Vue.js](https://github.com/antonkonyshev/taskdesk/tree/master/news/vite)** и **TypeScript** для реализации веб-приложений.
5. **[Tailwind CSS](https://github.com/antonkonyshev/taskdesk/tree/master/news/vite/components)** для оформления пользовательского графического интерфейса.
6. **Vite** и **[Vitest](https://github.com/antonkonyshev/taskdesk/tree/master/news/vite/test)** для упаковки статики и модульного тестирования клиентской логики.
7. **PWA** технология для удобства использования приложения.
8. **[Docker](https://github.com/antonkonyshev/taskdesk/tree/master/docker)** для организации быстрого развёртывания проекта в различных средах.

## Скриншоты

![Скриншоты](https://raw.githubusercontent.com/antonkonyshev/taskdesk/refs/heads/master/TaskDesk/static/pwa/screenshots/viewports.webp)