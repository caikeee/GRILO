/**
 * lessons-trainer-bridge.js
 *
 * Liga o phrase-voice-trainer (que espera dados do backend) às aulas locais
 * que ainda não têm backend ID. Funciona via monkey-patch de fetch:
 * quando o trainer chama /api/lessons/{slug}/phrases com um slug string
 * (em vez de número), o bridge devolve as frases vindas dos `examples`
 * das sections da aula local.
 *
 * Resultado: o botão "🎙 Treinar 5 frases" funciona em todas as 26 aulas,
 * usando o conteúdo já escrito no lessons-enhanced.js.
 */

(function() {
    'use strict';

    // Slugs que não têm backend ID (precisam do bridge)
    const LOCAL_ONLY_SLUGS = new Set([
        'soa1-alfabeto', 'soa1-numeros', 'soa1-cumprimentos', 'soa1-tobe-afirm',
        'soa2-pronomes-sujeito', 'soa2-tobe-perg-neg', 'soa2-possessivos', 'soa2-this-that',
        'soa3-present-afirm', 'soa3-third-person-s', 'soa3-frequencia',
        'soa4-wh-questions', 'soa4-prep-tempo', 'soa4-rotina',
        'soa5-past-regular', 'soa5-past-perguntas', 'soa5-past-negativa',
        'soa6-can', 'soa6-like-ing', 'soa6-want-to'
    ]);

    // Coletor de frases — preenchido pelo lessons-enhanced.js via API global
    function collectPhrasesFromLessonsData(slug) {
        // window._lessonsData é exposto pelo lessons-enhanced (vamos garantir isso)
        const lessons = window._lessonsData;
        if (!lessons || !lessons[slug]) return null;

        const lesson = lessons[slug];
        const phrases = [];
        let phraseId = 1;
        const target = 5; // 5 frases pro trainer
        let i = 0;
        const allExamples = [];

        (lesson.sections || []).forEach(section => {
            (section.examples || []).forEach(ex => {
                if (ex.en && ex.pt) allExamples.push(ex);
            });
        });

        // Pega até 5 das primeiras frases (a essência da aula)
        const chosen = allExamples.slice(0, target);
        chosen.forEach(ex => {
            phrases.push({
                id: phraseId++,
                phrase_en: ex.en,
                phrase_pt: ex.pt,
                phrase_phonetic: '',
                position: phraseId - 1
            });
        });

        return phrases.length > 0 ? phrases : null;
    }

    // Monkey-patch fetch para interceptar chamadas do trainer
    const _origFetch = window.fetch;
    window.fetch = function(input, init) {
        const url = (typeof input === 'string') ? input : (input && input.url) || '';
        const phrasesMatch = url.match(/\/api\/lessons\/([^/]+)\/phrases$/);

        if (phrasesMatch) {
            const slug = phrasesMatch[1];
            if (LOCAL_ONLY_SLUGS.has(slug)) {
                const phrases = collectPhrasesFromLessonsData(slug);
                if (phrases) {
                    return Promise.resolve(new Response(
                        JSON.stringify({ phrases }),
                        { status: 200, headers: { 'Content-Type': 'application/json' } }
                    ));
                }
            }
        }

        // Interceptar o submit de resultados pra slugs locais (não persiste no backend)
        const resultMatch = url.match(/\/api\/lessons\/([^/]+)\/phrases\/result$/);
        if (resultMatch && LOCAL_ONLY_SLUGS.has(resultMatch[1])) {
            return Promise.resolve(new Response(
                JSON.stringify({ success: true, local: true }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            ));
        }

        return _origFetch.apply(this, arguments);
    };

    console.log('[trainer-bridge] active for', LOCAL_ONLY_SLUGS.size, 'local lessons');
})();
