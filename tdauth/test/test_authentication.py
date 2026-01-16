from django.urls import reverse

from TaskDesk.basetestcase import BaseTestCase
from tdauth.models import User


class AuthenticationTestCase(BaseTestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com", password="123456")
        self.user.is_active = True
        self.user.save()
        return super().setUp()

    def tearDown(self):
        self.client.logout()
        return super().tearDown()

    def test_not_authenticated_redirect(self):
        self.client.logout()
        rsp = self.client.get("/")
        self.assertEqual(rsp.status_code, 302)
        self.assertEqual(rsp.url, reverse('tdauth_login'))

    def test_get_authentication_form(self):
        rsp = self.client.get(reverse('tdauth_login'))
        self.assertEqual(rsp.status_code, 200)
        html = rsp.content.decode('utf-8')
        self.assertIn('username', html)
        self.assertIn('password', html)
        self.assertIn('csrf', html)

    def test_post_authentication_form(self):
        rsp = self.client.post(reverse('tdauth_login'), data={
            'username': self.user.email, 'password': '123456'})
        self.assertEqual(rsp.status_code, 302)
        self.assertEqual(rsp.url, '/')
        rsp = self.client.get('/tasks/')
        self.assertEqual(rsp.status_code, 200)
        self.client.logout()

    def test_post_authentication_form_validation(self):
        rsp = self.client.post(reverse('tdauth_login'), data={
            'username': self.user.email, 'password': '123'})
        self.assertEqual(rsp.status_code, 200)
        html = rsp.content.decode('utf8')
        self.assertIn('bg-red', html)
        self.assertIn('correct Email and password', html)

        rsp = self.client.post(reverse('tdauth_login'), data={
            'username': self.user.email})
        self.assertEqual(rsp.status_code, 200)
        html = rsp.content.decode('utf8')
        self.assertIn('text-red', html)
        self.assertIn('field is required', html)

        rsp = self.client.post(reverse('tdauth_login'), data={})
        self.assertEqual(rsp.status_code, 200)
        html = rsp.content.decode('utf8')
        self.assertIn('text-red', html)
        self.assertIn('field is required', html)

        rsp = self.client.post(reverse('tdauth_login'), data={
            'username': 'test'})
        self.assertEqual(rsp.status_code, 200)
        html = rsp.content.decode('utf8')
        self.assertIn('text-red', html)
        self.assertIn('field is required', html)

        rsp = self.client.post(reverse('tdauth_login'), data={
            'password': '123456'})
        self.assertEqual(rsp.status_code, 200)
        html = rsp.content.decode('utf8')
        self.assertIn('text-red', html)
        self.assertIn('field is required', html)

    def test_non_authenticated_logout(self):
        rsp = self.client.get(reverse('tdauth_logout'))
        self.assertEqual(rsp.status_code, 302)
        self.assertEqual(rsp.url, reverse('tdauth_login'))

    def test_user_logout(self):
        rsp = self.client.post(reverse('tdauth_login'), data={
            'username': self.user.email, 'password': '123456'})
        self.assertEqual(rsp.status_code, 302)
        rsp = self.client.get('/tasks/')
        self.assertEqual(rsp.status_code, 200)
        rsp = self.client.get(reverse('tdauth_logout'))
        self.assertEqual(rsp.status_code, 302)
        self.assertEqual(rsp.url, reverse('tdauth_login'))