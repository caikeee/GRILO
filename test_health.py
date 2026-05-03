"""Test HTTP request to health endpoint"""
import requests
import json

try:
    print("Testing server health endpoint...")
    response = requests.post("http://localhost:8000/health", json={})
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print("\n✅ Server is running and responding correctly!")
except Exception as e:
    print(f"❌ Error: {e}")
