from fastapi.testclient import TestClient
from django.test import Client

from TaskDesk.basetestcase import BaseTestCase
from TaskDesk.asgi import application
from tdauth.models import User


class APITestCase(BaseTestCase):
    username = "test@example.com"
    password = "123456"

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com", password="123456")
        self.user.is_active = True
        self.user.save()
        self.client = TestClient(application)
        self.django_client = Client()
        return super().setUp()

    def login(self):
        self.django_client.login(username=self.username, password=self.password)
        self.client.cookies.update(dict((key, morsel.value) for key, morsel
                                        in self.django_client.cookies.items()))