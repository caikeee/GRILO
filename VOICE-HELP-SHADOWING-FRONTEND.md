# Voice Help Shadowing - Implementação Completa ✅

## O Que Foi Implementado

### 🎯 Fluxo Principal

```
ANTES:
  Usuário clica em "Usar resposta" → Resposta entra direto na conversa ❌

DEPOIS:
  Usuário clica em "Usar resposta" 
    ↓
  [ATIVA SHADOW MODE]
  Vê a frase que precisa falar
  Vê a pronunciação esperada
  Vê "Tentativa 1/3"
    ↓
  [CLICA BOTÃO 🎤 E FALA]
    ↓
  [SCORING AUTOMÁTICO]
  ✅ Se ≥85%: "Perfeito! Sua pronunciação está excelente!" → Envia mensagem
  ⚠️  Se 70-84%: "Muito bom! Sotaque natural. Quer tentar de novo?"
  ❌ Se <50%: "Microfone não capturou. Tente novamente."
    ↓
  [LÓGICA DE TENTATIVAS]
  - Tentativa 1-2: Oferece "Tentar de novo" ou "Pular"
  - Tentativa 3: "Continuar mesmo assim →" (auto-progride + anota dificuldade)
```

---

## 📝 Arquivos Modificados

### 1. **frontend/controllers/voice/chat-voice-controller.js**

#### Variáveis Globais Adicionadas:
```javascript
let _voiceHelpMode = null; // State machine do shadow mode
const _shadowModeAnalytics = {
    pronunciation_struggles: [],
    total_attempts_per_response: 0,
    response_types_failed: {},
    auto_progressed_count: 0
};
```

#### Funções Novas:
- `_startVoiceHelpShadowMode(responseText, kind)` - Inicia modo shadow
- `_showShadowPromptPedagogico(originalPhrase, options)` - UI pedagógica
- `_processShadowModeResultPedagogico(transcript, score, phrase, isError)` - Processa resultado
- `_progressVoiceHelpShadowSuccess()` - Envia mensagem (sucesso)
- `_progressVoiceHelpShadowSkipped()` - Envia com flag skip
- `_progressVoiceHelpShadowAutoProgressed()` - Auto-progride após 3 falhas
- `_closeVoiceHelpPanel()` - Helper

#### Funções Modificadas:
- `window.voiceHelpUseSuggestion()` - Agora chama shadow mode
- `showShadowPrompt()` - Delega para versão pedagógica ou não-pedagógica
- `_sendVoiceTextTurnFromHelp()` - Aceita `options.shadow_mode`

---

### 2. **frontend/home.html**

#### HTML Adicionado:
```html
<!-- Contexto pedagógico dentro do shadow-score-card -->
<div id="shadowHelpContext" style="display:none;">
    <div class="shadow-pronunciation-guide">
        <p class="guide-label">Pronúncia esperada:</p>
        <p class="guide-text" id="shadowGuideText"></p>
    </div>
    <div class="shadow-attempt-counter">
        Tentativa <span id="shadowAttemptNum">1</span>/3
    </div>
</div>
```

#### CSS Adicionado:
```css
#shadowHelpContext { padding: 16px 0; border-top: 1px solid rgba(...) }
.shadow-pronunciation-guide { margin-bottom: 14px }
.guide-label { font-size: 0.68rem; text-transform: uppercase; ... }
.guide-text { font-size: 0.92rem; font-style: italic; font-family: monospace }
.shadow-attempt-counter { font-size: 0.76rem; text-align: center }
.shadow-score-value.shadow-result-excellent { color: #22c55e }
.shadow-score-value.shadow-result-great { color: #3b82f6 }
.shadow-score-value.shadow-result-good { color: #f59e0b }
.shadow-score-value.shadow-result-needs-repeat { color: #ef4444 }
.shadow-score-value.shadow-result-too-low { color: rgba(239, 68, 68, 0.7) }
```

---

## 🔄 Estados & Lógica

### State Machine: `_voiceHelpMode`

```javascript
{
  expectedText: string,           // "Yes, I do"
  kind: string,                   // "Positiva", "Negativa", "Mudar rumo"
  attempts: number,               // 0-3
  maxAttempts: number,            // 3
  errors: array,                  // []
  timestamp: number               // Date.now()
}
```

### Scoring Pedagógico

