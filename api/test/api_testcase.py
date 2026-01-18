from fastapi.testclient import TestClient
from django.test import Client

from TaskDesk.basetestcase import BaseTestCase
from TaskDesk.asgi import application


class APITestCase(BaseTestCase):
    def setUp(self):
        result = super().setUp()
        self.client = TestClient(application)
        self.django_client = Client()
        return result

    def login(self):
        self.django_client.login(username=self.username, password=self.password)
        self.client.cookies.update(dict((key, morsel.value) for key, morsel
                                        in self.django_client.cookies.items()))