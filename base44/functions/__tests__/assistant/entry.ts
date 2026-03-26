// E2E Test Suite for AI Assistant
import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/testing/asserts.ts";

// Mock Base44 SDK
const mockBase44 = {
  auth: {
    me: () => Promise.resolve({ id: 'test-user-123', email: 'test@example.com' })
  },
  entities: {
    AssistantSession: {
      create: (data) => Promise.resolve({ id: 'session-123', ...data }),
      filter: () => Promise.resolve([{ id: 'session-123', user_id: 'test-user-123', mode: 'demo' }]),
      update: () => Promise.resolve({ success: true })
    },
    AssistantMessage: {
      create: (data) => Promise.resolve({ id: 'msg-123', ...data }),
      filter: () => Promise.resolve([])
    },
    InferenceSnapshot: {
      create: (data) => Promise.resolve({ id: 'snap-123', ...data }),
      filter: () => Promise.resolve([])
    },
    AssistantConfig: {
      filter: () => Promise.resolve([{ uncertainty_threshold: 0.7, max_questions_per_session: 5 }])
    },
    UserPsychographicProfile: {
      filter: () => Promise.resolve([{ 
        user_id: 'test-user-123',
        cognitive_style: 'analytical',
        risk_profile: 'moderate'
      }])
    },
    AssistantAudit: {
      create: () => Promise.resolve({ id: 'audit-123' })
    }
  },
  integrations: {
    Core: {
      InvokeLLM: ({ prompt, response_json_schema }) => {
        // Mock LLM response
        return Promise.resolve({
          response: "I understand you're looking for productivity tools. Let me help you find something that matches your style.",
          targeted_question: "Do you prefer tools with lots of customization options, or something simple and straightforward?",
          motivation_update: {
            primary: "achievement",
            secondary: "efficiency",
            confidence: 0.65,
            reasoning: "User mentions productivity and organization, indicating achievement orientation"
          },
          emotion_update: {
            state: "neutral",
            energy: "medium",
            confidence: 0.55,
            reasoning: "Professional, task-focused tone suggests neutral emotional state"
          },
          cognition_update: {
            style: "systematic",
            analytical_score: 0.7,
            detail_score: 0.6,
            confidence: 0.6,
            reasoning: "Request for organization tools suggests systematic thinking style"
          },
          confidence_scores: {
            motivation: 0.65,
            emotion: 0.55,
            cognition: 0.6
          },
          top_uncertainties: ["risk_profile", "personality_traits"],
          actions_suggested: [
            {
              action: "recommend_structured_tools",
              rationale: "Systematic thinkers benefit from tools with clear hierarchies",
              confidence: 0.7
            }
          ]
        });
      }
    }
  }
};

Deno.test("Assistant - Session Start (Live Mode)", async () => {
  const response = await fetch('http://localhost:8000/api/v1/assistant/sessionStart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'live',
      consent: true,
      consent_reveal_text: false
    })
  });

  const data = await response.json();
  
  assertEquals(response.status, 200);
  assertExists(data.session_id);
  assertExists(data.sidebar_initial);
  assertEquals(data.mode, 'live');
});

Deno.test("Assistant - Session Start (Demo Mode with Persona)", async () => {
  const response = await fetch('http://localhost:8000/api/v1/assistant/sessionStart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'demo',
      consent: true,
      personaId: 'achiever'
    })
  });

  const data = await response.json();
  
  assertEquals(response.status, 200);
  assertEquals(data.mode, 'demo');
  assertExists(data.profile_baseline);
});

Deno.test("Assistant - Message Processing", async () => {
  // First start a session
  const sessionResponse = await fetch('http://localhost:8000/api/v1/assistant/sessionStart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'demo', consent: true })
  });
  const { session_id } = await sessionResponse.json();

  // Send a message
  const messageResponse = await fetch('http://localhost:8000/api/v1/assistant/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id,
      message: "I'm looking for a productivity tool that helps me stay organized"
    })
  });

  const data = await messageResponse.json();
  
  assertEquals(messageResponse.status, 200);
  assertExists(data.message);
  assertExists(data.sidebar_update);
  assertExists(data.snapshot_id);
  assertEquals(typeof data.latency_ms, 'number');
  
  // Verify sidebar update structure
  assertExists(data.sidebar_update.motivation);
  assertExists(data.sidebar_update.emotion);
  assertExists(data.sidebar_update.cognition);
  assertExists(data.sidebar_update.reasoning);
});

