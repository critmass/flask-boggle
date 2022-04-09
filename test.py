from unittest import TestCase
from app import app
from flask import session


class FlaskTests(TestCase):

    def setUp(self):

        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_homepage(self):

        with self.client:
            resp = self.client.get('/')
            self.assertIn('board', session)
            self.assertIsNone(session.get('highscore'))
            self.assertIsNone(session.get('nplays'))
            self.assertIn(b'<p>High Score: ', resp.data)
            self.assertIn(b'Time Left: ', resp.data)
            self.assertIn(b'Score: ', resp.data)

    def test_valid_word(self):

        with self.client as client:
            with client.session_transaction() as sess:
                sess['board'] = [
                    ['T', 'E', 'S', 'T', 'S'],
                    ['T', 'E', 'S', 'T', 'S'],
                    ['T', 'E', 'S', 'T', 'S'],
                    ['T', 'E', 'S', 'T', 'S'],
                    ['T', 'E', 'S', 'T', 'S']
                ]
        resp = self.client.get('/check-word?word=test')
        self.assertEqual(resp.json['result'], 'ok')

    def test_invalid_word(self):

        self.client.get('/')
        resp = self.client.get('/check-word?word=notontheboard')
        self.assertEqual(resp.json['result'], 'not-on-board')

    def test_not_real_word(self):
        resp = self.client.get(
            '/check-word?word=aasdfajklshglhlrjdfn'
        )
        self.assertEqual(resp.json['result'], 'not-word')