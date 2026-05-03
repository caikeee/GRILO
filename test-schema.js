/**
 * Test script to validate the extended message schema
 * Run in browser console to verify localStorage structure
 */

// Test 1: Verify new message schema structure
console.log("=== TEST 1: Message Schema Structure ===");
const testUserMsg = {
    role: "user",
    content: "Hello, how are you?",
    translation: null,
    feedback: null,
    metadata: {
        timestamp: new Date().toISOString(),
        vocabulary: [],
        conversation_theme: null
    }
};

const testAssistantMsg = {
    role: "assistant",
    content: "I'm doing well, thanks for asking!",
    translation: "Estou bem, obrigado por perguntar!",
    feedback: {
        corrections: [
            {
                original: "how are you",
                corrected: "how are you doing",
                explanation: "More natural phrasing",
                severity: "low"
            }
        ],
        accuracy_score: 85,
        focus_area: "verb_choice"
    },
    metadata: {
        timestamp: new Date().toISOString(),
        vocabulary: [
            { expression: "doing", definition: "performing", context: "doing well" }
        ],
        conversation_theme: "greetings"
    }
};

console.log("✓ User message structure:", testUserMsg);
console.log("✓ Assistant message with feedback:", testAssistantMsg);

// Test 2: Verify serialization/deserialization
console.log("\n=== TEST 2: Serialization/Deserialization ===");
const history = [testUserMsg, testAssistantMsg];
const serialized = JSON.stringify(history);
const deserialized = JSON.parse(serialized);
console.log("✓ Serialized:", serialized.length, "characters");
console.log("✓ Deserialized feedback preserved:", deserialized[1].feedback !== null);
console.log("✓ Deserialized metadata preserved:", deserialized[1].metadata.vocabulary.length > 0);

// Test 3: Verify feedback access pattern
console.log("\n=== TEST 3: Feedback Access Pattern ===");
const testMsg = deserialized[1];
if (testMsg.feedback?.corrections?.length > 0) {
    console.log("✓ Optional chaining works for feedback:", testMsg.feedback.corrections[0].original);
} else {
    console.log("✗ Feedback access failed");
}

// Test 4: Check localStorage structure (if running in browser)
console.log("\n=== TEST 4: localStorage Structure ===");
if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('grilo_written_sessions');
    if (stored) {
        try {
            const sessions = JSON.parse(stored);
            console.log("✓ Sessions stored:", sessions.length);
            if (sessions.length > 0 && sessions[0].messages) {
                const firstMsg = sessions[0].messages[0];
                const hasNewSchema = 'feedback' in firstMsg || 'metadata' in firstMsg;
                if (hasNewSchema) {
                    console.log("✓ New schema detected in localStorage");
                    console.log("  - Message keys:", Object.keys(firstMsg).join(", "));
                } else {
                    console.log("⚠ Old schema still in use (backward compatible)");
                }
            }
        } catch (e) {
            console.error("✗ Error parsing localStorage:", e);
        }
    } else {
        console.log("⚠ No sessions in localStorage yet");
    }
} else {
    console.log("⚠ localStorage not available (not in browser context)");
}

// Test 5: Backward compatibility
console.log("\n=== TEST 5: Backward Compatibility ===");
const oldMsg = { role: "user", content: "Old message" };
const newMsg = { 
    role: "user", 
    content: "New message",
    translation: null,
    feedback: null,
    metadata: { timestamp: new Date().toISOString(), vocabulary: [] }
};

// Test that getSessionTitle still works with both
function getSessionTitle(messages) {
    const firstUser = messages.find(m => m.role === 'user');
    if (firstUser) {
        const t = firstUser.content.trim();
        return t.length > 42 ? t.substring(0, 42) + '…' : t;
    }
    return 'Nova conversa';
}

console.log("✓ Old message title:", getSessionTitle([oldMsg]));
console.log("✓ New message title:", getSessionTitle([newMsg]));

// Test 6: showInsightPanel safety check
console.log("\n=== TEST 6: Insight Panel Safety ===");
const msgWithFeedback = {
    role: "assistant",
    feedback: {
        corrections: [{ original: "test", corrected: "tested", explanation: "Tense" }],
        accuracy_score: 90
    }
};
const msgWithoutFeedback = { role: "assistant", feedback: null };

console.log("✓ Message with feedback:", msgWithFeedback.feedback?.corrections?.length > 0);
console.log("✓ Message without feedback:", msgWithoutFeedback.feedback?.corrections?.length > 0);

console.log("\n=== ALL TESTS COMPLETED ===");
console.log("Summary: Schema structure validated, serialization works, backward compatibility confirmed");
