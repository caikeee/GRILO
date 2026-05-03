# Backend Implementation - Voice Help Shadowing ✅

## Files Modified

### 1. **backend/schemas.py**
- Added `ShadowModeData` schema
- Extended `ChatRequest` with optional `shadow_mode` field
- Validation for attempts (1-3) and score (0-100)

```python
class ShadowModeData(BaseModel):
    expected_text: str
    user_attempts: int  # 1-3
    final_score: int  # 0-100
    pronunciation_errors: Optional[List[str]] = None
    auto_progressed: bool = False
    skipped: bool = False
    reason: Optional[str] = None
```

### 2. **backend/db_models.py**
- Added `ShadowModeAnalytic` SQLAlchemy model
- Fields: user_id, expected_text, attempts, score, errors, auto_progressed, skipped, reason
- Indexes on user_id and created_at for fast queries
- Contextual fields: voice_mode, user_level, conversation_topic

```python
class ShadowModeAnalytic(Base):
    __tablename__ = "shadow_mode_analytics"
    # Tracks: expected phrase, user attempts, final score, errors, auto-progress flag
```

### 3. **backend/controllers/chat_voice_controller.py**
- Added `process_shadow_mode_analytics()` function
- Modified `/api/voice-chat` endpoint to process shadow_mode
- Added `/api/voice/shadow-difficulties` - GET user's pronunciation struggles
- Added `/api/voice/shadow-analytics` - GET aggregated statistics
- Imports: ShadowModeAnalytic, ShadowModeData

## API Endpoint Changes

### POST `/api/voice-chat` (Modified)

**Request (same structure, with new optional field):**
```json
{
  "message": "Yes, I do",
  "language": "en",
  "history": [...],
  "level": "b1",
  "voice_mode": "free",
  "conversation_topic": null,
  "bilingual_mode": false,
  
  "shadow_mode": {
    "expected_text": "Yes, I do",
    "user_attempts": 2,
    "final_score": 87,
    "pronunciation_errors": [],
    "auto_progressed": false,
    "skipped": false,
    "reason": null
  }
}
```

**Response (unchanged):**
```json
{
  "response": "Great! Continue...",
  "translation_pt": "Ótimo! Continue...",
  "correction": null,
  "voice_mode": "free",
  "success": true,
  "execution_time_ms": 250,
  "xp_earned": 8,
  "total_xp": 480,
  "level_up": false,
  "new_level": 1
}
```

**New Behavior:**
- If `shadow_mode` is present, processes and stores analytics
- Doesn't affect response or conversation flow
- Logs success/errors separately
- Stores in `shadow_mode_analytics` table

### GET `/api/voice/shadow-difficulties` (New)

**Response:**
```json
{
  "difficulties": [
    {
      "phrase": "Yes, I do",
      "attempts": 3,
      "score": 45,
      "reason": "max_attempts_exhausted",
      "difficulty_type": "Positiva",
      "timestamp": "2026-04-25T10:30:00"
    }
  ],
  "total": 1
}
```

**Use Case:**
- Dashboard: show phrases user struggled with
- Future: reapresent difficult phrases
- Pedagogical: identify pronunciation weaknesses

### GET `/api/voice/shadow-analytics` (New)

**Response:**
```json
{
  "total_shadow_attempts": 47,
  "success_rate": 72.34,
  "average_score": 78.5,
  "auto_progressed_count": 5,
  "skipped_count": 3,
  "most_difficult_phrases": [
    {
      "phrase": "reservation",
      "avg_attempts": 2.4,
      "avg_score": 52.3,
      "occurrences": 5
    }
  ]
}
```

**Use Case:**
- Dashboard metric widget
- Weekly report generation
- Identify phonetic patterns (e.g., always struggles with "r" sounds)
- Trigger adaptive mode switching

## Database Schema

### `shadow_mode_analytics` Table

| Column | Type | Notes |
|---|---|---|
| id | Integer (PK) | Auto-increment |
| user_id | Integer (FK) | Index for fast queries |
| expected_text | Text | What user was supposed to say |
| user_attempts | Integer | 1-3 |
| final_score | Integer | 0-100 |
| pronunciation_errors | JSON | List of words with errors |
| auto_progressed | Boolean | True if 3 attempts exhausted |
| skipped | Boolean | True if user clicked skip |
| reason | String | e.g., "max_attempts_exhausted" |
| response_kind | String | "Positiva", "Negativa", "Mudar rumo" |
| voice_mode | String | "free", "guided", "shadow", etc |
| user_level | String | "a1", "a2", "b1", "b2", "c1", "c2" |
| conversation_topic | String | "restaurant", "airport", etc |
| created_at | DateTime (Index) | Timestamp |

