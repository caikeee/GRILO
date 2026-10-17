# -*- coding: utf-8 -*-
"""
Re-semeia os dados de demonstracao da Comunidade no banco local.

Roda com o servidor PARADO (o SQLite nao gosta de escrita concorrente).
E idempotente: apaga o que semeou antes (pelos usernames abaixo) e recria.
"""
import sqlite3
import json
import bcrypt
from datetime import datetime, timedelta

DB = 'grilo.db'
NOW = datetime.now()


def ago(days=0, hours=0):
    return (NOW - timedelta(days=days, hours=hours)).isoformat(sep=' ', timespec='seconds')


# username, nome de exibicao (email), admin?, senha
PEOPLE = [
    ('caike',           'caike@grilo.local',           1, 'Demo@Admin2026'),
    ('mariana.alves',   'mariana.alves@exemplo.com',   0, 'Demo@Grilo2026'),
    ('rafael.souza',    'rafael.souza@exemplo.com',    0, 'Demo@Grilo2026'),
    ('juliana.prado',   'juliana.prado@exemplo.com',   0, 'Demo@Grilo2026'),
    ('bruno.carvalho',  'bruno.carvalho@exemplo.com',  0, 'Demo@Grilo2026'),
    ('camila.ferreira', 'camila.ferreira@exemplo.com', 0, 'Demo@Grilo2026'),
    ('diego.martins',   'diego.martins@exemplo.com',   0, 'Demo@Grilo2026'),
]

# autor, tipo, titulo, descricao, status, aula, tags, votos, criado_ha_dias
TOPICS = [
    ('mariana.alves', 'question',
     'Quando usar "used to" e quando usar "would"?',
     'Na aula de habitos no passado os dois aparecem na mesma frase e eu nao entendi a diferenca. '
     'Alguem consegue explicar com um exemplo do dia a dia?',
     'open', 'a1-past-habits', ['gramatica', 'duvida'], 9, 2),

    ('rafael.souza', 'feature',
     'Modo "so escuta": treinar sem precisar falar',
     'Tem dia que estou no onibus e nao da pra falar em voz alta. Queria um modo que so toca as frases '
     'e me pede pra escolher o significado, pra manter a sequencia sem precisar do microfone.',
     'open', None, ['modo', 'escuta'], 24, 4),

    ('juliana.prado', 'question',
     'A aula de Present Perfect fala em "experiencia" — vale pra qualquer verbo?',
     'Fiquei com duvida se posso usar com qualquer verbo ou se tem um grupo especifico. '
     'No exercicio 3 a correcao aceitou uma frase que eu achei que estava errada.',
     'open', 'a2-present-perfect', ['gramatica'], 6, 1),

    ('bruno.carvalho', 'feature',
     'Revisar os erros da semana num bloco so',
     'Hoje os erros ficam espalhados entre as aulas. Seria bom juntar tudo numa sessao curta de '
     'sexta-feira, so com o que eu errei, tipo uma revisao guiada.',
     'in_progress', None, ['revisao', 'habito'], 31, 6),

    ('camila.ferreira', 'correction',
     'Traducao trocada no vocabulario da aula de rotina',
     'A palavra "commute" esta traduzida como "comutar". No contexto da aula o certo seria '
     '"deslocamento ate o trabalho" — comutar tem outro sentido em portugues.',
     'resolved', 'a1-daily-routine', ['vocabulario'], 14, 8),

    ('diego.martins', 'bug',
     'O audio nao toca quando volto pra aula pelo historico',
     'Se eu saio da aula no meio e entro de novo pelo historico, o botao de audio fica cinza. '
     'So volta se eu recarregar a pagina. Acontece no Chrome e no Edge.',
     'open', None, ['audio', 'web'], 11, 1),

    ('mariana.alves', 'resource',
     'Playlist de podcasts curtos pra treinar escuta no A2',
     'Montei uma lista de episodios de ate 8 minutos, todos com transcricao. '
     'Me ajudou bastante depois do shadowing. Posso compartilhar o link aqui?',
     'open', None, ['escuta', 'material'], 18, 3),
]

# topico (indice em TOPICS), autor, texto, is_system, ha_dias
COMMENTS = [
    (0, 'bruno.carvalho',
     '"Used to" e pra habito que acabou. "Would" so funciona pra acao repetida, nao pra estado — '
     'por isso "I used to live in Recife" funciona e "I would live in Recife" nao.', 0, 1),
    (0, 'mariana.alves',
     'Agora ficou claro, obrigada! O exemplo do "live" foi o que me pegou.', 0, 1),

    (1, 'camila.ferreira',
     'Eu usaria todo dia. Faco 40 minutos de metro e hoje perco esse tempo.', 0, 3),
    (1, 'diego.martins',
     'Mesma coisa aqui. Se der pra escolher a resposta por toque ja resolve.', 0, 2),

    (3, 'caike',
     'Status alterado de "Aberto" para "Em andamento".', 1, 2),
    (3, 'juliana.prado',
     'Boa! Se der pra escolher quantos itens por sessao ajuda muito.', 0, 1),

    (4, 'caike',
     'Status alterado de "Aberto" para "Resolvido".', 1, 5),
    (4, 'camila.ferreira',
     'Corrigido na ultima atualizacao, valeu!', 0, 4),

    (6, 'rafael.souza',
     'Compartilha sim! Acho que cabe como material fixo da trilha A2.', 0, 2),
]

