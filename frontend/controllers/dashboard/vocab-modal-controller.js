(function() {
    const card = document.getElementById('pl2VocabCard');
    const backdrop = document.getElementById('vocabModalBackdrop');
    const closeBtn = document.getElementById('vocabModalClose');
    const body = document.getElementById('vocabModalBody');
    const search = document.getElementById('vocabModalSearch');
    const countEl = document.getElementById('vocabModalCount');
    const weekEl = document.getElementById('vocabModalWeek');
    if (!card || !backdrop) return;

    function fmtRel(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        const diff = (Date.now() - d.getTime()) / 86400000;
        if (diff < 1) return 'hoje';
        if (diff < 2) return 'ontem';
        if (diff < 7) return `${Math.floor(diff)}d atrás`;
        if (diff < 30) return `${Math.floor(diff/7)}sem atrás`;
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }

    function render(filter) {
        const list = Array.isArray(window.__vocabMasteredList) ? window.__vocabMasteredList : [];
        const total = window.__vocabMasteredTotal || list.length;
        const week = window.__vocabMasteredWeek || 0;
        countEl.textContent = total;
        weekEl.textContent = week;

        const q = (filter || '').trim().toLowerCase();
        const filtered = q ? list.filter(w => (w.word || '').toLowerCase().includes(q)) : list;

        if (!list.length) {
            body.innerHTML = '<div class="vocab-modal-empty">Você ainda não dominou nenhuma palavra. Continue praticando! 🌱</div>';
            return;
        }
        if (!filtered.length) {
            body.innerHTML = `<div class="vocab-modal-empty">Nenhuma palavra encontrada para "${q}".</div>`;
            return;
        }
        const html = filtered.map(w => `
            <li class="vocab-modal-item">
                <span class="vocab-modal-item-word">${(w.word || '').replace(/[<>&]/g, '')}</span>
                <span class="vocab-modal-item-meta">
                    <span class="vocab-modal-item-acc">${w.accuracy || 0}%</span>
                    <span>·</span>
                    <span>${w.uses || 0} usos</span>
                    ${w.last_seen ? `<span>·</span><span>${fmtRel(w.last_seen)}</span>` : ''}
                </span>
            </li>
        `).join('');
        body.innerHTML = `<ul class="vocab-modal-list">${html}</ul>`;
    }

    function open() {
        render('');
        if (search) search.value = '';
        backdrop.classList.add('is-open');
        backdrop.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setTimeout(() => search && search.focus(), 280);
    }
    function close() {
        backdrop.classList.remove('is-open');
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop.classList.contains('is-open')) close();
    });
    if (search) search.addEventListener('input', (e) => render(e.target.value));
})();
