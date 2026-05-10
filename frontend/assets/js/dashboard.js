/**
 * Dashboard Analytics - GRILO
 * Redesign sage light-mode
 */

const API_BASE = window.location.origin;
const REFRESH_MS = 60 * 1000; // 60s — evita hammering
let charts = {};
let inFlight = false;

document.addEventListener('DOMContentLoaded', () => {
    loadAnalytics();
    setInterval(loadAnalytics, REFRESH_MS);
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) loadAnalytics();
});

/* ── FETCH ───────────────────────────────────────────── */
async function loadAnalytics() {
    if (inFlight) return;
    inFlight = true;

    const btn = document.getElementById('refreshBtn');
    if (btn) btn.classList.add('loading');

    try {
        const token = localStorage.getItem('grilo_token');
        if (!token) { showError('Faça login como admin para acessar o painel.'); return; }

        const headers = { Authorization: `Bearer ${token}` };

        const [dashRes, alertsRes, cohortsRes] = await Promise.all([
            fetch(`${API_BASE}/api/analytics/dashboard`, { cache: 'no-store', headers }),
            fetch(`${API_BASE}/api/analytics/alerts`,    { cache: 'no-store', headers }),
            fetch(`${API_BASE}/api/analytics/cohorts`,   { cache: 'no-store', headers }),
        ]);

        if (!dashRes.ok) throw new Error(`Erro ${dashRes.status} ao buscar dados`);

        const { data }         = await dashRes.json();
        const alertsData       = alertsRes.ok  ? await alertsRes.json()  : { alerts: [] };
        const cohortsData      = cohortsRes.ok ? await cohortsRes.json() : { cohorts: [] };

        render(data, alertsData.alerts || [], cohortsData.cohorts || []);
        updateTimestamp();
    } catch (e) {
        console.error(e);
        showError(e.message);
    } finally {
        inFlight = false;
        if (btn) btn.classList.remove('loading');
    }
}

/* ── RENDER ROOT ─────────────────────────────────────── */
function render(d, alerts, cohorts) {
    document.getElementById('content').innerHTML = `
        ${sectionAlerts(alerts)}
        ${sectionInsights(d.insights)}
        ${sectionSaude(d.health)}
        ${sectionAprendizado(d.learning)}
        ${sectionVoz(d.voice)}
        ${sectionPadroes(d.patterns)}
        ${sectionJornada(d.funnel)}
        ${sectionCohorts(cohorts)}
        ${sectionTecnico(d.technical)}
    `;
    setTimeout(() => initCharts(d, cohorts), 80);
}

/* ── HELPERS ─────────────────────────────────────────── */
function fmt(n) {
    n = Number(n) || 0;
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
    return Math.round(n).toString();
}

function pct(val, good, bad) {
    val = Number(val) || 0;
    const cls = val >= good ? 'ok' : val >= bad ? 'warn' : 'warn';
    const label = val >= good ? 'Bom' : 'Atenção';
    return `<span class="db-badge ${cls}">${label}</span>`;
}

function card(label, value, sub = '', extra = '', accent = false) {
    return `
        <div class="db-card ${accent ? 'accent' : ''}">
            <div class="db-card-label">${label}</div>
            <div class="db-card-value">${value}</div>
            ${sub   ? `<div class="db-card-sub">${sub}</div>` : ''}
            ${extra ? `<div class="db-card-footer">${extra}</div>` : ''}
        </div>`;
}

function sectionHead(icon, label) {
    return `
        <div class="db-section-header">
            <div class="db-section-icon">${icon}</div>
            <div class="db-section-label">${label}</div>
        </div>`;
}

