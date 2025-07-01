import sys
import os

# Add backend to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app

app = create_app()

import pytest

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_login_route_exists(client):
    response = client.post('/login', json={
        "username": "testuser",
        "password": "testpass"
    })
    assert response.status_code in [200, 401, 400]
