/* ============================================================
 *  Voice Recognition Utils — núcleo compartilhado entre:
 *    • phrase-voice-trainer.js  (exercício de voz das aulas)
 *    • chat-voice-controller.js (chat de voz da home)
 *
 *  Responsabilidades:
 *    1. Tokenização e normalização (minúsculas, sem pontuação,
 *       expansão de contrações)
 *    2. Comparação fuzzy palavra-a-palavra (com homófonos, plural,
 *       past tense -ed, distância de edição até 1)
 *    3. Levenshtein word-level (ordem das palavras importa)
 *    4. Matching multi-alternativa (escolhe a melhor das N hipóteses)
 *    5. Classificação por confidence (claro / parcial / inaudível)
 *    6. Detecção de padrões fonéticos típicos de brasileiros
 *       (BR_PATTERNS — extensível)
 *    7. Helpers de microfone: nível de áudio, waveform
 *
 *  API exposta em window.GriloVR:
 *    GriloVR.evaluate(expected, srResults)        → resultado completo
 *    GriloVR.detectBRPatterns(expected, heard)    → lista de erros típicos
 *    GriloVR.MicLevelMonitor                      → classe para waveform
 *    GriloVR.confidenceLabel(score)               → 'clear'|'partial'|'inaudible'
 *    GriloVR.classifyResult(eval)                 → 'success'|'wrong'|'inaudible'
 * ============================================================ */