/* ── ALERTAS AUTOMÁTICOS ─────────────────────────────── */
function sectionAlerts(alerts) {
    if (!alerts?.length) return '';

    const sevIcon  = { critical: '🔴', warning: '🟡', info: '🔵' };
    const sevLabel = { critical: 'Crítico', warning: 'Atenção', info: 'Info' };

    const rows = alerts.map(a => `
        <div class="db-alert db-alert-${a.severity}">
            <div class="db-alert-icon">${sevIcon[a.severity] || '⚪'}</div>
            <div class="db-alert-body">
                <div class="db-alert-title">
                    <span class="db-alert-badge db-alert-badge-${a.severity}">${sevLabel[a.severity] || a.severity}</span>
                    ${escHtml(a.title)}
                </div>
                <div class="db-alert-msg">${escHtml(a.message)}</div>
            </div>
        </div>`).join('');

    const critCount = alerts.filter(a => a.severity === 'critical').length;
    const warnCount = alerts.filter(a => a.severity === 'warning').length;
    const headerExtra = critCount
        ? `<span class="db-alert-summary critical">${critCount} crítico(s)</span>`
        : warnCount
        ? `<span class="db-alert-summary warning">${warnCount} atenção</span>`
        : `<span class="db-alert-summary ok">Sistema OK</span>`;

    return `
        <div class="db-section db-section-alerts">
            <div class="db-section-header">
                <div class="db-section-icon">🚨</div>
                <div class="db-section-label">Alertas Automáticos</div>
                ${headerExtra}
            </div>
            <div class="db-alerts-list">${rows}</div>
        </div>`;
}

/* ── COHORT ANALYSIS ─────────────────────────────────── */
function sectionCohorts(cohorts) {
    if (!cohorts?.length) return '';

    const headers = ['Cohort', 'Tamanho', 'D1', 'D7', 'D14', 'D30', 'Voz'];

    const colorCell = (val) => {
        if (val === null || val === undefined) return `<td class="db-cohort-na">—</td>`;
        const v = Number(val);
        const cls = v >= 40 ? 'ok' : v >= 20 ? 'warn' : 'bad';
        return `<td class="db-cohort-pct db-cohort-${cls}">${v}%</td>`;
    };

    const tableRows = cohorts.slice(0, 10).map(c => `
        <tr>
            <td class="db-cohort-week">${fmtWeek(c.cohort_week)}</td>
            <td class="db-cohort-size">${c.cohort_size}</td>
            ${colorCell(c.retention_d1)}
            ${colorCell(c.retention_d7)}
            ${colorCell(c.retention_d14)}
            ${colorCell(c.retention_d30)}
            ${colorCell(c.voice_adoption_percent)}
        </tr>`).join('');

    // Médias de D7 e D30 (excluindo nulls)
    const d7vals  = cohorts.map(c => c.retention_d7).filter(v => v !== null && v !== undefined);
    const d30vals = cohorts.map(c => c.retention_d30).filter(v => v !== null && v !== undefined);
    const avgD7   = d7vals.length  ? round1(d7vals.reduce((a, b) => a + b, 0)  / d7vals.length)  : '—';
    const avgD30  = d30vals.length ? round1(d30vals.reduce((a, b) => a + b, 0) / d30vals.length) : '—';

    return `
        <div class="db-section">
            ${sectionHead('📈', 'Cohort Analysis — Retenção Semanal')}
            <div class="db-grid-3" style="margin-bottom:14px;">
                ${card('Cohorts monitorados', cohorts.length, 'Semanas de signup analisadas')}
                ${card('D7 médio', typeof avgD7 === 'number' ? avgD7 + '%' : avgD7, 'Retenção 7 dias', typeof avgD7 === 'number' ? pct(avgD7, 25, 15) : '')}
                ${card('D30 médio', typeof avgD30 === 'number' ? avgD30 + '%' : avgD30, 'Retenção 30 dias', typeof avgD30 === 'number' ? pct(avgD30, 15, 8) : '')}
            </div>
            <div class="db-table-wrap db-table-cohort">
                <table class="db-table">
                    <thead>
                        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
                <div class="db-cohort-legend">
                    <span class="db-cohort-ok-dot"></span>≥40%
                    <span class="db-cohort-warn-dot"></span>20–40%
                    <span class="db-cohort-bad-dot"></span>&lt;20%
                </div>
            </div>
        </div>`;
}