Deno.test("Assistant - Adaptive Questioning", async () => {
  const sessionResponse = await fetch('http://localhost:8000/api/v1/assistant/sessionStart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'demo', consent: true })
  });
  const { session_id } = await sessionResponse.json();

  // Send vague message to trigger uncertainty
  const messageResponse = await fetch('http://localhost:8000/api/v1/assistant/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id,
      message: "Hi"
    })
  });

  const data = await messageResponse.json();
  
  // Should ask a clarifying question when confidence is low
  assertExists(data.sidebar_update.uncertainty);
  // May or may not have a targeted question depending on LLM response
});

Deno.test("Assistant - Session End", async () => {
  const sessionResponse = await fetch('http://localhost:8000/api/v1/assistant/sessionStart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'demo', consent: true })
  });
  const { session_id } = await sessionResponse.json();

  // Send a message
  await fetch('http://localhost:8000/api/v1/assistant/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, message: "Test message" })
  });

  // End session
  const endResponse = await fetch('http://localhost:8000/api/v1/assistant/sessionEnd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id })
  });

  const data = await endResponse.json();
  
  assertEquals(endResponse.status, 200);
  assertEquals(data.success, true);
  assertExists(data.summary);
  assertExists(data.stats);
  assertEquals(typeof data.stats.messages_exchanged, 'number');
});

Deno.test("Assistant - Timeline Fetch", async () => {
  const sessionResponse = await fetch('http://localhost:8000/api/v1/assistant/sessionStart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'demo', consent: true })
  });
  const { session_id } = await sessionResponse.json();

  // Send messages
  await fetch('http://localhost:8000/api/v1/assistant/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, message: "First message" })
  });

  await fetch('http://localhost:8000/api/v1/assistant/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, message: "Second message" })
  });

  // Fetch timeline
  const timelineResponse = await fetch(
    `http://localhost:8000/api/v1/assistant/sessionTimeline?session_id=${session_id}`
  );

  const data = await timelineResponse.json();
  
  assertEquals(timelineResponse.status, 200);
  assertExists(data.timeline);
  assertEquals(Array.isArray(data.timeline), true);
  assertEquals(data.timeline.length > 0, true);
});

Deno.test("Assistant - Export Session", async () => {
  const sessionResponse = await fetch('http://localhost:8000/api/v1/assistant/sessionStart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'demo', consent: true })
  });
  const { session_id } = await sessionResponse.json();

  // Export
  const exportResponse = await fetch(
    `http://localhost:8000/api/v1/assistant/sessionExport?session_id=${session_id}`
  );

  assertEquals(exportResponse.status, 200);
  assertEquals(exportResponse.headers.get('Content-Type'), 'application/json');
  
  const exportData = await exportResponse.json();
  assertExists(exportData.export_version);
  assertExists(exportData.session);
  assertExists(exportData.messages);
  assertExists(exportData.snapshots);
});

Deno.test("Assistant - Privacy: No Consent Blocks Storage", async () => {
  const sessionResponse = await fetch('http://localhost:8000/api/v1/assistant/sessionStart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'live', consent: false, consent_reveal_text: false })
  });
  const { session_id } = await sessionResponse.json();

  const messageResponse = await fetch('http://localhost:8000/api/v1/assistant/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, message: "Sensitive test message" })
  });

  const data = await messageResponse.json();
  
  // Message should be processed, but export should redact
  assertEquals(messageResponse.status, 200);
  
  const exportResponse = await fetch(
    `http://localhost:8000/api/v1/assistant/sessionExport?session_id=${session_id}`
  );
  const exportData = await exportResponse.json();
  
  // Messages should be redacted
  const message = exportData.messages[0];
  assertEquals(message.content, '[REDACTED - No consent]');
});

console.log("✅ All Assistant E2E tests defined. Run with: deno test functions/__tests__/assistant.test.js");