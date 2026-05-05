/**
 * Dashboard Analytics - GRILO
 * Carrega e renderiza todas as métricas de observabilidade
 */

const API_BASE = window.location.origin;
const DASHBOARD_REFRESH_MS = 15 * 1000;
let chartsInstances = {};
let analyticsRequestInFlight = false;

document.addEventListener('DOMContentLoaded', () => {
    loadAnalytics();
    setInterval(loadAnalytics, DASHBOARD_REFRESH_MS);
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) loadAnalytics();
});

window.addEventListener('focus', loadAnalytics);

async function loadAnalytics() {
    if (analyticsRequestInFlight) return;
    analyticsRequestInFlight = true;
    try {
        const response = await fetch(`${API_BASE}/api/analytics/dashboard`);
        if (!response.ok) throw new Error('Erro ao buscar analytics');
        
        const result = await response.json();
        const data = result.data;

        renderDashboard(data);
        updateLastUpdated();
    } catch (error) {
        console.error('Analytics error:', error);
        showError(error.message);
    } finally {
        analyticsRequestInFlight = false;
    }
}

function renderDashboard(data) {
    const html = `
        ${renderInsights(data.insights)}
        ${renderBusinessHealth(data.health)}
        ${renderLearningMetrics(data.learning)}
        ${renderVoiceMetrics(data.voice)}
        ${renderPatterns(data.patterns)}
        ${renderFunnel(data.funnel)}
        ${renderTechnical(data.technical)}
    `;

    document.getElementById('content').innerHTML = html;

    // Inicializar gráficos depois de renderizar
    setTimeout(() => {
        initCharts(data);
    }, 100);
}

function renderInsights(insights) {
    if (!insights || insights.length === 0) {
        return '<div style="padding: 20px; color: #888;">Nenhum insight disponível</div>';
    }

    const insightHtml = insights.map(insight => `
        <div class="insight ${insight.type}">
            <div class="insight-title">🔍 ${insight.title}</div>
            <div class="insight-message">${insight.message}</div>
        </div>
    `).join('');

    return `
        <div class="section-title">📈 Top Insights</div>
        <div class="insights-container">
            ${insightHtml}
        </div>
    `;
}

function renderBusinessHealth(health) {
    const stickiness = health.stickiness_percent;
    const retention = health.retention_d7_percent;
    const churn = health.churn_rate_percent;

    return `
        <div class="section-title">💰 Saúde do Negócio</div>
        <div class="dashboard-grid">
            <div class="card">
                <div class="card-title">Total de Usuários</div>
                <div class="card-value">${formatNumber(health.total_users)}</div>
                <div class="card-stat">📅 ${health.new_users_week} novos esta semana</div>
            </div>

            <div class="card">
                <div class="card-title">MAU (Monthly Active)</div>
                <div class="card-value">${formatNumber(health.mau)}</div>
                <div class="card-stat">📊 ${health.stickiness_percent}% stickiness</div>
            </div>

            <div class="card">
                <div class="card-title">DAU (Daily Active)</div>
                <div class="card-value">${formatNumber(health.dau)}</div>
                <div class="card-label">DAU/MAU = ${health.stickiness_percent}%</div>
                <span class="badge ${stickiness > 30 ? 'badge-success' : 'badge-warning'}">
                    ${stickiness > 30 ? '✓ Bom' : '⚠ Baixo'}
                </span>
            </div>

            <div class="card">
                <div class="card-title">Retenção D7</div>
                <div class="card-value">${health.retention_d7_percent}%</div>
                <span class="badge ${retention > 40 ? 'badge-success' : 'badge-warning'}">
                    ${retention > 40 ? '✓ Saudável' : '⚠ Crítica'}
                </span>
            </div>

            <div class="card">
                <div class="card-title">Retenção D30</div>
                <div class="card-value">${health.retention_d30_percent}%</div>
                <div class="card-label">Usuários que voltam após 30 dias</div>
            </div>

            <div class="card">
                <div class="card-title">Churn Rate</div>
                <div class="card-value">${churn}%</div>
                <span class="badge ${churn < 15 ? 'badge-success' : 'badge-warning'}">
                    ${churn < 15 ? '✓ Aceitável' : '⚠ Alto'}
                </span>
            </div>

            <div class="card">
                <div class="card-title">Engagement</div>
                <div class="card-value">${formatNumber(health.avg_xp_per_user)} XP</div>
                <div class="card-label">Média por usuário</div>
                <div class="card-stat">💪 ${health.users_with_streak} com streak ativo</div>
            </div>

            <div class="card">
                <div class="card-title">Interações Médias</div>
                <div class="card-value">${health.avg_conversations_per_user}</div>
                <div class="card-label">Texto + voice por usuário ativo</div>
            </div>
        </div>
    `;
}