function fmtWeek(isoDate) {
    if (!isoDate) return '—';
    const d = new Date(isoDate + 'T12:00:00');
    return `Sem ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
}

function round1(n) { return Math.round(n * 10) / 10; }

function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── INSIGHTS ────────────────────────────────────────── */
function sectionInsights(insights) {
    if (!insights?.length) return '';

    const iconMap = { success: '✓', warning: '⚠', info: '→' };
    const rows = insights.map(i => `
        <div class="db-insight ${i.type || 'info'}">
            <div class="db-insight-icon">${iconMap[i.type] || '→'}</div>
            <div class="db-insight-body">
                <div class="db-insight-title">${i.title}</div>
                <div class="db-insight-msg">${i.message}</div>
            </div>
        </div>`).join('');

    return `
        <div class="db-section">
            ${sectionHead('💡', 'Destaques')}
            <div class="db-insights">${rows}</div>
        </div>`;
}

/* ── SAÚDE DO NEGÓCIO ────────────────────────────────── */
function sectionSaude(h) {
    const stick = Number(h.stickiness_percent) || 0;
    const d7    = Number(h.retention_d7_percent) || 0;
    const d30   = Number(h.retention_d30_percent) || 0;
    const churn = Number(h.churn_rate_percent) || 0;

    return `
        <div class="db-section">
            ${sectionHead('📊', 'Saúde do Produto')}
            <div class="db-grid-4">
                ${card('Usuários cadastrados', fmt(h.total_users),
                    `${h.new_users_week ?? 0} novos esta semana`, '', true)}
                ${card('Ativos no mês (MAU)', fmt(h.mau),
                    `Stickiness DAU/MAU: ${stick}%`,
                    pct(stick, 20, 10))}
                ${card('Ativos hoje (DAU)', fmt(h.dau), '', '')}
                ${card('Logins totais', fmt(h.total_logins),
                    `${fmt(h.logins_today ?? 0)} hoje`)}
            </div>

            <div class="db-grid-4" style="margin-top:14px;">
                ${card('Retenção D7', `${d7}%`,
                    'Usuários que voltaram após 7 dias',
                    pct(d7, 30, 15))}
                ${card('Retenção D30', `${d30}%`,
                    'Usuários que voltaram após 30 dias',
                    pct(d30, 20, 10))}
                ${card('Churn (abandono)', `${churn}%`,
                    'Estimativa de perda mensal',
                    pct(100 - churn, 85, 70))}
                ${card('XP médio / usuário', fmt(h.avg_xp_per_user),
                    `${h.users_with_streak ?? 0} com sequência ativa`)}
            </div>
        </div>`;
}

/* ── APRENDIZADO ─────────────────────────────────────── */
function sectionAprendizado(l) {
    const score = Number(l.avg_score_percent ?? l.avg_completion_rate_percent) || 0;
    const diff  = l.difficulty_distribution || {};
    const top   = l.top_5_lessons || [];

    const topRows = top.map((t, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>Aula ${t.lesson_id}</td>
            <td>${fmt(t.accesses ?? t.attempts ?? 0)}</td>
        </tr>`).join('');

    return `
        <div class="db-section">
            ${sectionHead('📚', 'Aprendizado')}
            <div class="db-grid-4">
                ${card('Visualizações de aulas', fmt(l.lessons_page_views),
                    'Acessos à área de lições')}
                ${card('Aulas abertas', fmt(l.lessons_accessed),
                    `${l.unique_lessons_accessed ?? 0} aulas distintas`)}
                ${card('Aulas concluídas', fmt(l.lessons_completed),
                    'Com progresso salvo')}
                ${card('Aproveitamento médio', `${score}%`,
                    'Acerto nas aulas finalizadas',
                    pct(score, 70, 50))}
            </div>

            <div class="db-grid-2" style="margin-top:14px;">
                <div class="db-card-wide">
                    <div class="db-card-wide-title">Dificuldade das aulas acessadas</div>
                    <div class="db-diff-grid">
                        <div class="db-diff-pill easy">
                            <span class="db-diff-num">${diff.easy ?? 0}</span>
                            <span class="db-diff-lbl">Fácil</span>
                        </div>
                        <div class="db-diff-pill med">
                            <span class="db-diff-num">${diff.medium ?? 0}</span>
                            <span class="db-diff-lbl">Médio</span>
                        </div>
                        <div class="db-diff-pill hard">
                            <span class="db-diff-num">${diff.hard ?? 0}</span>
                            <span class="db-diff-lbl">Difícil</span>
                        </div>
                    </div>
                </div>

                ${top.length ? `
                <div class="db-table-wrap">
                    <table class="db-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Aula</th>
                                <th>Acessos</th>
                            </tr>
                        </thead>
                        <tbody>${topRows}</tbody>
                    </table>
                </div>` : '<div class="db-card"><div class="db-card-label">Top aulas</div><div class="db-card-sub">Nenhum dado ainda</div></div>'}
            </div>
        </div>`;
}

