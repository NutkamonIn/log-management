import json
import requests
import sys

API_URL = "https://log.demo-labs.site/api/v1"

def login(username, password):
    res = requests.post(f"{API_URL}/login", json={"username": username, "password": password})
    if res.status_code == 200:
        return res.json().get("access_token")
    else:
        print("Login failed:", res.text)
        sys.exit(1)

def send_log(token, log_file):
    with open(log_file, 'r') as f:
        log_data = json.load(f)

    headers = {"Authorization": f"Bearer {token}"}
    res = requests.post(f"{API_URL}/ingest", json=log_data, headers=headers)
    if res.status_code == 200:
        print("Log sent successfully!")
    else:
        print("Failed to send log:", res.text)

if __name__ == "__main__":
    print("Logging in...")
    token = login("admin", "adminpassword")
    print("Sending log from sample_crowdstrike.json...")
    send_log(token, "sample_crowdstrike.json")
