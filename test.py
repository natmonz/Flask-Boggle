from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle


class FlaskTests(TestCase):

    # TODO -- write tests for every view function / feature!

    def setUp(self):
        """Setting up the test"""
        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_homepage(self):
        """This makes sure that the information given is stored into the game and the proper HTML is displayed for
        the player/user"""
        with self.client:
            response = self.client.get('/')
            self.assertIn('board', session)
            self.assertIsNone(session.get('highscore'))
            self.assertIsNone(session.get('num_plays'))
            self.assertIn(b'<p>High Score:', response.data)
            self.assertIn(b'Score:', response.data)
            self.assertIn(b'Seconds Left:', response.data)

    def test_valid_word(self):
        """Testing if the word is valid."""
        with self.client as client:
            with client.session_transaction() as sess:
                sess['board'] = [['C', 'A', 'T', 'T', 'T'],
                                 ['C', 'A', 'T', 'T', 'T'],
                                 ['C', 'A', 'T', 'T', 'T'],
                                 ['C', 'A', 'T', 'T', 'T'],
                                 ['C', 'A', 'T', 'T', 'T']]
        response = self.client.get('/check-word?word=cat')
        self.assertEqual(response.json['result'], 'ok')

    def test_invalid_world(self):
        """This test makes sure that the submitted word is in the word list."""
        self.client.get('/')
        response = self.client.get('/check-word?word=impossible')
        self.assertEqual(response.json['result'], 'not-on-board')

    def non_english_word(self):
        """This tests if the word is valid and on the given board."""
        self.client.get('/')
        response = self.client.get('/check-word?word=hdafhkdshfhdsahhjd')
        self.assertEqual(response.json['result'], 'not-word')
        