## Setup Instructions

### 1. Create Table (Auto-migration)

When you start the backend, SQLAlchemy will create the table automatically:

```bash
cd backend
python start_server.py
```

The `ShadowModeAnalytic` model will be created from the ORM.

### 2. Manual Migration (Optional - Alembic)

If using Alembic for migrations:

```bash
# Generate migration
alembic revision --autogenerate -m "Add shadow_mode_analytics table"

# Apply migration
alembic upgrade head
```

### 3. Test the Implementation

**Test 1: Send shadow_mode data**
```bash
curl -X POST http://localhost:8000/api/voice-chat \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Yes, I do",
    "language": "en",
    "level": "b1",
    "voice_mode": "free",
    "shadow_mode": {
      "expected_text": "Yes, I do",
      "user_attempts": 2,
      "final_score": 87,
      "pronunciation_errors": [],
      "auto_progressed": false,
      "skipped": false,
      "reason": null
    }
  }'
```

**Test 2: Query difficulties**
```bash
curl http://localhost:8000/api/voice/shadow-difficulties \
  -H "Authorization: Bearer {token}"
```

**Test 3: Query analytics**
```bash
curl http://localhost:8000/api/voice/shadow-analytics \
  -H "Authorization: Bearer {token}"
```

## Key Implementation Details

### Async Processing
- `process_shadow_mode_analytics()` is async but doesn't block voice response
- Errors logged but don't fail the conversation
- Designed for low latency

### Data Storage
- 20-character limit on some strings (response_kind, reason)
- JSON for arrays (pronunciation_errors)
- Timestamps in UTC
- Indexes on frequently-queried fields

### Pedagogical Use Cases

**Week 1-2: Observation**
- Collect data on what's hard for each user
- Identify patterns (e.g., "always struggles with /th/ sound")

**Week 3-4: Adaptation**
- Reapresent difficult phrases automatically
- Suggest "Focus Challenge" on weak words
- Adapt difficulty level based on success_rate

**Month 2+: Intelligence**
- Recommend mode switch ("Try Dictation to improve word recognition")
- Suggest tutor: "João needs help with pronunciation"
- Generate personalized learning path

## Monitoring & Metrics

**Log lines to watch:**
```
[SHADOW-MODE] User 1234 | Frase: 'Yes, I do' | Tentativas: 2 | Score: 87% | Auto-progressed: False
```

**SQL Queries for Analysis:**

```sql
-- Users with high failure rate
SELECT user_id, COUNT(*) as total, 
  SUM(CASE WHEN auto_progressed=1 THEN 1 ELSE 0 END) as failures,
  ROUND(100.0 * SUM(CASE WHEN auto_progressed=1 THEN 1 ELSE 0 END) / COUNT(*), 2) as failure_rate
FROM shadow_mode_analytics
GROUP BY user_id
HAVING failure_rate > 20
ORDER BY failure_rate DESC;

-- Most difficult phrases overall
SELECT expected_text, COUNT(*) as attempts,
  AVG(final_score) as avg_score,
  SUM(CASE WHEN auto_progressed=1 THEN 1 ELSE 0 END) as failures
FROM shadow_mode_analytics
GROUP BY expected_text
ORDER BY avg_score ASC
LIMIT 10;
```

## Troubleshooting

### Table Not Created
- Ensure SQLAlchemy ORM classes are imported before server starts
- Check DATABASE_URL is correct
- Manually run: `from db_models import ShadowModeAnalytic` in Python shell

### No Data Being Stored
- Verify shadow_mode is being sent from frontend
- Check server logs for "[SHADOW-MODE]" entries
- Ensure user_id is valid and authenticated

### Slow Queries
- Add index on (user_id, created_at)
- Limit queries to last 100 records
- Consider archiving old data (>30 days) to separate table

## Future Enhancements

1. **Batch Analytics**: Aggregate daily/weekly summaries
2. **Difficulty Scoring**: ML model to predict phonetic difficulty
3. **Teacher Dashboard**: Export user struggles for instructors
4. **Export**: CSV/PDF reports of pronunciation progress
5. **Comparison**: Before/After scores for challenges

---

## Status

✅ **Frontend**: 100% complete (shadow overlay + shadowing flow)
✅ **Backend**: 100% complete (schema + endpoints + processing)
✅ **Database**: Ready (auto-creates on server start)
✅ **Testing**: Ready (curl commands provided)
✅ **Documentation**: Complete (this file)

**Next Steps:**
1. Run backend: `python start_server.py`
2. Test with curl commands above
3. Verify data appears in /api/voice/shadow-analytics
4. Deploy to production