(function () {
  'use strict';

  // ─── Configuração ────────────────────────────────────────────
  const CONFIG = {
    PASS_THRESHOLD: 0.7,         // 70% das palavras corretas para passar
    MIN_WORDS_TO_PASS: 2,
    CONFIDENCE_CLEAR: 0.55,      // >= claro
    CONFIDENCE_PARTIAL: 0.25,    // >= parcial
    EDIT_DISTANCE_MAX: 1,        // tolerância para fuzzy match (1 letra)
    PUNCT_RE: /[^\p{L}\p{N}'-]/gu,
  };

  // ─── 1. Contrações + homófonos comuns ───────────────────────
  // Cada chave normalizada → sinônimos aceitos
  const CONTRACTIONS = {
    "i'm":     ["i am", "im", "ime", "i m"],
    "i've":    ["i have", "ive", "i ve"],
    "i'll":    ["i will", "ill", "i ll"],
    "i'd":     ["i would", "i had", "id", "i d"],
    "you're":  ["you are", "youre", "your", "you r"],
    "you've":  ["you have", "youve"],
    "you'll":  ["you will", "youll"],
    "you'd":   ["you would", "youd"],
    "we're":   ["we are", "were", "we r"],
    "we've":   ["we have", "weve"],
    "we'll":   ["we will", "well"],
    "we'd":    ["we would", "wed"],
    "they're": ["they are", "theyre", "there"],
    "they've": ["they have", "theyve"],
    "they'll": ["they will", "theyll"],
    "they'd":  ["they would", "theyd"],
    "he's":    ["he is", "he has", "hes"],
    "he'll":   ["he will", "hell"],
    "he'd":    ["he would", "he had", "hed"],
    "she's":   ["she is", "she has", "shes"],
    "she'll":  ["she will", "shell"],
    "she'd":   ["she would", "she had", "shed"],
    "it's":    ["it is", "it has", "its"],
    "it'll":   ["it will", "itll"],
    "it'd":    ["it would", "itd"],
    "that's":  ["that is", "thats"],
    "that'll": ["that will"],
    "that'd":  ["that would", "that had"],
    "there's": ["there is", "there has", "theres"],
    "there'll":["there will"],
    "there'd": ["there would", "there had"],
    "what's":  ["what is", "what has", "whats", "what does"],
    "where's": ["where is", "where has", "wheres"],
    "when's":  ["when is", "when has"],
    "why's":   ["why is", "why has"],
    "how's":   ["how is", "how has"],
    "who's":   ["who is", "who has", "whos", "whose"],
    "let's":   ["let us", "lets"],
    "don't":   ["do not", "dont"],
    "doesn't": ["does not", "doesnt"],
    "didn't":  ["did not", "didnt"],
    "won't":   ["will not", "wont"],
    "wouldn't":["would not", "wouldnt"],
    "can't":   ["cannot", "can not", "cant"],
    "couldn't":["could not", "couldnt"],
    "shouldn't":["should not", "shouldnt"],
    "isn't":   ["is not", "isnt"],
    "aren't":  ["are not", "arent"],
    "wasn't":  ["was not", "wasnt"],
    "weren't": ["were not", "werent"],
    "haven't": ["have not", "havent"],
    "hasn't":  ["has not", "hasnt"],
    "hadn't":  ["had not", "hadnt"],
    "mustn't": ["must not"],
    // homófonos clássicos
    "to":      ["too", "two"],
    "too":     ["to", "two"],
    "two":     ["to", "too"],
    "your":    ["you're", "youre"],
    "their":   ["there", "they're", "theyre"],
    "there":   ["their", "they're", "theyre"],
    "no":      ["know"],
    "know":    ["no"],
    "by":      ["buy", "bye"],
    "buy":     ["by", "bye"],
    "hear":    ["here"],
    "here":    ["hear"],
    "see":     ["sea"],
    "sea":     ["see"],
    "for":     ["four"],
    "four":    ["for"],
    "right":   ["write"],
    "write":   ["right"],
    "knight":  ["night"],
    "night":   ["knight"],
    "would":   ["wood"],
    "wood":    ["would"],
    "hour":    ["our"],
    "our":     ["hour"],
    "i":       ["eye"],
    "eye":     ["i"],
  };

  // Constrói índice reverso: cada token → lista de equivalentes
  const EQUIV_INDEX = (() => {
    const idx = {};
    function add(a, b) {
      if (!idx[a]) idx[a] = new Set();
      idx[a].add(b);
    }
    Object.keys(CONTRACTIONS).forEach(k => {
      const variants = CONTRACTIONS[k];
      variants.forEach(v => {
        add(k, v);
        add(v, k);
      });
    });
    // Fechamento transitivo (se a≡b e b≡c → a≡c)
    Object.keys(idx).forEach(a => {
      const queue = Array.from(idx[a]);
      while (queue.length) {
        const b = queue.shift();
        if (idx[b]) idx[b].forEach(c => {
          if (c !== a && !idx[a].has(c)) {
            idx[a].add(c);
            queue.push(c);
          }
        });
      }
    });
    return idx;
  })();

  function expandEquivalents(word) {
    const set = new Set([word]);
    const eq = EQUIV_INDEX[word];
    if (eq) eq.forEach(e => set.add(e));
    return set;
  }

  // ─── 2. Padrões fonéticos típicos de brasileiros ────────────
  //
  // Cada padrão tem:
  //   id: identificador estável
  //   label: nome amigável em PT
  //   tip: dica pedagógica curta
  //   detect: função que recebe (expectedWord, heardWord) e retorna bool
  //
  const BR_PATTERNS = [
    {
      id: 'th_voiceless',
      label: 'Som "th" surdo (think, three)',
      tip: 'Coloque a língua entre os dentes para soprar — não é "t" nem "f".',
      detect: (exp, heard) => /^th[aeiou]/.test(exp) &&
        (/^t[aeiou]/.test(heard) || /^f[aeiou]/.test(heard) || /^s[aeiou]/.test(heard)),
    },
    {
      id: 'th_voiced',
      label: 'Som "th" sonoro (the, this, that)',
      tip: 'Vibre as cordas vocais com a língua entre os dentes — não é "d" nem "z".',
      detect: (exp, heard) => /^th(e|is|at|ey|em|ese|ose)/.test(exp) &&
        (/^d[aeiou]/.test(heard) || /^z[aeiou]/.test(heard)),
    },
    {
      id: 'h_silent',
      label: 'H aspirado (hello, house, here)',
      tip: 'O H em inglês é soprado, não mudo como em português.',
      detect: (exp, heard) => /^h[aeiou]/.test(exp) && /^[aeiou]/.test(heard) && exp !== heard,
    },
    {
      id: 'r_brazilian',
      label: 'R inglês (right, red, very)',
      tip: 'O R em inglês é mais "rolado" para trás, sem vibrar como o R brasileiro.',
      detect: (exp, heard) => /r/.test(exp) &&
        (/h[aeiou]/.test(heard) && exp.replace(/r/g, 'h') === heard),
    },
    {
      id: 'final_consonant_drop',
      label: 'Consoante final engolida',
      tip: 'Em inglês a consoante final é pronunciada — não some como em "dog/doguie".',
      detect: (exp, heard) => /[bcdfghjklmnpqrstvwxz]$/.test(exp) &&
        heard.length === exp.length - 1 && exp.startsWith(heard),
    },
    {
      id: 'vowel_epenthesis',
      label: 'Vogal de apoio adicionada',
      tip: 'Não adicione "i" ou "e" antes de consoantes em inglês (ex: "speak", não "espeak").',
      detect: (exp, heard) => /^[bcdfghjklmnpqrstvwxz]{2,}/.test(exp) &&
        /^[ie][bcdfghjklmnpqrstvwxz]/.test(heard) && heard.slice(1) === exp,
    },
    {
      id: 'ed_pronunciation',
      label: 'Terminação -ed (worked, watched)',
      tip: 'Em verbos regulares, -ed pode soar /t/, /d/ ou /id/ — não é "edi" português.',
      detect: (exp, heard) => /ed$/.test(exp) &&
        (heard === exp.slice(0, -2) + 'edi' || heard === exp.slice(0, -2) + 'eji'),
    },
    {
      id: 's_plural_drop',
      label: 'Plural com -s engolido',
      tip: 'Em inglês o S do plural precisa ser ouvido — não some como em "casas/casa".',
      detect: (exp, heard) => /s$/.test(exp) && heard === exp.slice(0, -1),
    },
    {
      id: 'engineer_trap',
      label: 'Engineer / engenheiro',
      tip: 'Pronuncia "en-juh-NEER" — força na última sílaba, não como "en-ge-NHEI-ro".',
      detect: (exp, heard) => exp === 'engineer' &&
        (/eng?en[hi]eiro?/.test(heard) || /enchiniru/.test(heard)),
    },
    {
      id: 'people_trap',
      label: 'People',
      tip: 'Pronuncia "PI-pou", não "pê-o-plê" como o português.',
      detect: (exp, heard) => exp === 'people' && /peopl?e?/.test(heard) === false &&
        /(pe-o-ple|peo-ple)/.test(heard),
    },
    {
      id: 'beach_bitch_trap',
      label: 'Vogais longas vs curtas (beach/bitch, sheet/shit)',
      tip: 'Vogal longa (i:) é mais aberta e prolongada — atenção em palavras como "beach", "sheet".',
      detect: (exp, heard) => {
        const longShortPairs = [['beach','bitch'],['sheet','shit'],['eat','it'],['leave','live'],['feet','fit']];
        return longShortPairs.some(([long, short]) =>
          (exp === long && heard === short) || (exp === short && heard === long)
        );
      },
    },
    {
      id: 'm_n_final',
      label: 'M/N final nasalizado',
      tip: 'Em inglês, M e N final são pronunciados — não viram nasalização como "ã" português.',
      detect: (exp, heard) => /[mn]$/.test(exp) && /[ãõ]/.test(heard),
    },
    {
      id: 'l_final',
      label: 'L final',
      tip: 'L no fim em inglês mantém som de "L" — não vira "U" como em "Brasil".',
      detect: (exp, heard) => /l$/.test(exp) && heard === exp.slice(0, -1) + 'u',
    },
    {
      id: 'comfortable_trap',
      label: 'Comfortable',
      tip: 'Pronuncia "KUMF-ter-bol" (3 sílabas, não 4) — atalho que muitos americanos usam.',
      detect: (exp, heard) => exp === 'comfortable' && /comforta/.test(heard),
    },
    {
      id: 'vegetable_trap',
      label: 'Vegetable',
      tip: 'Pronuncia "VEJ-ta-bol" — comprime sílabas, não é "ve-ge-tá-vel".',
      detect: (exp, heard) => exp === 'vegetable' && /vegeta/.test(heard),
    },
    {
      id: 'work_walk_trap',
      label: 'Work / walk',
      tip: '"Work" tem som de R, "walk" o L é silencioso — sons completamente diferentes.',
      detect: (exp, heard) => (exp === 'work' && heard === 'walk') || (exp === 'walk' && heard === 'work'),
    },
    {
      id: 'live_leave_trap',
      label: 'Live / leave',
      tip: '"Live" (vogal curta /ɪ/) ≠ "leave" (vogal longa /iː/) — trocar muda totalmente o sentido.',
      detect: (exp, heard) => (exp === 'live' && heard === 'leave') || (exp === 'leave' && heard === 'live'),
    },
    {
      id: 'word_choice_trap',
      label: 'Word / world',
      tip: '"Word" (palavra) e "world" (mundo) têm som de L diferente — atenção.',
      detect: (exp, heard) => (exp === 'word' && heard === 'world') || (exp === 'world' && heard === 'word'),
    },
    {
      id: 'thirteen_thirty',
      label: 'Thirteen / thirty',
      tip: 'Thirteen (13) tem força no TEEN; thirty (30) força no THIR — diferença sutil mas crítica.',
      detect: (exp, heard) => (exp === 'thirteen' && heard === 'thirty') || (exp === 'thirty' && heard === 'thirteen'),
    },
    {
      id: 'a_an_swap',
      label: 'Artigo a/an',
      tip: 'Use "an" antes de som de vogal (an apple), "a" antes de consoante (a book).',
      detect: (exp, heard) => (exp === 'a' && heard === 'an') || (exp === 'an' && heard === 'a'),
    },
    {
      id: 'in_on_trap',
      label: 'In / on',
      tip: 'Erro de preposição comum — "in" para dentro/cidade, "on" para superfície/dia.',
      detect: (exp, heard) => (exp === 'in' && heard === 'on') || (exp === 'on' && heard === 'in'),
    },
    {
      id: 'than_then_trap',
      label: 'Than / then',
      tip: '"Than" (que/do que, comparação) ≠ "then" (então/depois). STT confunde — fale com clareza.',
      detect: (exp, heard) => (exp === 'than' && heard === 'then') || (exp === 'then' && heard === 'than'),
    },
    {
      id: 'gender_him_her',
      label: 'Him / her',
      tip: '"Him" para masculino, "her" para feminino — confusão comum em quem aprende rápido.',
      detect: (exp, heard) => (exp === 'him' && heard === 'her') || (exp === 'her' && heard === 'him'),
    },
  ];

  // ─── 3. Tokenização e normalização ──────────────────────────
  function normalizeWord(w) {
    return String(w || '')
      .toLowerCase()
      .replace(CONFIG.PUNCT_RE, '')
      .trim();
  }

  function tokenize(s) {
    return String(s || '')
      .toLowerCase()
      .split(/\s+/)
      .map(normalizeWord)
      .filter(Boolean);
  }

  // ─── 4. Levenshtein por letra (até 1) — para fuzzy de palavra ──
  // Usa memoization para evitar recalcular pares frequentes
  const editDistanceCache = new Map();
  let editDistanceCallCount = 0;

  function editDistance(a, b) {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > 2) return 99;

    // Verificar cache
    const key = `${a}|${b}`;
    if (editDistanceCache.has(key)) return editDistanceCache.get(key);

    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
        else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
    const result = dp[m][n];

    // Armazenar no cache
    editDistanceCache.set(key, result);

    // Limpar cache a cada 100 chamadas para não vazar memória
    if (++editDistanceCallCount % 100 === 0) {
      editDistanceCache.clear();
    }

    return result;
  }

  // Match leve para variações morfológicas: plural, -ed, -ing
  function morphologicalMatch(exp, heard) {
    if (!exp || !heard) return false;
    if (exp === heard) return true;
    // plural: cat ↔ cats
    if (exp + 's' === heard || heard + 's' === exp) return true;
    if (exp + 'es' === heard || heard + 'es' === exp) return true;
    // past: walk ↔ walked
    if (exp + 'ed' === heard || heard + 'ed' === exp) return true;
    if (exp + 'd' === heard || heard + 'd' === exp) return true;
    // -ing: walk ↔ walking
    if (exp + 'ing' === heard || heard + 'ing' === exp) return true;
    // 3ª pessoa: love ↔ loves
    if (exp + "'s" === heard || heard + "'s" === exp) return true;
    return false;
  }

  function wordMatches(exp, heard) {
    if (!exp || !heard) return false;
    if (exp === heard) return true;
    // Equivalência semântica (contrações + homófonos)
    const equivs = expandEquivalents(exp);
    if (equivs.has(heard)) return true;
    for (const e of equivs) if (e === heard) return true;
    // Morfologia
    if (morphologicalMatch(exp, heard)) return true;
    // Distância de edição até 1 (ex: "engineer"↔"engineers" já caiu acima)
    if (editDistance(exp, heard) <= CONFIG.EDIT_DISTANCE_MAX) return true;
    return false;
  }

  // ─── 5. Levenshtein word-level (ordem importa) ──────────────
  // Retorna alinhamento ótimo: matched[i] = índice em heard ou -1
  function wordAlign(expTokens, heardTokens) {
    const m = expTokens.length, n = heardTokens.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    const back = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) { dp[i][0] = i; back[i][0] = 1; }
    for (let j = 0; j <= n; j++) { dp[0][j] = j; back[0][j] = 2; }
    back[0][0] = 0;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const eq = wordMatches(expTokens[i - 1], heardTokens[j - 1]);
        const cost = eq ? 0 : 1;
        const subst = dp[i - 1][j - 1] + cost;
        const del   = dp[i - 1][j] + 1;
        const ins   = dp[i][j - 1] + 1;
        const min = Math.min(subst, del, ins);
        dp[i][j] = min;
        back[i][j] = (min === subst) ? 0 : (min === del) ? 1 : 2;
      }
    }
    // Reconstrói alinhamento
    const matched = new Array(m).fill(-1);
    const wrongHeard = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      const op = back[i][j];
      if (op === 0) {
        const eq = i > 0 && j > 0 && wordMatches(expTokens[i - 1], heardTokens[j - 1]);
        if (eq) matched[i - 1] = j - 1;
        i--; j--;
      } else if (op === 1) {
        i--;  // deleção (esperado não foi falado)
      } else {
        wrongHeard.push(heardTokens[j - 1]);
        j--;  // inserção (palavra extra falada)
      }
    }
    return { matched, wrongHeard, distance: dp[m][n] };
  }

  // ─── 6. Avaliação principal ─────────────────────────────────
  // Recebe a frase esperada e o evento srResults (até N hipóteses).
  // Retorna a MELHOR avaliação entre todas as alternativas.
  //
  // srResults: array de { transcript, confidence }
  // Exemplo:
  //   [{ transcript: "I am a doctor", confidence: 0.92 },
  //    { transcript: "I'm a doctor",  confidence: 0.74 }]
  function evaluate(expected, srResults) {
    if (!Array.isArray(srResults) || srResults.length === 0) {
      return {
        passed: false,
        score: 0,
        bestAlternativeIdx: -1,
        bestTranscript: '',
        bestConfidence: 0,
        avgConfidence: 0,
        expTokens: tokenize(expected),
        heardTokens: [],
        matched: tokenize(expected).map(() => false),
        wrongWords: tokenize(expected),
        wrongHeard: [],
        brPatterns: [],
        confidenceBucket: 'inaudible',
      };
    }

    const expTokens = tokenize(expected);
    let best = null;
    srResults.forEach((alt, idx) => {
      const heardTokens = tokenize(alt.transcript || '');
      const align = wordAlign(expTokens, heardTokens);
      const matchedFlags = expTokens.map((_, i) => align.matched[i] >= 0);
      const correctCount = matchedFlags.filter(Boolean).length;
      const score = expTokens.length ? correctCount / expTokens.length : 0;
      const passed = score >= CONFIG.PASS_THRESHOLD &&
                     correctCount >= Math.min(CONFIG.MIN_WORDS_TO_PASS, expTokens.length);
      const cand = {
        idx,
        transcript: alt.transcript || '',
        confidence: typeof alt.confidence === 'number' ? alt.confidence : 0,
        heardTokens,
        matched: matchedFlags,
        align,
        correctCount,
        score,
        passed,
      };
      if (!best ||
          cand.score > best.score ||
          (cand.score === best.score && cand.confidence > best.confidence)) {
        best = cand;
      }
    });

    const wrongWords = expTokens.filter((_, i) => !best.matched[i]);
    const avgConf = srResults.reduce((s, r) => s + (r.confidence || 0), 0) / srResults.length;
    const confidenceBucket = confidenceLabel(best.confidence || avgConf);

    // Detecta padrões BR comparando pares (esperado, falado mais próximo)
    const brPatterns = detectBRPatterns(expTokens, best.heardTokens, best.align);

    return {
      passed: best.passed,
      score: best.score,
      bestAlternativeIdx: best.idx,
      bestTranscript: best.transcript,
      bestConfidence: best.confidence,
      avgConfidence: avgConf,
      expTokens,
      heardTokens: best.heardTokens,
      matched: best.matched,
      wrongWords,
      wrongHeard: best.align.wrongHeard,
      brPatterns,
      confidenceBucket,
      allAlternatives: srResults.map((alt, i) => ({
        transcript: alt.transcript || '',
        confidence: alt.confidence || 0,
        chosen: i === best.idx,
      })),
    };
  }

  function confidenceLabel(score) {
    if (score >= CONFIG.CONFIDENCE_CLEAR) return 'clear';
    if (score >= CONFIG.CONFIDENCE_PARTIAL) return 'partial';
    return 'inaudible';
  }

  // 'success' | 'wrong' | 'inaudible'
  function classifyResult(evalResult) {
    if (evalResult.confidenceBucket === 'inaudible' && !evalResult.passed) return 'inaudible';
    if (evalResult.passed) return 'success';
    return 'wrong';
  }

  // ─── 7. Detecção de padrões BR ──────────────────────────────
  function detectBRPatterns(expTokens, heardTokens, align) {
    const out = [];
    const seen = new Set();
    expTokens.forEach((exp, i) => {
      const heardIdx = align && align.matched ? align.matched[i] : -1;
      // Usa a palavra heard mais próxima (alinhada se houver, senão tenta posição)
      const heardWord = heardIdx >= 0 ? heardTokens[heardIdx]
                       : (heardTokens[i] || '');
      if (!heardWord || heardWord === exp) return;
      BR_PATTERNS.forEach(p => {
        if (seen.has(p.id)) return;
        try {
          if (p.detect(exp, heardWord)) {
            out.push({
              id: p.id,
              label: p.label,
              tip: p.tip,
              expected: exp,
              heard: heardWord,
            });
            seen.add(p.id);
          }
        } catch (e) { /* ignora erros de regex em palavras malformadas */ }
      });
    });
    return out;
  }

  // ─── 8. Helper: extrai resultados da Web Speech API ──────────
  // Retorna [{ transcript, confidence }, ...] das N alternativas
  // do evento `event` da API SpeechRecognitionEvent.
  function extractAlternatives(event) {
    if (!event || typeof event !== 'object') return [];
    const results = event.results;
    if (!results || typeof results.length !== 'number') return [];

    function pullFrom(filterFinal) {
      const out = [];
      for (let i = 0; i < results.length; i++) {
        const res = results[i];
        if (!res || typeof res.length !== 'number') continue;
        if (filterFinal && !res.isFinal) continue;
        for (let k = 0; k < res.length; k++) {
          const a = res[k];
          if (!a || !a.transcript) continue;
          out.push({
            transcript: String(a.transcript).trim(),
            confidence: typeof a.confidence === 'number' ? a.confidence : 0,
          });
        }
      }
      return out;
    }

    // Tenta primeiro os resultados finais; cai para não-finais se vazio
    const finals = pullFrom(true);
    return finals.length > 0 ? finals : pullFrom(false);
  }

  // ─── 9. Mic Level Monitor — waveform + nível de áudio ────────
  // Uso:
  //   const m = new GriloVR.MicLevelMonitor();
  //   await m.start();
  //   m.onLevel = (rms, isAudible) => { /* update UI */ };
  //   ... depois:
  //   m.stop();
  class MicLevelMonitor {
    constructor() {
      this.audioCtx = null;
      this.analyser = null;
      this.stream = null;
      this.running = false;
      this.onLevel = null;       // callback (rms 0..1, isAudible bool)
      this.onWaveform = null;    // callback (Uint8Array)
      this._raf = null;
    }
    async start() {
      if (this.running) return;
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const Ctx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new Ctx();
        const src = this.audioCtx.createMediaStreamSource(this.stream);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 1024;
        this.analyser.smoothingTimeConstant = 0.6;
        src.connect(this.analyser);
        this.running = true;
        this._tick();
      } catch (e) {
        console.warn('[GriloVR] MicLevelMonitor start failed:', e);
        throw e;
      }
    }
    _tick() {
      if (!this.running || !this.analyser) return;
      const buf = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteTimeDomainData(buf);
      // RMS
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length); // 0..1 (raramente > 0.5)
      const normalized = Math.min(1, rms * 3); // amplifica para UI
      const isAudible = rms > 0.02; // limiar — abaixo disso o mic não está captando
      if (this.onLevel) this.onLevel(normalized, isAudible);
      if (this.onWaveform) this.onWaveform(buf);
      this._raf = requestAnimationFrame(() => this._tick());
    }
    stop() {
      this.running = false;
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = null;
      if (this.stream) {
        try { this.stream.getTracks().forEach(t => t.stop()); } catch (e) {}
        this.stream = null;
      }
      if (this.audioCtx) {
        try { this.audioCtx.close(); } catch (e) {}
        this.audioCtx = null;
      }
      this.analyser = null;
    }
  }

  // ─── 10. Extensão de configuração em runtime ─────────────────
  function setConfig(key, value) {
    if (!(key in CONFIG)) {
      console.warn(`[GriloVR] setConfig: chave desconhecida "${key}"`);
      return;
    }
    CONFIG[key] = value;
  }

  // ─── 11. Adicionar padrão fonético BR em runtime ──────────────
  function addBRPattern(pattern) {
    if (!pattern || !pattern.id || typeof pattern.detect !== 'function') {
      console.warn('[GriloVR] addBRPattern: padrão inválido — precisa de {id, label, tip, detect}');
      return;
    }
    if (BR_PATTERNS.some(p => p.id === pattern.id)) {
      console.warn(`[GriloVR] addBRPattern: padrão "${pattern.id}" já existe`);
      return;
    }
    BR_PATTERNS.push(pattern);
  }

  // ─── Expor API ───────────────────────────────────────────────
  window.GriloVR = {
    CONFIG,
    BR_PATTERNS,
    tokenize,
    normalizeWord,
    wordMatches,
    editDistance,
    wordAlign,
    evaluate,
    extractAlternatives,
    detectBRPatterns,
    confidenceLabel,
    classifyResult,
    MicLevelMonitor,
    expandEquivalents,
    setConfig,
    addBRPattern,
  };
})();