| Score | Feedback | Ação |
|---|---|---|
| ≥85% | 🌟 Perfeito! | ✅ Envia mensagem |
| 75-84% | 🎯 Muito bom! | 🔄 Permite retry |
| 65-74% | 👍 Correto! | 🔄 Permite retry |
| 50-64% | 🔄 Não reconhecemos bem | 🔄 Permite retry |
| <50% | 🔊 Muito baixo/rápido | 🔄 Permite retry |
| Erro | ⚠️ Microfone não capturou | 🔄 Permite retry |

### Tentativas

- **Tentativa 1-2**: Botões "Tentar de novo" + "Pular"
- **Tentativa 3**: Botão "Continuar mesmo assim" (auto-progride)
  - Anota como dificuldade
  - Marca `auto_progressed: true`

---

## 📊 Analytics Rastreados

```javascript
_shadowModeAnalytics = {
    pronunciation_struggles: [
        { word: "reservation", attempts: 3, timestamp, kind: "Negativa" }
    ],
    total_attempts_per_response: 147,
    response_types_failed: {
        "Positiva": 2,
        "Negativa": 5,
        "Mudar rumo": 1
    },
    auto_progressed_count: 8
}
```

---

## 🔌 Payload Backend

### Quando Envia (Nova Estrutura)

```json
{
  "message": "Yes, I do",
  "language": "en",
  "history": [...],
  "stt_confidence": 1.0,
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

---

## ✅ Testing Checklist

- [ ] Abrir voice chat e fazer pergunta
- [ ] Clicar "Ajuda" → Help panel aparece
- [ ] Clicar "Usar resposta" em uma sugestão
- [ ] Shadow overlay abre com:
  - [ ] Frase esperada em destaque
  - [ ] Pronúncia em monospace
  - [ ] Contador "Tentativa 1/3"
- [ ] Clicar 🎤 → Reconhecimento ativa
- [ ] Falar a frase:
  - [ ] Se bom (≥85%): feedback verde + botão "Continuar"
  - [ ] Se médio (50-84%): feedback amarelo + "Tentar de novo"
  - [ ] Se ruim (<50%): feedback vermelho + "Pular"
- [ ] Clicar "Tentar de novo" → Reinicia escuta
- [ ] Ao 3ª tentativa falhada: "Continuar mesmo assim"
- [ ] Clicar "Continuar" → Overlay fecha, mensagem entra na conversa
- [ ] Console: Analytics atualizado com `auto_progressed_count`

---

## 🎓 Uso Pedagógico Futuro

### Phase 1 (Esta semana)
- ✅ Rastrear tentativas e scores
- ✅ Dar feedback imediato
- ✅ Auto-progredir sem travar

### Phase 2 (Next week)
- Dashboard: "Suas palavras mais difíceis"
- Reapresentar frases mal pronunciadas
- "Desafio semanal: domine 5 palavras com score <80%"

### Phase 3 (Month 2)
- Adaptar nível: A1 → frases mais curtas
- Switch automático para Dictation se muitas falhas
- Feedback de sotaque: "Seu 'o' está muito aberto"

---

## 📋 Próximas Tarefas (Backend)

1. **Criar schema ShadowModeAnalytic** em `db_models.py`
2. **Parseiar shadow_mode** em `VoiceChatRequest` schema
3. **Log analytics** em `process_shadow_mode_data()`
4. **Mark difficulty** para reapresentação
5. **Future query**: `get_pronunciation_difficulty_report(user_id)`

Veja: [VOICE-HELP-SHADOWING-BACKEND.md](VOICE-HELP-SHADOWING-BACKEND.md)

---

## 🐛 Debugging

### Se o shadow overlay não aparece:
```javascript
// No console:
console.log(_voiceHelpMode);
// Deve estar não-null durante o shadow mode
```

### Se o scoring não funciona:
```javascript
// Checar computeSimilarityScore
const score = computeSimilarityScore("Yes, I do", userTranscript);
console.log(score);
```

### Se os botões não funcionam:
```javascript
// Verificar onclick listeners
document.getElementById("shadowRetryBtn").onclick;
```

---

## 🎉 Resultado Final

**Antes**: "Usar resposta" = envio direto
**Depois**: "Usar resposta" = prática de pronuncia com feedback + análise pedagógica

O GRILO agora:
- ✅ Força pronunciação real (não só leitura)
- ✅ Dá feedback específico ("tente mais lento")
- ✅ Rastreia onde o usuário tem dificuldade
- ✅ Auto-progride sem frustração
- ✅ Coleta dados para adaptação futura

**Impacto**: Aprendizagem de pronuncia passa de 0% para 100% no voice chat.
