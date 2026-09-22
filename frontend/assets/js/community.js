/** ================================
    GRILO — Comunidade
    Feed de pauta pública: tópicos, votos, comentários e decisões.
    ================================ */

(function () {
  'use strict';

  const PAGE_SIZE = 20;
  const TYPE_LABELS = {
    feature: 'Sugestão',
    correction: 'Correção',
    bug: 'Bug',
    resource: 'Recurso',
    question: 'Dúvida',
  };

  const state = {
    type: '',
    sort: 'trending',
    offset: 0,
    total: 0,
    isAdmin: false,
    currentTopicId: null,
  };

  const $ = (id) => document.getElementById(id);

  function getAuthToken() {
    try { return sessionStorage.getItem('grilo_token'); } catch (e) { return null; }
  }

  async function api(path, options) {
    const token = getAuthToken();
    const res = await fetch(path, Object.assign({
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    }, options || {}));

    if (res.status === 401) {
      window.location.href = 'index.html';
      throw new Error('Sessão expirada');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = typeof data.detail === 'string'
        ? data.detail
        : 'Não foi possível completar a ação. Tente de novo.';
      throw new Error(detail);
    }
    return data;
  }

  function toast(message) {
    const el = $('cmToast');
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { el.hidden = true; }, 3200);
  }

  function timeAgo(iso) {
    if (!iso) return '';
    const then = new Date(iso + (iso.endsWith('Z') ? '' : 'Z'));
    const mins = Math.round((Date.now() - then.getTime()) / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `há ${mins} min`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.round(hours / 24);
    if (days < 30) return `há ${days}d`;
    return then.toLocaleDateString('pt-BR');
  }

  function lessonTitle(slug) {
    const lessons = (window.Grilo4P && window.Grilo4P.LESSONS) || [];
    const found = lessons.find((l) => l.slug === slug);
    return found ? found.title : slug;
  }

  // ── Render ─────────────────────────────────────────────────────────
  function tagsMarkup(topic) {
    let html = `<span class="cm-type" data-type="${topic.type}">${TYPE_LABELS[topic.type] || topic.type}</span>`;
    html += `<span class="cm-status" data-status="${topic.status}">${topic.status_label}</span>`;
    if (topic.lesson_slug) {
      html += `<span class="cm-lesson-ref"></span>`;
    }
    (topic.tags || []).forEach(() => { html += `<span class="cm-lesson-ref"></span>`; });
    return html;
  }

  // Preenche textos via textContent para nunca interpolar entrada de usuário em HTML.
  function fillTags(container, topic) {
    container.innerHTML = tagsMarkup(topic);
    const refs = container.querySelectorAll('.cm-lesson-ref');
    let i = 0;
    if (topic.lesson_slug && refs[i]) {
      refs[i].textContent = '📘 ' + lessonTitle(topic.lesson_slug);
      i++;
    }
    (topic.tags || []).forEach((tag) => {
      if (refs[i]) { refs[i].textContent = '#' + tag; i++; }
    });
  }

  function renderTopic(topic) {
    const card = document.createElement('article');
    card.className = 'cm-topic';
    card.dataset.topicId = topic.id;

    const vote = document.createElement('button');
    vote.type = 'button';
    vote.className = 'cm-vote' + (topic.has_voted ? ' is-voted' : '');
    vote.setAttribute('aria-pressed', String(!!topic.has_voted));
    vote.setAttribute('aria-label', `Votar em ${topic.title}`);
    vote.innerHTML = '<span class="cm-vote-arrow" aria-hidden="true">▲</span><span class="cm-vote-count"></span>';
    vote.querySelector('.cm-vote-count').textContent = topic.vote_count;
    vote.addEventListener('click', () => toggleVote(topic.id, vote));

    const body = document.createElement('div');
    body.className = 'cm-topic-body';

    const tags = document.createElement('div');
    tags.className = 'cm-topic-tags';
    fillTags(tags, topic);

    const title = document.createElement('h2');
    title.className = 'cm-topic-title';
    title.textContent = topic.title;
    title.addEventListener('click', () => openDetail(topic.id));

    const desc = document.createElement('p');
    desc.className = 'cm-topic-desc';
    desc.textContent = topic.description;

    const meta = document.createElement('div');
    meta.className = 'cm-topic-meta';

    const author = document.createElement('span');
    author.className = 'cm-author';
    const avatar = document.createElement('span');
    avatar.className = 'cm-avatar';
    avatar.textContent = topic.author.initials;
    const name = document.createElement('span');
    name.textContent = topic.author.username + (topic.is_owner ? ' (você)' : '');
    author.append(avatar, name);

    const date = document.createElement('span');
    date.textContent = timeAgo(topic.created_at);

    const comments = document.createElement('button');
    comments.type = 'button';
    comments.className = 'cm-meta-link';
    comments.textContent = topic.comment_count === 1
      ? '1 comentário'
      : `${topic.comment_count} comentários`;
    comments.addEventListener('click', () => openDetail(topic.id));

    meta.append(author, date, comments);
    body.append(tags, title, desc, meta);
    card.append(vote, body);
    return card;
  }

  function renderEmpty() {
    const box = document.createElement('div');
    box.className = 'cm-empty';
    const filtered = !!state.type;
    box.innerHTML = filtered
      ? '<h3>Nada por aqui ainda</h3><p>Nenhum tópico deste tipo foi levantado. Que tal ser o primeiro?</p>'
      : '<h3>A pauta está vazia</h3><p>Ninguém levantou um tópico ainda. Comece você — uma ideia, um erro que encontrou, uma dúvida.</p>';
    return box;
  }

  // ── Feed ───────────────────────────────────────────────────────────
  async function loadFeed(append) {
    const list = $('cmList');
    if (!append) {
      state.offset = 0;
      list.innerHTML = '<div class="cm-empty"><p>Carregando tópicos…</p></div>';
    }

    const params = new URLSearchParams({
      sort: state.sort,
      limit: String(PAGE_SIZE),
      offset: String(state.offset),
    });
    if (state.type) params.set('type', state.type);

    try {
      const data = await api(`/api/community/topics?${params}`);
      state.total = data.total;

      if (!append) list.innerHTML = '';
      if (!data.topics.length && !append) {
        list.appendChild(renderEmpty());
      } else {
        data.topics.forEach((t) => list.appendChild(renderTopic(t)));
      }

      state.offset += data.topics.length;
      $('cmLoadMore').hidden = state.offset >= state.total;
      $('cmTopbarPill').textContent = data.open_count === 1
        ? '1 tópico aberto'
        : `${data.open_count} tópicos abertos`;
    } catch (err) {
      list.innerHTML = '';
      const box = document.createElement('div');
      box.className = 'cm-empty';
      box.innerHTML = '<h3>Não deu para carregar</h3><p></p>';
      box.querySelector('p').textContent = err.message;
      list.appendChild(box);
    }
  }

  async function toggleVote(topicId, button) {
    button.disabled = true;
    try {
      const data = await api(`/api/community/topics/${topicId}/vote`, { method: 'POST' });
      button.classList.toggle('is-voted', data.has_voted);
      button.setAttribute('aria-pressed', String(data.has_voted));
      button.querySelector('.cm-vote-count').textContent = data.vote_count;

      // Mantém o card do feed e o modal de detalhe em sincronia.
      const other = button.id === 'cmDetailVote'
        ? document.querySelector(`.cm-topic[data-topic-id="${topicId}"] .cm-vote`)
        : (state.currentTopicId === topicId ? $('cmDetailVote') : null);
      if (other) {
        other.classList.toggle('is-voted', data.has_voted);
        other.setAttribute('aria-pressed', String(data.has_voted));
        other.querySelector('.cm-vote-count').textContent = data.vote_count;
      }
    } catch (err) {
      toast(err.message);
    } finally {
      button.disabled = false;
    }
  }

  // ── Detalhe ────────────────────────────────────────────────────────
  async function openDetail(topicId) {
    state.currentTopicId = topicId;
    try {
      const data = await api(`/api/community/topics/${topicId}`);
      const t = data.topic;

      fillTags($('cmDetailTags'), t);
      $('cmDetailTitle').textContent = t.title;
      $('cmDetailDesc').textContent = t.description;
      $('cmDetailAvatar').textContent = t.author.initials;
      $('cmDetailAuthor').textContent = t.author.username + (t.is_owner ? ' (você)' : '');
      $('cmDetailDate').textContent = timeAgo(t.created_at);

      const vote = $('cmDetailVote');
      vote.classList.toggle('is-voted', t.has_voted);
      vote.setAttribute('aria-pressed', String(t.has_voted));
      $('cmDetailVoteCount').textContent = t.vote_count;

      $('cmAdminBar').hidden = !state.isAdmin;
      if (state.isAdmin) $('cmAdminStatus').value = t.status;

      renderComments(data.comments);
      openModal('cmDetailModal');
    } catch (err) {
      toast(err.message);
    }
  }

  function renderComments(comments) {
    const list = $('cmCommentList');
    list.innerHTML = '';

    if (!comments.length) {
      const empty = document.createElement('p');
      empty.className = 'cm-board-empty';
      empty.textContent = 'Nenhum comentário ainda. Some contexto ou confirme que também acontece com você.';
      list.appendChild(empty);
      return;
    }

    comments.forEach((c) => {
      const row = document.createElement('div');
      row.className = 'cm-comment' + (c.is_system ? ' is-system' : '');

      if (!c.is_system) {
        const avatar = document.createElement('span');
        avatar.className = 'cm-avatar';
        avatar.textContent = c.author.initials;
        row.appendChild(avatar);
      }

      const content = document.createElement('div');
      content.className = 'cm-comment-content';

      const head = document.createElement('div');
      head.className = 'cm-comment-head';
      const who = document.createElement('span');
      who.className = 'cm-comment-author';
      who.textContent = c.is_system ? 'Atualização do time' : c.author.username;
      const when = document.createElement('span');
      when.className = 'cm-comment-time';
      when.textContent = timeAgo(c.created_at);
      head.append(who, when);

      const text = document.createElement('p');
      text.className = 'cm-comment-text';
      text.textContent = c.content;

      content.append(head, text);
      row.appendChild(content);
      list.appendChild(row);
    });
  }

  // ── Leaderboard ────────────────────────────────────────────────────
  async function loadLeaderboard() {
    const box = $('cmLeaderboard');
    try {
      const data = await api('/api/community/leaderboard?limit=5');
      const rows = data.resolved.length ? data.resolved : data.proposed;
      const isResolved = data.resolved.length > 0;

      box.innerHTML = '';
      if (!rows.length) {
        const empty = document.createElement('p');
        empty.className = 'cm-board-empty';
        empty.textContent = 'Ainda sem contribuições. O primeiro tópico levantado aparece aqui.';
        box.appendChild(empty);
        return;
      }

      const caption = document.createElement('p');
      caption.className = 'cm-board-empty';
      caption.style.marginBottom = '10px';
      caption.textContent = isResolved ? 'Por tópicos resolvidos' : 'Por tópicos levantados';
      box.appendChild(caption);

      rows.forEach((r, i) => {
        const row = document.createElement('div');
        row.className = 'cm-board-row';
        const rank = document.createElement('span');
        rank.className = 'cm-board-rank';
        rank.textContent = String(i + 1);
        const avatar = document.createElement('span');
        avatar.className = 'cm-avatar';
        avatar.textContent = r.initials;
        const name = document.createElement('span');
        name.className = 'cm-board-name';
        name.textContent = r.username;
        const count = document.createElement('span');
        count.className = 'cm-board-count';
        count.textContent = r.count;
        row.append(rank, avatar, name, count);
        box.appendChild(row);
      });
    } catch (err) {
      box.innerHTML = '';
      const empty = document.createElement('p');
      empty.className = 'cm-board-empty';
      empty.textContent = 'Não deu para carregar o ranking.';
      box.appendChild(empty);
    }
  }

  // ── Modais ─────────────────────────────────────────────────────────
  function openModal(id) {
    $(id).hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id) {
    $(id).hidden = true;
    document.body.style.overflow = '';
    if (id === 'cmDetailModal') state.currentTopicId = null;
  }

  function populateLessonSelect() {
    const select = $('cmFieldLesson');
    const lessons = (window.Grilo4P && window.Grilo4P.LESSONS) || [];
    lessons.forEach((lesson) => {
      const opt = document.createElement('option');
      opt.value = lesson.slug;
      opt.textContent = lesson.title;
      select.appendChild(opt);
    });
  }

  function resetCreateForm() {
    $('cmCreateForm').reset();
    $('cmCreateError').hidden = true;
    $('cmTitleCount').textContent = '0/120';
    $('cmDescCount').textContent = '0/2000';
    $('cmFieldLessonWrap').hidden = true;
  }

  async function submitTopic(event) {
    event.preventDefault();
    const submit = $('cmCreateSubmit');
    const error = $('cmCreateError');
    error.hidden = true;

    const type = $('cmFieldType').value;
    const payload = {
      type,
      title: $('cmFieldTitle').value.trim(),
      description: $('cmFieldDesc').value.trim(),
      lesson_slug: type === 'correction' ? ($('cmFieldLesson').value || null) : null,
      tags: $('cmFieldTags').value.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 5),
    };

    if (payload.title.length < 5) {
      error.textContent = 'O título precisa de pelo menos 5 caracteres.';
      error.hidden = false;
      return;
    }
    if (payload.description.length < 10) {
      error.textContent = 'A descrição precisa de pelo menos 10 caracteres.';
      error.hidden = false;
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Publicando…';
    try {
      await api('/api/community/topics', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      closeModal('cmCreateModal');
      resetCreateForm();
      toast('Tópico publicado. Obrigado por contribuir.');
      state.type = '';
      document.querySelectorAll('.cm-filter').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.type === '');
      });
      state.sort = 'newest';
      $('cmSort').value = 'newest';
      loadFeed(false);
      loadLeaderboard();
    } catch (err) {
      error.textContent = err.message;
      error.hidden = false;
    } finally {
      submit.disabled = false;
      submit.textContent = 'Publicar';
    }
  }

  async function submitComment(event) {
    event.preventDefault();
    const input = $('cmCommentInput');
    const submit = $('cmCommentSubmit');
    const content = input.value.trim();
    if (!content || !state.currentTopicId) return;

    submit.disabled = true;
    try {
      await api(`/api/community/topics/${state.currentTopicId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      input.value = '';
      const data = await api(`/api/community/topics/${state.currentTopicId}`);
      renderComments(data.comments);
      $('cmCommentList').scrollIntoView({ block: 'end', behavior: 'smooth' });
      loadFeed(false);
    } catch (err) {
      toast(err.message);
    } finally {
      submit.disabled = false;
    }
  }

  async function applyStatus() {
    if (!state.currentTopicId) return;
    const button = $('cmAdminApply');
    button.disabled = true;
    try {
      await api(`/api/community/topics/${state.currentTopicId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: $('cmAdminStatus').value,
          note: $('cmAdminNote').value.trim() || null,
        }),
      });
      $('cmAdminNote').value = '';
      toast('Status atualizado.');
      await openDetail(state.currentTopicId);
      loadFeed(false);
      loadLeaderboard();
    } catch (err) {
      toast(err.message);
    } finally {
      button.disabled = false;
    }
  }

  async function checkAdmin() {
    try {
      const data = await api('/api/admin/check');
      state.isAdmin = !!(data.is_admin || data.isAdmin);
    } catch (e) {
      state.isAdmin = false;
    }
  }

  // ── Bind ───────────────────────────────────────────────────────────
  function init() {
    if (!getAuthToken()) {
      window.location.href = 'index.html';
      return;
    }

    populateLessonSelect();

    $('cmNewTopicBtn').addEventListener('click', () => {
      resetCreateForm();
      openModal('cmCreateModal');
      $('cmFieldTitle').focus();
    });

    $('cmCreateClose').addEventListener('click', () => closeModal('cmCreateModal'));
    $('cmCreateCancel').addEventListener('click', () => closeModal('cmCreateModal'));
    $('cmDetailClose').addEventListener('click', () => closeModal('cmDetailModal'));

    ['cmCreateModal', 'cmDetailModal'].forEach((id) => {
      $(id).addEventListener('click', (e) => {
        if (e.target === $(id)) closeModal(id);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!$('cmDetailModal').hidden) closeModal('cmDetailModal');
      else if (!$('cmCreateModal').hidden) closeModal('cmCreateModal');
    });

    $('cmFieldType').addEventListener('change', (e) => {
      $('cmFieldLessonWrap').hidden = e.target.value !== 'correction';
    });

    $('cmFieldTitle').addEventListener('input', (e) => {
      $('cmTitleCount').textContent = `${e.target.value.length}/120`;
    });
    $('cmFieldDesc').addEventListener('input', (e) => {
      $('cmDescCount').textContent = `${e.target.value.length}/2000`;
    });

    $('cmCreateForm').addEventListener('submit', submitTopic);
    $('cmCommentForm').addEventListener('submit', submitComment);
    $('cmAdminApply').addEventListener('click', applyStatus);
    $('cmDetailVote').addEventListener('click', function () {
      if (state.currentTopicId) toggleVote(state.currentTopicId, this);
    });

    document.querySelectorAll('.cm-filter').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.cm-filter').forEach((b) => b.classList.remove('is-active'));
        button.classList.add('is-active');
        state.type = button.dataset.type;
        loadFeed(false);
      });
    });

    $('cmSort').addEventListener('change', (e) => {
      state.sort = e.target.value;
      loadFeed(false);
    });

    $('cmLoadMore').addEventListener('click', () => loadFeed(true));

    checkAdmin().then(() => {
      loadFeed(false);
      loadLeaderboard();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
