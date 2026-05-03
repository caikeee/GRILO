# 🚀 Voice Help Shadowing - Testing & Deployment Guide

## Quick Start (5 minutes)

### Step 1: Start Backend
```bash
cd backend
python start_server.py
```

✅ Database tables auto-created on first run

### Step 2: Get Authentication Token
```bash
# If you have a test user
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Response will include "access_token"
# Use this token for all subsequent requests
```

### Step 3: Test Single Shadowing Request
```bash
curl -X POST http://localhost:8000/api/voice-chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Yes, I do",
    "language": "en",
    "level": "b1",
    "voice_mode": "free",
    "shadow_mode": {
      "expected_text": "Yes, I do",
      "user_attempts": 1,
      "final_score": 91,
      "pronunciation_errors": [],
      "auto_progressed": false,
      "skipped": false,
      "reason": null
    }
  }'
```

✅ Should return normal voice-chat response

### Step 4: Verify Data Was Stored
```bash
curl http://localhost:8000/api/voice/shadow-analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

✅ Should show `"total_shadow_attempts": 1` and `"average_score": 91`

---

## Full Integration Test Suite

### Run Automated Tests
```bash
python backend/test_shadow_mode.py --user-token YOUR_TOKEN
```

This runs 6 tests:
1. ✅ Success path (score ≥85%, 1 attempt)
2. ✅ Medium path (score 70-84%, 2 attempts)  
3. ✅ Auto-progress path (score <50%, 3 attempts)
4. ✅ Skip path (user clicked skip)
5. ✅ Query difficulties endpoint
6. ✅ Query analytics endpoint

---

## Manual Testing (Curl Commands)

### Test 1: Successful Attempt (Immediate Success)
```bash
TOKEN="your_token_here"

curl -X POST http://localhost:8000/api/voice-chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Yes, I do",
    "language": "en",
    "level": "b1",
    "voice_mode": "free",
    "shadow_mode": {
      "expected_text": "Yes, I do",
      "user_attempts": 1,
      "final_score": 95,
      "pronunciation_errors": [],
      "auto_progressed": false,
      "skipped": false
    }
  }'
```

### Test 2: Medium Quality (Needs Retry)
```bash
curl -X POST http://localhost:8000/api/voice-chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "No, I do not",
    "language": "en",
    "level": "b1",
    "voice_mode": "free",
    "shadow_mode": {
      "expected_text": "No, I do not",
      "user_attempts": 2,
      "final_score": 78,
      "pronunciation_errors": [],
      "auto_progressed": false,
      "skipped": false
    }
  }'
```

### Test 3: Auto-Progress (Max Attempts)
```bash
curl -X POST http://localhost:8000/api/voice-chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I cannot help you right now",
    "language": "en",
    "level": "b1",
    "voice_mode": "free",
    "shadow_mode": {
      "expected_text": "I cannot help you right now",
      "user_attempts": 3,
      "final_score": 42,
      "pronunciation_errors": ["cannot", "help"],
      "auto_progressed": true,
      "skipped": false,
      "reason": "max_attempts_exhausted"
    }
  }'
```

### Test 4: Skipped
```bash
curl -X POST http://localhost:8000/api/voice-chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need to think about it",
    "language": "en",
    "level": "b1",
    "voice_mode": "free",
    "shadow_mode": {
      "expected_text": "I need to think about it",
      "user_attempts": 2,
      "final_score": 68,
      "pronunciation_errors": [],
      "auto_progressed": false,
      "skipped": true,
      "reason": null
    }
  }'
```

### Test 5: Query Difficulties
```bash
curl http://localhost:8000/api/voice/shadow-difficulties \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "difficulties": [
    {
      "phrase": "I cannot help you right now",
      "attempts": 3,
      "score": 42,
      "reason": "max_attempts_exhausted",
      "difficulty_type": null,
      "timestamp": "2026-04-25T10:30:00"
    }
  ],
  "total": 1
}
```

### Test 6: Query Analytics
```bash
curl http://localhost:8000/api/voice/shadow-analytics \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "total_shadow_attempts": 4,
  "success_rate": 25.0,
  "average_score": 78.5,
  "auto_progressed_count": 1,
  "skipped_count": 1,
  "most_difficult_phrases": [
    {
      "phrase": "I cannot help you right now",
      "avg_attempts": 3.0,
      "avg_score": 42.0,
      "occurrences": 1
    }
  ]
}
```

---

## Database Verification

### Check Data in SQLite
```bash
# If using SQLite, open with:
sqlite3 backend/grilo.db