/* ── VOZ ─────────────────────────────────────────────── */
function sectionVoz(v) {
    const adoption = Number(v.voice_adoption_percent) || 0;
    const topics   = v.top_topics || [];

    const topicRows = topics.slice(0, 6).map(t => `
        <div class="db-topic-row">
            <span class="db-topic-name">${t.topic || 'Geral'}</span>
            <span class="db-topic-count">${fmt(t.count)}</span>
        </div>`).join('');

    return `
        <div class="db-section">
            ${sectionHead('🎙', 'Chat de Voz')}
            <div class="db-grid-4">
                ${card('Usuários com voz', fmt(v.users_with_voice),
                    `${adoption}% de adoção`, pct(adoption, 20, 10))}
                ${card('Minutos totais', fmt(v.total_voice_minutes),
                    'Minutos de prática acumulados')}
                ${card('Média por usuário', `${Number(v.avg_voice_minutes_per_user)||0} min`,
                    'Tempo em conversas de voz')}
                ${card('Sessões encerradas', fmt(v.voice_sessions ?? v.voice_conversations),
                    'Sessões salvas com métricas')}
            </div>

            ${topics.length ? `
            <div style="margin-top:14px;">
                <div class="db-card-wide" style="max-width:420px;">
                    <div class="db-card-wide-title">Tópicos mais praticados</div>
                    ${topicRows}
                </div>
            </div>` : ''}
        </div>`;
}

/* ── PADRÕES DE USO ──────────────────────────────────── */
function sectionPadroes(p) {
    const byType = p.activity_by_type || {};

    const typeRows = Object.entries(byType)
        .sort(([,a],[,b]) => b - a)
        .map(([type, count]) => `
            <div class="db-topic-row">
                <span class="db-topic-name">${labelActivityType(type)}</span>
                <span class="db-topic-count">${fmt(count)}</span>
            </div>`).join('');

    return `
        <div class="db-section">
            ${sectionHead('📅', 'Padrões de Uso')}
            <div class="db-grid-3">
                ${card('Atividade média / dia', fmt(p.avg_activity_per_day),
                    'Eventos nos últimos 30 dias')}
                ${card('Usuários consistentes', fmt(p.consistent_users_last_30d),
                    '5+ dias ativos no mês')}
                <div class="db-card-wide">
                    <div class="db-card-wide-title">Atividade por tipo</div>
                    ${typeRows || '<div class="db-card-sub">Nenhum dado</div>'}
                </div>
            </div>

            <div class="db-chart-card" style="margin-top:14px;">
                <div class="db-chart-title">Atividade diária — últimos 30 dias</div>
                <div class="db-chart-wrap">
                    <canvas id="activityChart"></canvas>
                </div>
            </div>
        </div>`;
}

function labelActivityType(t) {
    const map = {
        voice: 'Conversa de voz',
        lesson: 'Aula',
        general: 'Geral',
        quiz: 'Quiz',
        chat: 'Chat texto',
    };
    return map[t] || t;
}

