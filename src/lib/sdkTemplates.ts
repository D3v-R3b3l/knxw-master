export const pythonWrapper = `import requests

class KnxwClient:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

    def track_event(self, user_id: str, event_type: str, event_payload=None, session_id=None):
        payload = {
            'user_id': user_id,
            'event_type': event_type,
            'event_payload': event_payload or {},
            'session_id': session_id
        }
        return requests.post(f'{self.base_url}/functions/api/v1/events', json=payload, headers=self.headers).json()

    def get_profile(self, user_id: str):
        return requests.post(f'{self.base_url}/functions/api/v1/profiles', json={'user_id': user_id}, headers=self.headers).json()

    def get_insights(self, user_id: str):
        return requests.post(f'{self.base_url}/functions/api/v1/insights', json={'user_id': user_id}, headers=self.headers).json()
`;

export const goWrapper = `package knxw

import (
  "bytes"
  "encoding/json"
  "net/http"
)

type Client struct {
  ApiKey  string
  BaseURL string
}

func NewClient(apiKey, baseURL string) *Client {
  return &Client{ApiKey: apiKey, BaseURL: baseURL}
}

func (c *Client) doPost(path string, payload any) (*http.Response, error) {
  body, _ := json.Marshal(payload)
  req, _ := http.NewRequest("POST", c.BaseURL+path, bytes.NewBuffer(body))
  req.Header.Set("Authorization", "Bearer "+c.ApiKey)
  req.Header.Set("Content-Type", "application/json")
  client := &http.Client{}
  return client.Do(req)
}

func (c *Client) TrackEvent(userID string, eventType string, eventPayload map[string]any) (*http.Response, error) {
  return c.doPost("/functions/api/v1/events", map[string]any{
    "user_id": userID,
    "event_type": eventType,
    "event_payload": eventPayload,
  })
}

func (c *Client) GetProfile(userID string) (*http.Response, error) {
  return c.doPost("/functions/api/v1/profiles", map[string]any{"user_id": userID})
}
`;

export const javaWrapper = `package com.knxw;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class KnxwClient {
    private final String apiKey;
    private final String baseUrl;
    private final HttpClient client;

    public KnxwClient(String apiKey, String baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.client = HttpClient.newHttpClient();
    }

    public HttpResponse<String> trackEvent(String jsonBody) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + "/functions/api/v1/events"))
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    public HttpResponse<String> getProfile(String jsonBody) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + "/functions/api/v1/profiles"))
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
`;