# Then run queries:
SELECT COUNT(*) FROM shadow_mode_analytics;
SELECT * FROM shadow_mode_analytics ORDER BY created_at DESC LIMIT 5;

# Or from terminal:
sqlite3 backend/grilo.db "SELECT * FROM shadow_mode_analytics LIMIT 10;"
```

### Check Data in PostgreSQL
```bash
psql $DATABASE_URL

SELECT * FROM shadow_mode_analytics ORDER BY created_at DESC LIMIT 10;
SELECT user_id, COUNT(*) as total_attempts FROM shadow_mode_analytics GROUP BY user_id;
```

---

## Frontend-Backend Integration Test

### With Frontend Running

1. Open browser to `http://localhost:3000` (or wherever frontend runs)
2. Start voice chat
3. Receive AI question
4. Click "Ajuda" button
5. Click "Usar resposta" on any suggestion
6. **Overlay should appear** with:
   - Large text: "Fale: Yes, I do"
   - Small text: "(yés ái dú)"
   - Counter: "Tentativa 1/3"
   - Button: "🎤 Falar"
7. Speak the phrase
8. **Feedback appears**:
   - Score: 85%+? → "🌟 Perfeito!"
   - Score: 70-84%? → "🎯 Muito bom!"
   - Score: <70%? → "🔄 Tentar de novo"
9. Backend receives data in logs: `[SHADOW-MODE] User X | ...`
10. Check analytics endpoint confirms data stored

---

## Troubleshooting

### Issue: Table Not Created
**Solution:**
```python
# In Python shell:
from backend.database import engine
from backend.db_models import Base
Base.metadata.create_all(bind=engine)
```

### Issue: 422 Validation Error
**Check:**
- `user_attempts` is 1-3
- `final_score` is 0-100
- All required fields present

### Issue: No Data in Analytics Query
**Check:**
1. Request has `shadow_mode` field
2. API returned 200 (check logs)
3. User ID is correct
4. Database file/connection is correct

### Issue: Slow Analytics Query
**Solution:**
```sql
CREATE INDEX idx_shadow_user_date ON shadow_mode_analytics(user_id, created_at DESC);
```

---

## Performance Metrics

| Operation | Time | Notes |
|---|---|---|
| POST /api/voice-chat with shadow | <200ms | Async processing |
| GET /api/voice/shadow-difficulties | <100ms | Simple query |
| GET /api/voice/shadow-analytics | <200ms | Aggregation query |

---

## Deployment Checklist

- [ ] Backend running without errors
- [ ] Database tables created
- [ ] Authentication tokens working
- [ ] POST /api/voice-chat accepts shadow_mode
- [ ] Data stored in shadow_mode_analytics table
- [ ] GET /api/voice/shadow-difficulties works
- [ ] GET /api/voice/shadow-analytics works
- [ ] Frontend sending shadow_mode on help response
- [ ] Overlay displays correctly on frontend
- [ ] Feedback messages show correctly
- [ ] Analytics appear in dashboard (future)

---

## Next Steps

### Week 1: Monitoring
- Watch logs for `[SHADOW-MODE]` entries
- Verify data accumulation
- Check success_rate and avg_score trends

### Week 2: Dashboard
- Display `/api/voice/shadow-analytics` in user dashboard
- Show "most difficult phrases" card
- Add "Difficulty Rate: X%" metric

### Week 3: Adaptation
- Reapresent auto-progressed phrases weekly
- Suggest "Focus Challenge" on weak areas
- Recommend mode switch if failure rate >40%

### Month 2+
- ML model for phonetic difficulty prediction
- Teacher dashboard to export user data
- Personalized learning recommendations

---

## Support

For issues or questions:
1. Check backend logs: grep `[SHADOW-MODE]` in server output
2. Run test suite: `python test_shadow_mode.py --user-token TOKEN`
3. Verify database: `sqlite3 grilo.db ".tables"`
4. Check schemas: Both `schemas.py` and `db_models.py` have detailed docs