/* ── JORNADA DO USUÁRIO ──────────────────────────────── */
function sectionJornada(f) {
    const onb   = Number(f.onboarding_completion_percent) || 0;
    const first = Number(f.first_use_rate_percent) || 0;
    const voice = Number(f.voice_adoption_rate_percent) || 0;

    const stages = f.onboarding_stages || {};
    const max = stages.started || 1;

    const stageItems = [
        { label: 'Cadastros', val: stages.started },
        { label: 'Etapa 1',   val: stages.step_1  },
        { label: 'Etapa 2',   val: stages.step_2  },
        { label: 'Etapa 3',   val: stages.step_3  },
        { label: 'Concluído', val: stages.completed },
    ];

    const progressRows = stageItems.map(s => {
        const w = max ? Math.round(((s.val || 0) / max) * 100) : 0;
        const cls = w >= 60 ? 'green' : w >= 30 ? '' : 'amber';
        return `
            <div class="db-progress-row">
                <span class="db-progress-label">${s.label}</span>
                <div class="db-progress-track">
                    <div class="db-progress-fill ${cls}" style="width:${w}%"></div>
                </div>
                <span class="db-progress-val">${fmt(s.val ?? 0)}</span>
            </div>`;
    }).join('');

    return `
        <div class="db-section">
            ${sectionHead('🚀', 'Jornada do Usuário')}
            <div class="db-grid-4">
                ${card('Onboarding completo', `${onb}%`,
                    'Usuários que finalizaram', pct(onb, 50, 25))}
                ${card('Taxa de primeiro uso', `${first}%`,
                    'Fizeram ≥ 1 atividade')}
                ${card('Adoção de voz', `${voice}%`,
                    'Tentaram o chat de voz', pct(voice, 20, 10))}
                ${card('Usuários ativos', fmt(f.users_ever_active),
                    'Com atividade registrada')}
            </div>

            <div class="db-card-wide" style="margin-top:14px; max-width:540px;">
                <div class="db-card-wide-title">Funil de onboarding</div>
                ${progressRows}
            </div>
        </div>`;
}

/* ── TÉCNICO ─────────────────────────────────────────── */
function sectionTecnico(t) {
    if (t?.status === 'unavailable') {
        return `
            <div class="db-section">
                ${sectionHead('⚡', 'Sistema')}
                <div class="db-card" style="max-width:320px;">
                    <div class="db-card-label">Status</div>
                    <div class="db-card-sub">Métricas técnicas indisponíveis</div>
                </div>
            </div>`;
    }

    const err   = Number(t?.error_rate_percent) || 0;
    const lat   = Number(t?.avg_latency_ms) || 0;
    const p95   = Number(t?.p95_latency_ms) || 0;

    return `
        <div class="db-section">
            ${sectionHead('⚡', 'Sistema')}
            <div class="db-grid-3">
                ${card('Requisições totais', fmt(t?.total_requests),
                    'Últimas 100 monitoradas')}
                ${card('Taxa de erro', `${err}%`,
                    'Erros / total de req.',
                    pct(100 - err, 98, 95))}
                ${card('Latência média', `${lat} ms`,
                    `P95: ${p95} ms`)}
                ${card('Tokens consumidos', fmt(t?.total_tokens),
                    'IA (Groq / LLM)')}
                ${card('Tokens por req.', fmt(t?.avg_tokens),
                    'Média por chamada de IA')}
            </div>
        </div>`;
}

/* ── CHARTS ──────────────────────────────────────────── */
function initCharts(d, cohorts) {
    // Atividade diária
    if (d.patterns?.daily_activity_last_30_days) {
        const canvas = document.getElementById('activityChart');
        if (!canvas) return;

        destroyChart('activityChart');
        const dates  = Object.keys(d.patterns.daily_activity_last_30_days).sort();
        const values = dates.map(k => d.patterns.daily_activity_last_30_days[k]);

        charts['activityChart'] = new Chart(canvas, {
            type: 'line',
            data: {
                labels: dates.map(d => {
                    const [, m, day] = d.split('-');
                    return `${day}/${m}`;
                }),
                datasets: [{
                    label: 'Eventos',
                    data: values,
                    borderColor: '#5A7E66',
                    backgroundColor: 'rgba(122,158,132,0.08)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#7A9E84',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#fff',
                        borderColor: '#D9E7DC',
                        borderWidth: 1,
                        titleColor: '#1F3B2D',
                        bodyColor: '#6A7B71',
                        padding: 10,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(217,231,220,0.5)' },
                        ticks: { color: '#A8B5AA', font: { size: 11 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: '#A8B5AA',
                            font: { size: 11 },
                            maxTicksLimit: 10,
                        }
                    }
                }
            }
        });
    }
}

function destroyChart(id) {
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

/* ── UI ──────────────────────────────────────────────── */
function showError(msg) {
    document.getElementById('content').innerHTML =
        `<div class="db-error">Erro: ${msg}</div>`;
}

function updateTimestamp() {
    const el = document.getElementById('lastUpdated');
    if (el) el.textContent = `Atualizado às ${new Date().toLocaleTimeString('pt-BR')}`;
}
