# Diagnóstico e melhorias — Chat de Voz

Contexto: conversação por voz estava ruim — captura atrasada/perdia início da fala, transcrição imprecisa, respostas da IA engessadas.

## Status

| # | Ponto | Status | O quê |
|---|-------|--------|-------|
| 1 | Captura de áudio (VAD) | ✅ Resolvido | Silero VAD substituiu o VAD nativo do navegador |
| 2 | STT (transcrição) | ⬜ Pendente | Ainda batch (Web Speech API + Whisper condicional), sem streaming real |
| 3 | Prompt do LLM (respostas engessadas) | ✅ Resolvido | Removida tabela de frases-modelo; correção/bridge saíram da resposta principal |
| 4 | TTS / barge-in | ⬜ Pendente | Sem interrupção real da IA; pipeline sequencial STT→LLM→TTS |

---

## 1. Captura de áudio (VAD) — ✅ Resolvido

**Causa raiz:** dois sistemas de captura rodando em paralelo e mal sincronizados — `SpeechRecognition` (VAD nativo, caixa-preta do navegador) e `MediaRecorder` (só ligava depois do `onstart` do recognizer), mais um `setTimeout(100ms)` artificial. Perdia ~200-400ms do início da fala.

**Solução aplicada:** Silero VAD (`@ricky0123/vad-web`, roda local via ONNX/WASM, grátis) assumiu o controle de início e fim de fala. `onSpeechStart` liga a gravação na hora; `onSpeechEnd` substitui a grace-window fixa por sinal real de energia/voz. Fallback automático para o VAD do navegador se a lib não carregar.

**Arquivos:**
- `frontend/voice.html` — scripts do CDN (onnxruntime-web, vad-web)
- `frontend/controllers/voice/chat-voice-controller.js` — módulo `_initSileroVad`/`_stopSileroVad`/`_commitPendingSpeechFromVad`
- `backend/server.py` — CSP ajustado (`connect-src` + `wasm-unsafe-eval`) para permitir o carregamento do modelo

**Commit:** `ee10db3`

**Testado:** carregamento e inicialização confirmados via Playwright (servidor local). Detecção de fala real ainda precisa ser sentida manualmente por um humano falando no microfone.

---

## 2. STT (transcrição) — ⬜ Pendente

**Causa raiz:** STT primário é o Web Speech API do navegador (qualidade inconsistente entre browsers, confidence pouco confiável). Whisper (Groq) só entra como upgrade condicional quando a confiança é baixa, e mesmo assim transcreve o mesmo áudio, em modo batch (grava tudo → manda → espera), não streaming.

**Sugestão:** migrar para STT streaming via WebSocket — candidatos: **Deepgram Nova-3** (free tier de créditos ao cadastrar) ou **Soniox** (mais barato por minuto). Resolve atraso e abre caminho para usar texto parcial como sinal extra de fim de turno.

---

## 3. Prompt do LLM (respostas engessadas) — ✅ Resolvido

**Causa raiz:** o `system_msg` empilhava até 8 blocos de instrução por turno, incluindo `_INTENT_PROMPTS` — uma tabela de 36 frases-modelo prontas (intenção × nível CEFR) que o LLM reciclava quase literalmente — e pedia para o modelo emitir marcadores estruturados (`[CORRECTION: {...}]`, `[BRIDGE: [...]]`) dentro da própria resposta conversacional. Conversar + seguir regras + estruturar dados na mesma geração produzia tom de "professor"/formulário.

**Solução aplicada:**
- Removida `_INTENT_PROMPTS` e `detect_user_intent` por completo (sem substituto — o LLM não precisa de roteiro de frases prontas).
- Removidos os exemplos de diálogo hardcoded em `_LEVEL_VOICE_RULES` (níveis C1/C2).
- Correção/bridge saíram da resposta principal: nova função `_extract_correction_and_bridge()` faz uma 2ª chamada leve (gpt-oss-20b, temp baixa) só quando o turno é `FULL_LLM`/free/guided, rodando em paralelo com a tradução bilíngue via `asyncio.gather` — sem latência sequencial extra.

**Arquivo:** `backend/services.py`

**Testado:** 3 cenários rodados direto contra a Groq (erro gramatical claro, code-switching PT→EN, turno curto/LIGHT_LLM) — respostas saíram naturais, extração de correção/bridge funcionando nos dois formatos.

**Debate arquitetural (pendente, não bloqueia):** uma "mesa" interna (Staff Eng, ML Eng, SRE, Product, Segurança) levantou os próximos investimentos para amadurecer este ponto — nenhum implementado ainda:
- **Métricas estruturadas** por etapa do pipeline (latência p50/p95, taxa de classificação NO_LLM/LIGHT/FULL, taxa de falha silenciosa da extração) — sem isso, mudanças futuras de prompt são decididas às cegas.
- **Validação de schema** na saída da 2ª chamada (hoje um JSON malformado falha em silêncio via `except Exception: return None, None`).
- **Golden set de regressão de prompt** — conjunto de conversas de teste com output esperado, rodado em CI, para nunca reintroduzir respostas engessadas sem perceber.
- **Sinais de produto** (taxa de abandono de turno, repetição do usuário) como proxy quantitativo de "a conversa está mais natural".
- Risco identificado: a 2ª chamada dobra requisições à Groq por turno em FULL_LLM — vale medir impacto em rate limit sob pico.

---

## 4. TTS / barge-in (fluidez percebida) — ⬜ Pendente

**Causa raiz:** pipeline sequencial (STT → LLM → TTS); o reconhecedor de voz é desligado explicitamente enquanto a IA fala, então não há interrupção real (barge-in) do usuário.

**Sugestão:** permitir barge-in de verdade aproveitando que o Silero VAD já está sempre ouvindo; avaliar **Cartesia Sonic** como alternativa/complemento ao ElevenLabs (free tier mensal recorrente, latência menor).
