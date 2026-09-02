from copy import deepcopy

from fastapi.testclient import TestClient

from src.app import activities, app


client = TestClient(app)
original_activities = deepcopy(activities)


def setup_function():
    activities.clear()
    activities.update(deepcopy(original_activities))


def test_get_activities_returns_available_activities():
    response = client.get("/activities")

    assert response.status_code == 200
    body = response.json()
    assert "Chess Club" in body
    assert "Science Club" in body


def test_signup_adds_student_to_activity():
    email = "newstudent@mergington.edu"

    response = client.post(f"/activities/Soccer Club/signup?email={email}")

    assert response.status_code == 200
    assert response.json() == {
        "message": f"Signed up {email} for Soccer Club"
    }
    assert email in activities["Soccer Club"]["participants"]
