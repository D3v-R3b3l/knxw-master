import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, Zap, Gamepad2, Target, Gift, AlertTriangle, Webhook } from 'lucide-react';
import CodeBlock from './CodeBlock';
import Callout from './Callout';

export default function GameDevSDKDoc() {
  const unityExample = `using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.Networking;

public class KnxwGameDevClient : MonoBehaviour
{
    private const string API_KEY = "knxw_your_api_key_here";
    private const string BASE_URL = "https://your-app.base44.com/functions";
    
    private string playerId;
    private string sessionId;
    
    void Start()
    {
        playerId = SystemInfo.deviceUniqueIdentifier;
        sessionId = System.Guid.NewGuid().ToString();
        
        // Track player session start
        TrackEvent("session_start", new Dictionary<string, object>
        {
            { "platform", Application.platform.ToString() },
            { "version", Application.version }
        });
    }
    
    // Track behavioral events
    public void TrackEvent(string eventType, Dictionary<string, object> eventData = null)
    {
        StartCoroutine(SendEvent(eventType, eventData));
    }
    
    private IEnumerator SendEvent(string eventType, Dictionary<string, object> eventData)
    {
        var payload = new Dictionary<string, object>
        {
            { "player_id", playerId },
            { "event_type", eventType },
            { "session_id", sessionId },
            { "timestamp", System.DateTime.UtcNow.ToString("o") }
        };
        
        if (eventData != null)
        {
            payload["event_payload"] = eventData;
        }
        
        string jsonPayload = JsonUtility.ToJson(payload);
        
        using (UnityWebRequest request = new UnityWebRequest($"{BASE_URL}/api/v1/gamedev/events", "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonPayload);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("Authorization", $"Bearer {API_KEY}");
            
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Event tracked successfully");
            }
            else
            {
                Debug.LogError($"Failed to track event: {request.error}");
            }
        }
    }
    
    // Get player motivation profile
    public IEnumerator GetPlayerMotivation(System.Action<MotivationResponse> callback)
    {
        var payload = new Dictionary<string, object>
        {
            { "player_id", playerId }
        };
        
        string jsonPayload = JsonUtility.ToJson(payload);
        
        using (UnityWebRequest request = new UnityWebRequest($"{BASE_URL}/api/v1/gamedev/motivation", "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonPayload);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("Authorization", $"Bearer {API_KEY}");
            
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                string jsonResponse = request.downloadHandler.text;
                MotivationResponse response = JsonUtility.FromJson<MotivationResponse>(jsonResponse);
                callback?.Invoke(response);
            }
            else
            {
                Debug.LogError($"Failed to get motivation: {request.error}");
                callback?.Invoke(null);
            }
        }
    }
    
    // Get adaptive difficulty recommendation
    public IEnumerator GetAdaptiveDifficulty(float currentDifficulty, int recentDeaths, System.Action<DifficultyResponse> callback)
    {
        var payload = new Dictionary<string, object>
        {
            { "player_id", playerId },
            { "current_difficulty", currentDifficulty },
            { "recent_performance", new Dictionary<string, object>
                {
                    { "deaths", recentDeaths },
                    { "completions", 5 }
                }
            }
        };
        
        string jsonPayload = JsonUtility.ToJson(payload);
        
        using (UnityWebRequest request = new UnityWebRequest($"{BASE_URL}/api/v1/gamedev/difficulty", "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonPayload);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("Authorization", $"Bearer {API_KEY}");
            
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                string jsonResponse = request.downloadHandler.text;
                DifficultyResponse response = JsonUtility.FromJson<DifficultyResponse>(jsonResponse);
                callback?.Invoke(response);
            }
            else
            {
                Debug.LogError($"Failed to get difficulty: {request.error}");
                callback?.Invoke(null);
            }
        }
    }
    
    // Get personalized reward
    public IEnumerator GetPersonalizedReward(System.Action<RewardResponse> callback)
    {
        var payload = new Dictionary<string, object>
        {
            { "player_id", playerId }
        };
        
        string jsonPayload = JsonUtility.ToJson(payload);
        
        using (UnityWebRequest request = new UnityWebRequest($"{BASE_URL}/api/v1/gamedev/reward", "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonPayload);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("Authorization", $"Bearer {API_KEY}");
            
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                string jsonResponse = request.downloadHandler.text;
                RewardResponse response = JsonUtility.FromJson<RewardResponse>(jsonResponse);
                callback?.Invoke(response);
            }
            else
            {
                Debug.LogError($"Failed to get reward: {request.error}");
                callback?.Invoke(null);
            }
        }
    }
}

[System.Serializable]
public class MotivationResponse
{
    public bool success;
    public MotivationData data;
}

[System.Serializable]
public class MotivationData
{
    public string[] primary_motivations;
    public float confidence;
    public string player_type;
}

[System.Serializable]
public class DifficultyResponse
{
    public bool success;
    public DifficultyData data;
}

[System.Serializable]
public class DifficultyData
{
    public float recommended_difficulty;
    public string adjustment_reason;
    public float confidence;
}

[System.Serializable]
public class RewardResponse
{
    public bool success;
    public RewardData data;
}

[System.Serializable]
public class RewardData
{
    public string reward_type;
    public int quantity;
    public string rationale;
}`;

  const unrealExample = `// KnxwGameDevClient.h
#pragma once

#include "CoreMinimal.h"
#include "Http.h"
#include "Json.h"
#include "JsonUtilities.h"

class YOURGAME_API FKnxwGameDevClient
{
public:
    FKnxwGameDevClient(const FString& InAPIKey, const FString& InBaseURL);
    
    // Track behavioral events
    void TrackEvent(const FString& EventType, const TSharedPtr<FJsonObject>& EventData = nullptr);
    
    // Get player motivation profile
    void GetPlayerMotivation(TFunction<void(const TSharedPtr<FJsonObject>&)> Callback);
    
    // Get adaptive difficulty recommendation
    void GetAdaptiveDifficulty(float CurrentDifficulty, int32 RecentDeaths, TFunction<void(const TSharedPtr<FJsonObject>&)> Callback);
    
    // Get personalized reward
    void GetPersonalizedReward(TFunction<void(const TSharedPtr<FJsonObject>&)> Callback);
    
private:
    FString APIKey;
    FString BaseURL;
    FString PlayerID;
    FString SessionID;
    
    void SendRequest(const FString& Endpoint, const FString& Method, const TSharedPtr<FJsonObject>& Payload, TFunction<void(const TSharedPtr<FJsonObject>&)> Callback);
};

// KnxwGameDevClient.cpp
#include "KnxwGameDevClient.h"

FKnxwGameDevClient::FKnxwGameDevClient(const FString& InAPIKey, const FString& InBaseURL)
    : APIKey(InAPIKey), BaseURL(InBaseURL)
{
    PlayerID = FPlatformMisc::GetDeviceId();
    SessionID = FGuid::NewGuid().ToString();
}

void FKnxwGameDevClient::TrackEvent(const FString& EventType, const TSharedPtr<FJsonObject>& EventData)
{
    TSharedPtr<FJsonObject> Payload = MakeShareable(new FJsonObject);
    Payload->SetStringField("player_id", PlayerID);
    Payload->SetStringField("event_type", EventType);
    Payload->SetStringField("session_id", SessionID);
    Payload->SetStringField("timestamp", FDateTime::UtcNow().ToIso8601());
    
    if (EventData.IsValid())
    {
        Payload->SetObjectField("event_payload", EventData);
    }
    
    SendRequest("/api/v1/gamedev/events", "POST", Payload, nullptr);
}

void FKnxwGameDevClient::GetPlayerMotivation(TFunction<void(const TSharedPtr<FJsonObject>&)> Callback)
{
    TSharedPtr<FJsonObject> Payload = MakeShareable(new FJsonObject);
    Payload->SetStringField("player_id", PlayerID);
    
    SendRequest("/api/v1/gamedev/motivation", "POST", Payload, Callback);
}

void FKnxwGameDevClient::GetAdaptiveDifficulty(float CurrentDifficulty, int32 RecentDeaths, TFunction<void(const TSharedPtr<FJsonObject>&)> Callback)
{
    TSharedPtr<FJsonObject> Payload = MakeShareable(new FJsonObject);
    Payload->SetStringField("player_id", PlayerID);
    Payload->SetNumberField("current_difficulty", CurrentDifficulty);
    
    TSharedPtr<FJsonObject> Performance = MakeShareable(new FJsonObject);
    Performance->SetNumberField("deaths", RecentDeaths);
    Payload->SetObjectField("recent_performance", Performance);
    
    SendRequest("/api/v1/gamedev/difficulty", "POST", Payload, Callback);
}

void FKnxwGameDevClient::GetPersonalizedReward(TFunction<void(const TSharedPtr<FJsonObject>&)> Callback)
{
    TSharedPtr<FJsonObject> Payload = MakeShareable(new FJsonObject);
    Payload->SetStringField("player_id", PlayerID);
    
    SendRequest("/api/v1/gamedev/reward", "POST", Payload, Callback);
}

void FKnxwGameDevClient::SendRequest(const FString& Endpoint, const FString& Method, const TSharedPtr<FJsonObject>& Payload, TFunction<void(const TSharedPtr<FJsonObject>&)> Callback)
{
    TSharedRef<IHttpRequest> Request = FHttpModule::Get().CreateRequest();
    Request->SetURL(BaseURL + Endpoint);
    Request->SetVerb(Method);
    Request->SetHeader("Content-Type", "application/json");
    Request->SetHeader("Authorization", FString::Printf(TEXT("Bearer %s"), *APIKey));
    
    FString PayloadString;
    TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&PayloadString);
    FJsonSerializer::Serialize(Payload.ToSharedRef(), Writer);
    Request->SetContentAsString(PayloadString);
    
    Request->OnProcessRequestComplete().BindLambda([Callback](FHttpRequestPtr Request, FHttpResponsePtr Response, bool bSuccess)
    {
        if (bSuccess && Response.IsValid())
        {
            TSharedPtr<FJsonObject> JsonObject;
            TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(Response->GetContentAsString());
            
            if (FJsonSerializer::Deserialize(Reader, JsonObject) && JsonObject.IsValid())
            {
                if (Callback)
                {
                    Callback(JsonObject);
                }
            }
        }
    });
    
    Request->ProcessRequest();
}`;

  const playfabExample = `// PlayFab CloudScript example
// This runs server-side and can safely store your API key

const KNXW_API_KEY = "knxw_your_api_key_here";
const KNXW_BASE_URL = "https://your-app.base44.com/functions";

handlers.GetPlayerMotivation = function (args, context) {
    const playerId = context.currentPlayerId;
    
    const response = http.request(
        KNXW_BASE_URL + "/api/v1/gamedev/motivation",
        "POST",
        JSON.stringify({
            player_id: playerId
        }),
        "application/json",
        {
            "Authorization": "Bearer " + KNXW_API_KEY
        }
    );
    
    if (response.status === 200) {
        const data = JSON.parse(response);
        return {
            success: true,
            motivations: data.data.primary_motivations,
            playerType: data.data.player_type,
            confidence: data.data.confidence
        };
    } else {
        return {
            success: false,
            error: "Failed to get motivation data"
        };
    }
};

handlers.GetAdaptiveDifficulty = function (args, context) {
    const playerId = context.currentPlayerId;
    const currentDifficulty = args.currentDifficulty || 0.5;
    const recentDeaths = args.recentDeaths || 0;
    
    const response = http.request(
        KNXW_BASE_URL + "/api/v1/gamedev/difficulty",
        "POST",
        JSON.stringify({
            player_id: playerId,
            current_difficulty: currentDifficulty,
            recent_performance: {
                deaths: recentDeaths,
                completions: args.completions || 0
            }
        }),
        "application/json",
        {
            "Authorization": "Bearer " + KNXW_API_KEY
        }
    );
    
    if (response.status === 200) {
        const data = JSON.parse(response);
        return {
            success: true,
            recommendedDifficulty: data.data.recommended_difficulty,
            reason: data.data.adjustment_reason,
            confidence: data.data.confidence
        };
    } else {
        return {
            success: false,
            error: "Failed to get difficulty recommendation"
        };
    }
};

handlers.GetPersonalizedReward = function (args, context) {
    const playerId = context.currentPlayerId;
    
    const response = http.request(
        KNXW_BASE_URL + "/api/v1/gamedev/reward",
        "POST",
        JSON.stringify({
            player_id: playerId,
            inventory: args.inventory || [],
            session_stats: args.sessionStats || {}
        }),
        "application/json",
        {
            "Authorization": "Bearer " + KNXW_API_KEY
        }
    );
    
    if (response.status === 200) {
        const data = JSON.parse(response);
        return {
            success: true,
            rewardType: data.data.reward_type,
            quantity: data.data.quantity,
            rationale: data.data.rationale
        };
    } else {
        return {
            success: false,
            error: "Failed to get reward recommendation"
        };
    }
};`;

  const webhookVerifyExample = `// Webhook signature verification example (Node.js/Express)
const crypto = require('crypto');
const express = require('express');
const app = express();

app.use(express.json());

const WEBHOOK_SECRET = 'your_webhook_signing_secret';

function verifyWebhookSignature(payload, signature) {
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    hmac.update(JSON.stringify(payload));
    const expectedSignature = 'sha256=' + hmac.digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

app.post('/webhooks/knxw', (req, res) => {
    const signature = req.headers['x-knxw-signature'];
    const timestamp = req.headers['x-knxw-timestamp'];
    const eventType = req.headers['x-knxw-event-type'];
    
    // Verify timestamp is recent (within 5 minutes)
    const requestTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    if (Math.abs(currentTime - requestTime) > 300000) {
        return res.status(400).json({ error: 'Request timestamp too old' });
    }
    
    // Verify signature
    if (!verifyWebhookSignature(req.body, signature)) {
        return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Handle the webhook event
    console.log('Received webhook:', eventType, req.body);
    
    switch (eventType) {
        case 'player.sentiment':
            // Handle player sentiment change
            break;
        case 'player.churn_risk':
            // Handle churn risk flag
            break;
        case 'player.motivation_shift':
            // Handle motivation change
            break;
    }
    
    res.json({ success: true });
});

app.listen(3000, () => {
    console.log('Webhook server running on port 3000');
});`;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Gamepad2 className="w-8 h-8 text-[#00d4ff]" />
          <h1 className="text-3xl font-bold text-white">GameDev SDK Documentation</h1>
        </div>
        <p className="text-lg text-[#a3a3a3]">
          Real-time psychographic intelligence for games. Integrate knXw into Unity, Unreal Engine, Godot, 
          or PlayFab to deliver adaptive difficulty, personalized rewards, and player retention insights.
        </p>
      </div>

      <Alert className="bg-[#00d4ff]/10 border-[#00d4ff]/30">
        <Zap className="w-4 h-4 text-[#00d4ff]" />
        <AlertDescription className="text-[#e5e5e5]">
          <strong>Edge-Optimized:</strong> All GameDev endpoints are deployed to edge locations for ultra-low latency 
          (p95 &lt; 150ms). Perfect for real-time game loops.
        </AlertDescription>
      </Alert>

      {/* Quick Start */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 text-[#fbbf24]" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-[#e5e5e5]">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Get Your API Key</h3>
            <p className="text-sm text-[#a3a3a3]">
              Navigate to Developer → API Keys and create a new key with GameDev scope.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">2. Track Player Events</h3>
            <p className="text-sm text-[#a3a3a3]">
              Send behavioral events (level completions, purchases, time spent) to build psychographic profiles.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">3. Query Real-Time APIs</h3>
            <p className="text-sm text-[#a3a3a3]">
              Call motivation, difficulty, reward, or churn endpoints to personalize player experiences in real-time.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">4. Configure Webhooks (Optional)</h3>
            <p className="text-sm text-[#a3a3a3]">
              Set up HMAC-signed webhooks to receive player sentiment changes, churn alerts, and motivation shifts.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Code className="w-5 h-5 text-[#00d4ff]" />
            Integration Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="unity" className="w-full">
            <TabsList className="bg-[#1a1a1a] border border-[#262626]">
              <TabsTrigger value="unity">Unity (C#)</TabsTrigger>
              <TabsTrigger value="unreal">Unreal (C++)</TabsTrigger>
              <TabsTrigger value="playfab">PlayFab CloudScript</TabsTrigger>
              <TabsTrigger value="webhooks">Webhook Verification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="unity" className="mt-4">
              <CodeBlock language="csharp" code={unityExample} />
            </TabsContent>
            
            <TabsContent value="unreal" className="mt-4">
              <CodeBlock language="cpp" code={unrealExample} />
            </TabsContent>
            
            <TabsContent value="playfab" className="mt-4">
              <CodeBlock language="javascript" code={playfabExample} />
            </TabsContent>
            
            <TabsContent value="webhooks" className="mt-4">
              <CodeBlock language="javascript" code={webhookVerifyExample} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="w-5 h-5 text-[#ec4899]" />
            Available Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-[#10b981] text-white">POST</Badge>
                <code className="text-sm text-[#00d4ff]">/api/v1/gamedev/events</code>
              </div>
              <p className="text-sm text-[#a3a3a3]">
                Track player behavioral events to build psychographic profiles.
              </p>
            </div>
            
            <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-[#10b981] text-white">POST</Badge>
                <code className="text-sm text-[#00d4ff]">/api/v1/gamedev/motivation</code>
              </div>
              <p className="text-sm text-[#a3a3a3]">
                Get player's primary motivations and player type classification.
              </p>
            </div>
            
            <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-[#10b981] text-white">POST</Badge>
                <code className="text-sm text-[#00d4ff]">/api/v1/gamedev/difficulty</code>
              </div>
              <p className="text-sm text-[#a3a3a3]">
                Get adaptive difficulty recommendations based on player psychology and performance.
              </p>
            </div>
            
            <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-[#10b981] text-white">POST</Badge>
                <code className="text-sm text-[#00d4ff]">/api/v1/gamedev/reward</code>
              </div>
              <p className="text-sm text-[#a3a3a3]">
                Get personalized reward recommendations based on player motivations.
              </p>
            </div>
            
            <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-[#10b981] text-white">POST</Badge>
                <code className="text-sm text-[#00d4ff]">/api/v1/gamedev/churn</code>
              </div>
              <p className="text-sm text-[#a3a3a3]">
                Get churn risk score and retention recommendations for players.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Events */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Webhook className="w-5 h-5 text-[#8b5cf6]" />
            Webhook Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#a3a3a3]">
            Configure webhooks to receive real-time notifications about player psychological state changes.
            All webhooks are signed with HMAC-SHA256 for security.
          </p>
          
          <div className="space-y-3">
            <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-[#00d4ff]/20 text-[#00d4ff]">player.sentiment</Badge>
              </div>
              <p className="text-sm text-[#a3a3a3]">
                Fired when a player's emotional state changes significantly (e.g., frustrated → engaged).
              </p>
            </div>
            
            <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-[#ec4899]/20 text-[#ec4899]">player.churn_risk</Badge>
              </div>
              <p className="text-sm text-[#a3a3a3]">
                Fired when a player's churn risk crosses a threshold (e.g., low → medium → high).
              </p>
            </div>
            
            <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-[#fbbf24]/20 text-[#fbbf24]">player.motivation_shift</Badge>
              </div>
              <p className="text-sm text-[#a3a3a3]">
                Fired when a player's primary motivation changes (e.g., achievement → social).
              </p>
            </div>
            
            <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-[#10b981]/20 text-[#10b981]">player.flag</Badge>
              </div>
              <p className="text-sm text-[#a3a3a3]">
                Fired for custom player flags (e.g., whale detected, toxic behavior, achievement unlocked).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5 text-[#fbbf24]" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Callout type="info" title="Rate Limiting">
            GameDev endpoints have a default limit of 1000 requests/minute per API key. 
            Implement client-side throttling and caching for optimal performance.
          </Callout>
          
          <Callout type="warning" title="Latency Optimization">
            Call motivation/difficulty/reward APIs asynchronously and cache results for 30-60 seconds 
            to avoid blocking the game loop.
          </Callout>
          
          <Callout type="info" title="Webhook Security">
            Always verify webhook signatures using HMAC-SHA256 and check timestamp freshness 
            (reject requests older than 5 minutes) to prevent replay attacks.
          </Callout>
          
          <Callout type="success" title="Error Handling">
            All endpoints return confidence scores. Use fallback logic when confidence &lt; 0.5 
            to ensure graceful degradation.
          </Callout>
        </CardContent>
      </Card>
    </div>
  );
}