# votantes por topico (indice em TOPICS)
VOTERS = {
    0: ['rafael.souza', 'bruno.carvalho', 'camila.ferreira'],
    1: ['mariana.alves', 'juliana.prado', 'camila.ferreira', 'diego.martins', 'bruno.carvalho'],
    2: ['mariana.alves', 'bruno.carvalho'],
    3: ['mariana.alves', 'rafael.souza', 'juliana.prado', 'camila.ferreira', 'diego.martins'],
    4: ['rafael.souza', 'juliana.prado', 'diego.martins'],
    5: ['mariana.alves', 'camila.ferreira'],
    6: ['juliana.prado', 'bruno.carvalho', 'diego.martins', 'rafael.souza'],
}


def main():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    usernames = [p[0] for p in PEOPLE]
    marks = ','.join('?' * len(usernames))

    # limpa o que este script semeou antes (e o que pendura nesses usuarios)
    cur.execute('SELECT id FROM users WHERE username IN (%s)' % marks, usernames)
    old_ids = [r[0] for r in cur.fetchall()]
    if old_ids:
        im = ','.join('?' * len(old_ids))
        cur.execute('DELETE FROM community_votes WHERE user_id IN (%s)' % im, old_ids)
        cur.execute('DELETE FROM community_comments WHERE user_id IN (%s)' % im, old_ids)
        cur.execute('SELECT id FROM community_topics WHERE user_id IN (%s)' % im, old_ids)
        tids = [r[0] for r in cur.fetchall()]
        if tids:
            tm = ','.join('?' * len(tids))
            cur.execute('DELETE FROM community_votes WHERE topic_id IN (%s)' % tm, tids)
            cur.execute('DELETE FROM community_comments WHERE topic_id IN (%s)' % tm, tids)
            cur.execute('DELETE FROM community_topics WHERE id IN (%s)' % tm, tids)
        cur.execute('DELETE FROM users WHERE id IN (%s)' % im, old_ids)

    # pessoas
    uid = {}
    for username, email, is_admin, pw in PEOPLE:
        h = bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
        cur.execute(
            'INSERT INTO users (username, email, password_hash, level, xp, streak, '
            'created_at, updated_at, is_admin, token_version, failed_login_count, onboarding_step) '
            'VALUES (?,?,?,?,?,?,?,?,?,0,0,2)',
            (username, email, h, 1, 120, 3, ago(30), ago(0), is_admin))
        uid[username] = cur.lastrowid

    # topicos
    tid = []
    for author, typ, title, desc, status, slug, tags, votes, days in TOPICS:
        created = ago(days)
        resolved = ago(max(days - 2, 0)) if status == 'resolved' else None
        cur.execute(
            'INSERT INTO community_topics (user_id, type, title, description, status, lesson_slug, '
            'tags, vote_count, comment_count, created_at, updated_at, resolved_at) '
            'VALUES (?,?,?,?,?,?,?,?,0,?,?,?)',
            (uid[author], typ, title, desc, status, slug, json.dumps(tags), votes,
             created, created, resolved))
        tid.append(cur.lastrowid)

    # comentarios
    counts = {}
    for idx, author, text, is_sys, days in COMMENTS:
        cur.execute(
            'INSERT INTO community_comments (topic_id, user_id, content, is_system, created_at) '
            'VALUES (?,?,?,?,?)',
            (tid[idx], uid[author], text, is_sys, ago(days)))
        counts[idx] = counts.get(idx, 0) + 1
    for idx, n in counts.items():
        cur.execute('UPDATE community_topics SET comment_count=? WHERE id=?', (n, tid[idx]))

    # votos (mantem vote_count coerente com as linhas reais)
    for idx, people in VOTERS.items():
        for p in people:
            cur.execute(
                'INSERT OR IGNORE INTO community_votes (topic_id, user_id, created_at) '
                'VALUES (?,?,?)', (tid[idx], uid[p], ago(1)))
        cur.execute(
            'UPDATE community_topics SET vote_count = '
            '(SELECT COUNT(*) FROM community_votes WHERE topic_id=?) WHERE id=?',
            (tid[idx], tid[idx]))

    conn.commit()

    print('pessoas:', len(PEOPLE))
    for r in cur.execute(
            'SELECT t.id, t.type, t.status, t.vote_count, t.comment_count, u.username, t.title '
            'FROM community_topics t JOIN users u ON u.id=t.user_id ORDER BY t.id').fetchall():
        print('  [%s] %-10s %-11s v=%-2s c=%-2s %-16s %s' % r)
    conn.close()


if __name__ == '__main__':
    main()