function renderLearningMetrics(learning) {
    const score = learning.avg_score_percent ?? learning.avg_completion_rate_percent;
    const difficulty = learning.difficulty_distribution;
    const uniqueLessons = learning.unique_lessons_accessed || 0;
    const exerciseSubmissions = learning.exercise_submissions || 0;

    return `
        <div class="section-title">📚 Qualidade de Aprendizado</div>
        <div class="dashboard-grid">
            <div class="card">
                <div class="card-title">Acessos a Aulas</div>
                <div class="card-value">${learning.lessons_accessed}</div>
                <div class="card-label">${uniqueLessons} aulas únicas abertas</div>
            </div>

            <div class="card">
                <div class="card-title">Aulas Concluídas</div>
                <div class="card-value">${learning.lessons_completed}</div>
                <div class="card-label">Progresso final salvo no banco</div>
            </div>

            <div class="card">
                <div class="card-title">Aproveitamento Médio</div>
                <div class="card-value">${score}%</div>
                <div class="card-label">Média de acerto nas aulas concluídas</div>
                <span class="badge ${score > 70 ? 'badge-success' : 'badge-warning'}">
                    ${score > 70 ? '✓ Bom' : '⚠ Revisar'}
                </span>
            </div>

            <div class="card">
                <div class="card-title">Badges Ganhos</div>
                <div class="card-value">${learning.total_badges_earned}</div>
                <div class="card-label">${learning.unique_badges} tipos únicos</div>
                <div class="card-stat">📝 ${exerciseSubmissions} exercícios enviados</div>
            </div>

            <div class="card">
                <div class="card-title">Distribuição de Dificuldade</div>
                <div style="font-size: 0.9rem; margin-top: 12px;">
                    🟢 Fácil: ${difficulty.easy} lições<br>
                    🟡 Médio: ${difficulty.medium} lições<br>
                    🔴 Difícil: ${difficulty.hard} lições
                </div>
            </div>
        </div>

        ${learning.top_5_lessons.length > 0 ? `
            <div class="table-container" style="margin-top: 20px;">
                <table>
                    <thead>
                        <tr>
                            <th>Lição ID</th>
                            <th>Acessos</th>
                            <th>Popularidade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${learning.top_5_lessons.map((l, i) => {
                            const accessCount = l.accesses ?? l.attempts ?? 0;
                            return `
                            <tr>
                                <td>#${l.lesson_id}</td>
                                <td>${accessCount}</td>
                                <td>${'★'.repeat(Math.max(1, Math.ceil(accessCount / 5)))}</td>
                            </tr>
                        `; }).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}
    `;
}

function renderVoiceMetrics(voice) {
    const adoption = voice.voice_adoption_percent;

    return `
        <div class="section-title">🗣️ Voice Chat</div>
        <div class="dashboard-grid">
            <div class="card">
                <div class="card-title">Usuários com Voice</div>
                <div class="card-value">${voice.users_with_voice}</div>
                <span class="badge ${adoption > 20 ? 'badge-success' : 'badge-info'}">
                    ${adoption}% de adoção
                </span>
            </div>

            <div class="card">
                <div class="card-title">Tempo Total de Voice</div>
                <div class="card-value">${formatNumber(voice.total_voice_minutes)}m</div>
                <div class="card-label">Minutos acumulados</div>
            </div>

            <div class="card">
                <div class="card-title">Média por Usuário</div>
                <div class="card-value">${voice.avg_voice_minutes_per_user}m</div>
                <div class="card-label">Tempo em voice chats</div>
            </div>

            <div class="card">
                <div class="card-title">Sessões de Voice</div>
                <div class="card-value">${formatNumber(voice.voice_sessions ?? voice.voice_conversations)}</div>
                <div class="card-label">Sessões encerradas e salvas</div>
            </div>

            ${voice.top_topics.length > 0 ? `
                <div class="card" style="grid-column: span 1;">
                    <div class="card-title">Tópicos Populares</div>
                    ${voice.top_topics.map(t => `
                        <div style="font-size: 0.9rem; margin: 8px 0; display: flex; justify-content: space-between;">
                            <span>${t.topic || 'general'}</span>
                            <strong>${t.count}</strong>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

function renderPatterns(patterns) {
    return `
        <div class="section-title">🕐 Padrões de Uso</div>
        <div class="dashboard-grid">
            <div class="card">
                <div class="card-title">Atividade Média por Dia</div>
                <div class="card-value">${patterns.avg_activity_per_day}</div>
                <div class="card-label">Eventos/dia (últimos 30 dias)</div>
            </div>

            <div class="card">
                <div class="card-title">Usuários Consistentes</div>
                <div class="card-value">${patterns.consistent_users_last_30d}</div>
                <div class="card-label">5+ dias ativos nos últimos 30 dias</div>
            </div>

            <div class="card">
                <div class="card-title">Atividades por Tipo</div>
                <div style="font-size: 0.85rem; margin-top: 12px;">
                    ${Object.entries(patterns.activity_by_type).map(([type, count]) => `
                        <div style="margin: 6px 0; display: flex; justify-content: space-between;">
                            <span>${type}</span>
                            <strong>${count}</strong>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="chart-container" style="margin-top: 30px;">
            <div class="chart-title">Atividade Diária (Últimos 30 dias)</div>
            <canvas id="activityChart"></canvas>
        </div>
    `;
}

function renderFunnel(funnel) {
    const onboarding = funnel.onboarding_completion_percent;
    const firstUse = funnel.first_use_rate_percent;
    const voiceAdoption = funnel.voice_adoption_rate_percent;

    return `
        <div class="section-title">🔀 Jornada do Usuário</div>
        <div class="dashboard-grid">
            <div class="card">
                <div class="card-title">Onboarding Completo</div>
                <div class="card-value">${onboarding}%</div>
                <span class="badge ${onboarding > 50 ? 'badge-success' : 'badge-warning'}">
                    ${onboarding > 50 ? '✓ Bom' : '⚠ Baixo'}
                </span>
            </div>

            <div class="card">
                <div class="card-title">Taxa de Primeiro Uso</div>
                <div class="card-value">${firstUse}%</div>
                <div class="card-label">Fizeram ao menos 1 atividade</div>
            </div>

            <div class="card">
                <div class="card-title">Adoção de Voice</div>
                <div class="card-value">${voiceAdoption}%</div>
                <div class="card-label">Usuários que tentaram</div>
            </div>

            <div class="card">
                <div class="card-title">Usuários Ativos</div>
                <div class="card-value">${funnel.users_ever_active}</div>
                <div class="card-label">Com atividade registrada</div>
            </div>
        </div>

        <div class="chart-container" style="margin-top: 30px;">
            <div class="chart-title">Funnel de Onboarding</div>
            <canvas id="funnelChart"></canvas>
        </div>
    `;
}

function renderTechnical(technical) {
    if (technical.status === 'unavailable') {
        return '<div class="section-title">⚡ Saúde Técnica</div><div style="padding: 20px; color: #888;">Métricas técnicas não disponíveis</div>';
    }

    return `
        <div class="section-title">⚡ Saúde Técnica</div>
        <div class="dashboard-grid">
            <div class="card">
                <div class="card-title">Requisições Totais</div>
                <div class="card-value">${technical.total_requests || 0}</div>
                <div class="card-label">Últimas 100 requisições</div>
            </div>

            <div class="card">
                <div class="card-title">Taxa de Erro</div>
                <div class="card-value">${technical.error_rate_percent || 0}%</div>
                <span class="badge ${(technical.error_rate_percent || 0) < 2 ? 'badge-success' : 'badge-warning'}">
                    ${(technical.error_rate_percent || 0) < 2 ? '✓ Normal' : '⚠ Elevada'}
                </span>
            </div>

            <div class="card">
                <div class="card-title">Latência Média</div>
                <div class="card-value">${technical.avg_latency_ms || 0}ms</div>
                <div class="card-label">Response time</div>
            </div>

            <div class="card">
                <div class="card-title">P95 Latência</div>
                <div class="card-value">${technical.p95_latency_ms || 0}ms</div>
                <div class="card-label">95º percentil</div>
            </div>

            <div class="card">
                <div class="card-title">Tokens Consumidos</div>
                <div class="card-value">${formatNumber(technical.total_tokens || 0)}</div>
                <div class="card-label">API tokens</div>
            </div>

            <div class="card">
                <div class="card-title">Média de Tokens</div>
                <div class="card-value">${Math.round(technical.avg_tokens || 0)}</div>
                <div class="card-label">Por requisição</div>
            </div>
        </div>
    `;
}

function initCharts(data) {
    // Chart 1: Atividade Diária
    if (data.patterns && data.patterns.daily_activity_last_30_days) {
        const activityCanvas = document.getElementById('activityChart');
        if (activityCanvas) {
            const sortedDates = Object.keys(data.patterns.daily_activity_last_30_days).sort();
            const activityValues = sortedDates.map(d => data.patterns.daily_activity_last_30_days[d]);

            destroyChart('activityChart');
            chartsInstances['activityChart'] = new Chart(activityCanvas, {
                type: 'line',
                data: {
                    labels: sortedDates,
                    datasets: [{
                        label: 'Eventos por dia',
                        data: activityValues,
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#22c55e',
                        pointBorderColor: '#1a1a1a',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            labels: { color: '#888' }
                        }
                    },
                    scales: {
                        y: {
                            ticks: { color: '#666' },
                            grid: { color: '#333' },
                            beginAtZero: true
                        },
                        x: {
                            ticks: { color: '#666' },
                            grid: { color: '#333' }
                        }
                    }
                }
            });
        }
    }

    // Chart 2: Funnel de Onboarding
    if (data.funnel && data.funnel.onboarding_stages) {
        const funnelCanvas = document.getElementById('funnelChart');
        if (funnelCanvas) {
            const stages = data.funnel.onboarding_stages;
            const funnelData = [
                stages.started,
                stages.step_1,
                stages.step_2,
                stages.step_3,
                stages.completed
            ];

            destroyChart('funnelChart');
            chartsInstances['funnelChart'] = new Chart(funnelCanvas, {
                type: 'bar',
                data: {
                    labels: ['Iniciados', 'Step 1', 'Step 2', 'Step 3', 'Completado'],
                    datasets: [{
                        label: 'Usuários no Stage',
                        data: funnelData,
                        backgroundColor: [
                            '#ef4444',
                            '#f97316',
                            '#eab308',
                            '#22c55e',
                            '#22c55e'
                        ],
                        borderRadius: 8,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#666' },
                            grid: { color: '#333' },
                            beginAtZero: true
                        },
                        y: {
                            ticks: { color: '#888' },
                            grid: { display: false }
                        }
                    }
                }
            });
        }
    }
}

function destroyChart(chartId) {
    if (chartsInstances[chartId]) {
        chartsInstances[chartId].destroy();
        delete chartsInstances[chartId];
    }
}

function showError(message) {
    document.getElementById('content').innerHTML = `
        <div class="error">
            ❌ Erro: ${message}
        </div>
    `;
}

function updateLastUpdated() {
    const now = new Date();
    document.getElementById('lastUpdated').textContent =
        `Última atualização: ${now.toLocaleString('pt-BR')}`;
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return Math.round(num).toString();
}
