"""
English Lessons for Beginners - A1 Level
50 lessons organized by thematic categories
For Brazilian Portuguese speakers
"""

import importlib.util
import os
from copy import deepcopy


MODULE_DIR = os.path.dirname(__file__)

SUPPORTED_NORMALIZED_EXERCISE_TYPES = {
    "multiple_choice",
    "fill_blank",
    "translate",
    "reorder_sentence",
    "true_false",
}

PT_BR_DIDACTIC_OVERRIDES = {
    1: {
        "title": "Hello e Hi: cumprimentos básicos",
        "description": "Aprenda a cumprimentar em inglês e iniciar conversas simples com confiança.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá cumprimentar alguém e iniciar uma conversa curta em inglês.",
            "real_world_scenario": "Imagine: você chega ao seu primeiro dia em uma empresa americana. A pessoa ao lado estende a mão e diz 'Hi!' — e você trava. Com esta aula, isso nunca mais vai acontecer.",
            "why_it_matters": "Cumprimentos são a porta de entrada de qualquer relacionamento. Dominar 'Hello' e 'Hi' significa que você consegue iniciar 100% das conversas em inglês — do atendimento no hotel ao primeiro encontro com um colega de trabalho.",
            "story_context": "Alex acaba de chegar em Nova York e está um pouco nervoso. Ele entra em uma cafeteria no Brooklyn para pedir seu primeiro café.",
            "introduction": "Nesta aula, você vai aprender os cumprimentos mais comuns para começar qualquer conversa em inglês.",
            "explanation": "Use 'Hello' em situações formais, como trabalho, atendimento ao cliente ou ao falar com desconhecidos. Use 'Hi' em situações informais, como amigos, colegas ou ambientes descontraídos. Depois do cumprimento, faça uma pergunta simples para manter a conversa — uma frase de cumprimento sem continuação soa estranha em inglês.",
            "cultural_insight": "Nos EUA, é muito comum estranhos se cumprimentarem com um sorriso e um rápido 'Hi' ou 'Hello' ao passarem um pelo outro na rua ou ao entrarem em lojas.",
            "common_mistakes": [
                "❌ Dizer só 'Hello' e ficar parado sem continuar — em inglês, o cumprimento é seguido de uma pergunta.",
                "❌ Usar 'Hello' com amigos próximos — soa formal demais. Use 'Hi' ou 'Hey'.",
                "❌ Pronunciar 'Hello' como 'Hélo' — a pronúncia correta é 'heh-LOU', com ênfase na segunda sílaba."
            ],
            "pronunciation_tip": "Hello = 'heh-LOU' (o 'H' é aspirado, a força vai na segunda parte). Hi = 'rai' (uma sílaba só, bem curtinho).",
            "notes": [
                "Hello = mais formal; Hi = mais informal.",
                "Após cumprimentar, continue com uma pergunta curta.",
                "Pratique em voz alta para ganhar fluidez."
            ],
            "summary": [
                "Use Hello em contexto formal.",
                "Use Hi em contexto informal.",
                "Cumprimente e continue com uma pergunta simples.",
                "O objetivo é soar natural, não perfeito."
            ],
        },
    },
    2: {
        "title": "Bom dia, boa tarde e boa noite em inglês",
        "description": "Aprenda saudações por horário e evite erros comuns ao falar com nativos.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá escolher a saudação correta de acordo com o horário do dia.",
            "real_world_scenario": "São 19h e você entra em um restaurante americano. O garçom sorri e diz 'Good evening!' — e você responde 'Good night!' O garçom fica confuso. Esse erro acontece todo dia com brasileiros. Nesta aula, você vai entender por que e como evitar.",
            "why_it_matters": "Usar a saudação errada para o horário do dia faz você parecer que não domina o idioma — mesmo que todo o resto esteja perfeito. São apenas 3 frases, mas elas abrem todas as conversas do dia.",
            "story_context": "É o primeiro dia de Alex no novo emprego. Ele chega ao escritório bem cedo e precisa cumprimentar os colegas que já estão lá.",
            "introduction": "Aqui você aprende quando usar Good morning, Good afternoon e Good evening — e por que 'Good night' não é o que você pensa.",
            "explanation": "Good morning é usado pela manhã, do amanhecer até aproximadamente meio-dia. Good afternoon é usado do meio-dia até o início da noite (por volta das 18h). Good evening é usado para cumprimentar no início da noite (18h em diante) — quando você CHEGA a algum lugar ou encontra alguém. 'Good night' é diferente de todos os outros: não é um cumprimento, é uma despedida noturna, equivalente a 'boa noite' quando você VAI embora ou vai dormir.",
            "cultural_insight": "Diferente do Brasil, onde 'Boa noite' serve para chegar e sair, em inglês usamos 'Good evening' para a chegada e 'Good night' estritamente para a saída ou antes de dormir.",
            "common_mistakes": [
                "❌ 'Good night' como cumprimento ao chegar a algum lugar à noite — sempre é despedida.",
                "❌ Usar 'Good morning' depois do meio-dia — muda para 'Good afternoon'.",
                "❌ Pronunciar 'evening' como 'evering' — a pronúncia correta é 'EEV-ning'."
            ],
            "pronunciation_tip": "Morning = 'MOR-ning'. Afternoon = 'af-ter-NOON'. Evening = 'EEV-ning'. Night = 'nait' (rima com 'bite').",
            "notes": [
                "Manhã: Good morning.",
                "Tarde: Good afternoon.",
                "Noite (ao chegar): Good evening.",
                "Good night = despedida noturna, nunca cumprimento."
            ],
            "summary": [
                "Use a saudação conforme o horário.",
                "Good night é mais usado para se despedir.",
                "Treine com relógio e situações reais.",
                "Escolha correta melhora sua naturalidade."
            ],
        },
    },
    3: {
        "title": "Como se apresentar em inglês",
        "description": "Domine as formas mais comuns de dizer seu nome e iniciar apresentações.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá se apresentar de forma formal e informal em inglês.",
            "real_world_scenario": "Você entra na sala de reunião de uma empresa americana pela primeira vez. Todo mundo ao redor se apresenta. Chega a sua vez. O que você diz? 'My name is...' ou 'I'm...'? Com esta aula, você vai saber — e soar natural.",
            "why_it_matters": "Saber se apresentar é literalmente a primeira coisa que você faz em qualquer situação nova: emprego, viagem, curso, evento. Dominar isso significa que você não vai mais travar na hora H.",
            "story_context": "Durante o intervalo do café, uma colega de trabalho se aproxima de Alex. É a oportunidade perfeita para ele dizer quem é.",
            "introduction": "Você vai aprender duas estruturas essenciais para dizer seu nome.",
            "explanation": "Use 'My name is ...' em situações formais — entrevista de emprego, reunião com clientes, primeiro contato profissional. Use 'I'm ...' em situações informais — festas, apresentações entre amigos, contextos casuais. As duas formas estão corretas, mas 'I'm' é a mais usada na fala do dia a dia. Depois de dizer seu nome, acrescente uma informação: 'I'm from Brazil' ou 'I work in marketing' — isso mantém a conversa fluindo.",
            "cultural_insight": "Americanos costumam ser bem diretos nas apresentações. O uso de apelidos (nicknames) é muito comum logo no primeiro contato se a pessoa se apresentar assim. Se alguém diz 'Call me Mike', use Mike — não Michael.",
            "common_mistakes": [
                "❌ 'I am [nome]' sem contexto — funciona, mas soa rígido. Prefira 'I'm [nome]' em situações casuais.",
                "❌ Parar depois do nome — sempre acrescente uma informação extra para a conversa continuar.",
                "❌ Pronunciar seu nome sem adaptar — às vezes vale oferecer uma versão mais fácil: 'Call me Rod'."
            ],
            "pronunciation_tip": "Diga 'I'm' como 'aim' (rima com 'game'). 'My name is' = 'mai neim iz' — fale fluido, sem pausa entre as palavras.",
            "notes": [
                "My name is = mais formal.",
                "I'm = mais comum na fala.",
                "Após se apresentar, acrescente uma informação simples."
            ],
            "summary": [
                "As duas formas de apresentação são corretas.",
                "Escolha a forma conforme o contexto.",
                "Apresentação curta e clara é o suficiente.",
                "Pratique com seu próprio nome e cidade."
            ],
        },
    },
    4: {
        "title": "Como perguntar o nome de alguém",
        "description": "Aprenda perguntas naturais para descobrir o nome da outra pessoa com educação.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá perguntar e entender o nome de alguém de forma natural.",
            "real_world_scenario": "Você está em um evento de networking e quer conversar com uma pessoa interessante ao seu lado. Como você começa? Com esta aula, você vai saber perguntar o nome de forma natural — e o que fazer quando não entender a resposta.",
            "why_it_matters": "Perguntar o nome de alguém corretamente cria o primeiro ponto de conexão. Saber as nuances te dá confiança para iniciar qualquer conversa.",
            "story_context": "Alex quer conhecer melhor seus vizinhos no prédio onde está morando. Ele vê alguém no corredor e decide iniciar uma conversa.",
            "introduction": "Perguntar o nome é uma das primeiras etapas de qualquer conversa — mas existem formas mais e menos naturais de fazer isso.",
            "explanation": "A pergunta mais natural no dia a dia é 'What's your name?' (contração de 'What is your name?'). A forma completa 'What is your name?' é mais formal — use em entrevistas, situações oficiais. Se não entender o nome: 'Sorry, could you repeat that?' ou 'How do you spell that?' (Como se escreve?). Em inglês americano informal, você também pode dizer logo após uma apresentação: 'Sorry, I didn't catch your name.' (Desculpa, não peguei seu nome.)",
            "cultural_insight": "Se você não entender o nome de alguém de primeira, não tenha vergonha de perguntar novamente. Os americanos ficam mais irritados quando você erra o nome repetidamente do que quando pede para repetir uma vez.",
            "common_mistakes": [
                "❌ 'What is your name, please?' com entonação errada — o 'please' no final pode soar condescendente sem a entonação certa.",
                "❌ Não perguntar quando não entende — leva a constrangimentos maiores depois.",
                "❌ 'What's your name?' como única opção — 'Sorry, I didn't catch your name' é mais natural após uma apresentação."
            ],
            "pronunciation_tip": "What's = 'wots' (o 'a' vira som de 'o'). Your = 'yor'. Name = 'neim'. Diga rápido: 'wots yor neim?'",
            "notes": [
                "What's your name? é a forma mais usada.",
                "What is your name? é a forma mais formal.",
                "Para não entender: 'Sorry, could you repeat that?'"
            ],
            "summary": [
                "Pergunte o nome com frases curtas e claras.",
                "Use a forma casual no dia a dia.",
                "Use a forma completa em contexto formal.",
                "Não entendeu? Sempre pergunte — é educado, não fraqueza."
            ],
        },
    },
    5: {
        "title": "Respostas educadas ao conhecer alguém",
        "description": "Use expressões de cortesia para causar boa impressão nas primeiras conversas.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá responder com educação quando conhecer alguém em inglês.",
            "real_world_scenario": "Você acaba de ser apresentado ao gerente da empresa com quem vai trabalhar. Ele estende a mão e diz 'Nice to meet you.' O que você responde? 'You too'? 'Nice to meet you too'? 'Me too'? Com esta aula, você vai saber a diferença — e o que soará mais profissional.",
            "why_it_matters": "Responder corretamente a um cumprimento mostra que você domina não apenas o inglês, mas também as regras sociais da língua. Isso constrói confiança instantaneamente — seja em uma entrevista ou numa festa.",
            "story_context": "Alex finalmente conhece sua vizinha, Sarah. Ela se apresenta e ele precisa responder de forma educada para causar uma boa impressão.",
            "introduction": "Nesta aula, você aprende frases curtas e educadas para encontros iniciais — e como variar o tom conforme o contexto.",
            "explanation": "'Nice to meet you' é a resposta padrão e funciona em quase todo contexto — casual e profissional. A resposta mais comum é 'Nice to meet you too' ou simplesmente 'You too' (mais informal). 'Pleased to meet you' é mais formal, usado em contextos profissionais ou ao conhecer pessoas importantes. 'Great to meet you' é mais informal e caloroso — transmite entusiasmo genuíno. Sequência típica: A diz 'Nice to meet you' → B responde 'Nice to meet you too' ou 'You too' → A continua com uma pergunta.",
            "cultural_insight": "O aperto de mão (handshake) é comum em contextos profissionais ou no primeiro encontro, mas em situações muito informais, um aceno com a cabeça e um sorriso bastam. Evite abraçar pessoas que você acabou de conhecer nos EUA — é considerado invasão do espaço pessoal.",
            "common_mistakes": [
                "❌ Responder 'Nice to meet you' com 'Thank you' — parece que você está agradecendo por algo, não correspondendo à cortesia.",
                "❌ Dizer 'Me too' — isso significa 'eu também gosto de mim mesmo/a'. O certo é 'You too' ou 'Nice to meet you too'.",
                "❌ Ignorar o cumprimento e ir direto ao assunto — mesmo em reuniões rápidas, a troca de cortesias é esperada."
            ],
            "pronunciation_tip": "Nice = 'nais'. Meet = 'meet' (i longo). You = 'yu'. Too = 'too'. Diga fluido: 'nais-tu-MEET-yu-too'.",
            "notes": [
                "Nice to meet you funciona em quase toda situação.",
                "Pleased to meet you é mais formal.",
                "Responda com naturalidade e sorriso.",
                "Nunca: 'Me too' — sempre: 'You too' ou 'Nice to meet you too'."
            ],
            "summary": [
                "Use respostas curtas e educadas.",
                "Escolha o nível de formalidade correto.",
                "Repita a cortesia para manter a conversa.",
                "Nunca: 'Me too' — sempre: 'You too' ou 'Nice to meet you too'."
            ],
        },
    },
    6: {
        "title": "Idade e aniversário",
        "description": "No elevador do prédio, Sarah descobre que o aniversário de Alex está chegando — aprenda a falar sobre idade com naturalidade.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá perguntar a idade de alguém e contar a sua, sem usar 'ter' como em português.",
            "story_context": "No elevador do prédio, Sarah nota um cartão de parabéns na mochila de Alex e pergunta quando é o aniversário dele. Alex sorri e aproveita para praticar os números e os meses do ano.",
            "introduction": "Em inglês, você não 'tem' uma idade — você 'é' ela. Essa diferença parece pequena, mas é o erro mais comum do brasileiro ao falar sobre idade.",
            "explanation": "Em português dizemos 'Eu TENHO 25 anos'. Em inglês, usamos o verbo 'to be': 'I AM 25 years old'. Nunca diga 'I have 25 years' — isso não existe em inglês! Para perguntar a idade: 'How old are you?' Para o aniversário: 'My birthday is on [mês] [dia]'. A forma curta 'I'm 25' (sem 'years old') também é totalmente natural na fala.",
            "cultural_insight": "Nos EUA, perguntar a idade entre jovens amigos é normal e casual. Mas em ambientes de trabalho ou ao falar com pessoas mais velhas, é um tópico sensível — espere a pessoa mencionar por conta própria.",
            "pro_tips": [
                "Pratique agora: diga sua idade em voz alta — 'I'm [sua idade] years old.'",
                "Diga o mês do seu aniversário em inglês: January, February, March... Qual é o seu?",
                "Combine as duas informações: 'My birthday is on [mês] [dia]. I'm [idade] years old.'"
            ],
            "notes": [
                "⚠️ Erro típico do brasileiro: 'I have 25 years' — ERRADO. O correto é 'I am 25 years old'.",
                "A forma curta 'I'm 25' é natural e usada em conversas casuais.",
                "Meses do ano sempre com letra maiúscula: January, February, March..."
            ],
            "summary": [
                "Pergunta: How old are you?",
                "Resposta: I am [número] years old — ou só 'I'm [número]'.",
                "Aniversário: My birthday is on [Mês] [Dia].",
                "Regra de ouro: em inglês, idade usa o verbo 'to be', não 'have'."
            ],
        },
    },
    7: {
        "title": "Nacionalidade e origem",
        "description": "Sarah ouve o sotaque de Alex e quer saber de onde ele é — aprenda a falar sobre sua origem e nacionalidade.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá dizer de onde é e sua nacionalidade, e entender a diferença entre 'from' e o adjetivo de nacionalidade.",
            "story_context": "No café logo depois do trabalho, Sarah ouve o sotaque simpático de Alex e pergunta: 'Where are you from?' Alex sente um orgulho natural ao responder que é brasileiro, e a conversa se abre para histórias sobre o Brasil.",
            "introduction": "Dizer de onde você veio é uma das primeiras conexões humanas em qualquer idioma. Em inglês, isso se faz de duas formas: pela origem geográfica e pela nacionalidade.",
            "explanation": "Para falar do lugar: 'I am FROM Brazil' ou 'I am FROM São Paulo'. O 'from' indica ponto de partida — pense nele como uma etiqueta de bagagem. Para a nacionalidade, usamos um adjetivo direto: 'I am Brazilian'. Não existe 'I am from Brazilian' — ou você é 'from Brazil' (lugar) ou 'Brazilian' (adjetivo de nacionalidade). Países e nacionalidades sempre com letra maiúscula.",
            "cultural_insight": "Nova York é chamada de 'Melting Pot' (caldeirão cultural) — quase todo mundo veio de outro lugar. Ao dizer 'I'm from Brazil', prepare-se para ouvir sobre futebol, carnaval, café ou Iguaçu — os americanos adoram o Brasil.",
            "pro_tips": [
                "Pratique sua frase completa: 'I'm from [cidade], Brazil. I'm Brazilian.'",
                "Se perguntarem onde fica: 'It's in South America, near Argentina.'",
                "Se quiser continuar a conversa: 'Have you ever been to Brazil?'"
            ],
            "notes": [
                "⚠️ Erro típico: 'I am from Brazilian' — ERRADO. Escolha um: 'from Brazil' (lugar) ou 'Brazilian' (adjetivo).",
                "Países e nacionalidades sempre com inicial maiúscula: Brazil, Brazilian, American.",
                "Você pode ser específico: 'I'm from São Paulo, Brazil.'"
            ],
            "summary": [
                "Origem: I am from [País/Cidade].",
                "Nacionalidade: I am [adjetivo] — I am Brazilian.",
                "Nunca combine os dois: 'from Brazilian' não existe.",
                "Países e nacionalidades sempre com letra Maiúscula."
            ],
        },
    },
    8: {
        "title": "Profissões e trabalho",
        "description": "No caminho para o metrô, Alex e Sarah descobrem o que cada um faz — aprenda a perguntar e falar sobre profissões.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá perguntar a profissão de alguém e falar a sua, usando 'a' e 'an' corretamente.",
            "story_context": "Saindo do escritório, Alex e Sarah caminham até a estação de metrô. Sarah pergunta: 'So, what do you do?' — e Alex percebe que nunca treinou essa resposta em inglês.",
            "introduction": "Em inglês, a pergunta sobre profissão não é 'What is your job?' — a forma mais natural é muito mais curta: 'What do you do?'",
            "explanation": "Para perguntar: 'What do you do?' (literalmente: 'O que você faz?'). Para responder: 'I am a/an [profissão]'. Atenção à regra do artigo: use 'a' antes de som de consoante (a teacher, a doctor, a nurse) e 'an' antes de som de vogal (an engineer, an actor, an architect). Em português não usamos artigo na profissão ('Sou médico'), mas em inglês o artigo é OBRIGATÓRIO ('I am a doctor').",
            "cultural_insight": "Em Nova York, 'What do you do?' é quase um cartão de visita verbal — as pessoas se apresentam pelo trabalho e pela ambição. Não se sinta pressionado: dizer 'I'm a student' ou 'I'm between jobs' é completamente aceitável.",
            "pro_tips": [
                "Pratique agora: 'I am a/an [sua profissão].' — diga em voz alta.",
                "Se você estuda: 'I am a student. I study [sua área].'",
                "Para perguntar de volta: 'What about you? What do you do?'"
            ],
            "notes": [
                "⚠️ Erro típico do brasileiro: 'I am doctor' — ERRADO. Sempre use o artigo: 'I am a doctor'.",
                "Use 'an' antes de vogal: an engineer, an architect, an artist.",
                "Use 'an' antes de som de vogal, não necessariamente letra vogal: 'an hour' (h mudo)."
            ],
            "summary": [
                "Pergunta: What do you do?",
                "Resposta: I am a/an [profissão] — artigo SEMPRE obrigatório.",
                "a = antes de som de consoante | an = antes de som de vogal.",
                "Versão alternativa: 'I work as a [profissão].'"
            ],
        },
    },
    9: {
        "title": "Hobbies e interesses",
        "description": "No Central Park, Alex e Sarah trocam hobbies — aprenda a falar sobre o que você gosta com diferentes níveis de entusiasmo.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá falar sobre seus hobbies e perguntar os de outra pessoa, usando like, enjoy e love de forma natural.",
            "story_context": "No final de semana, Alex encontra Sarah correndo no Central Park. Sentados em um banco, eles trocam histórias sobre o que cada um gosta de fazer na cidade — e Alex aprende que 'like' não é a única palavra para 'gostar'.",
            "introduction": "Hobbies criam conexão real em qualquer idioma. Em inglês, você tem três verbos para 'gostar', cada um com um nível diferente de entusiasmo.",
            "explanation": "Os três verbos de preferência: 'like' (gostar), 'enjoy' (curtir, apreciar) e 'love' (adorar). Em português usamos 'gostar' para tudo — em inglês você tem mais nuance. Importante: depois de like/enjoy/love, use o verbo com -ING: 'I like RUNNING', 'I enjoy READING', 'I love COOKING'. Nunca 'I like run'. Para perguntar: 'What do you like to do in your free time?' ou 'What are your hobbies?'",
            "cultural_insight": "Americanos levam hobbies muito a sério — grupos de corrida, clubes de livro, ligas de esporte amador são formas comuns de socializar. Ter um hobby é quase uma identidade: 'I'm a runner', 'I'm a foodie'.",
            "pro_tips": [
                "Diga dois hobbies seus agora: 'I like [hobby 1] and I love [hobby 2].'",
                "Use o nível certo: like = gosto, enjoy = curto bastante, love = adoro.",
                "Para perguntar de volta: 'What about you? What do you enjoy doing?'"
            ],
            "notes": [
                "⚠️ Erro típico: 'I like run' — ERRADO. Use -ING: 'I like running'.",
                "Like < Enjoy < Love (ordem crescente de entusiasmo).",
                "Free time = tempo livre. In my free time = no meu tempo livre."
            ],
            "summary": [
                "Pergunta: What do you like to do in your free time?",
                "Verbos: like (gostar) | enjoy (curtir) | love (adorar).",
                "Após esses verbos, sempre use -ING: reading, running, cooking.",
                "Hobbies são uma das melhores portas de entrada para conversas reais."
            ],
        },
    },
    10: {
        "title": "Situação familiar e relacionamentos",
        "description": "Alex mostra fotos da família para Sarah — aprenda a falar sobre estado civil e filhos do jeito certo.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá descrever seu estado civil e falar se tem filhos, sem cometer os erros mais comuns do português.",
            "story_context": "Alex abre o celular e mostra fotos da família para Sarah. Ela pergunta quem é quem — e Alex precisa explicar, em inglês, quem é casado, quem é solteiro e quantos filhos cada um tem.",
            "introduction": "Falar sobre família e relacionamento exige atenção a dois pontos: o vocabulário de estado civil e a palavra 'children', que é diferente de 'childs'.",
            "explanation": "Estado civil: 'I am single' (solteiro/a), 'I am married' (casado/a), 'I am divorced' (divorciado/a). Para filhos: 'I have [número] children' — atenção, o plural de 'child' é 'children', não 'childs'. Se tiver um: 'I have one child'. Se não tiver: 'I don't have children'. Em português usamos 'filhos' para tudo; em inglês, o formal é 'children', o casual é 'kids'.",
            "cultural_insight": "Nos EUA é cada vez mais comum usar o termo 'partner' (parceiro/a) em vez de 'boyfriend' ou 'girlfriend' para relacionamentos sérios — é uma forma mais neutra e moderna de falar. Em formulários, você pode encontrar 'domestic partner'.",
            "pro_tips": [
                "Pratique: 'I am [seu estado civil]. I have [número] children.' ou 'I don't have children yet.'",
                "Para perguntar de forma educada: 'Are you married?' ou 'Do you have kids?'",
                "Se tiver namorado/a: 'I have a boyfriend/girlfriend.' Se for sério: 'I have a partner.'"
            ],
            "notes": [
                "⚠️ Erro típico: 'I have two childs' — ERRADO. O plural irregular é 'children'.",
                "Single = solteiro | Married = casado | Divorced = divorciado | Widowed = viúvo.",
                "'Kids' é mais informal que 'children' — ambos estão corretos no dia a dia."
            ],
            "summary": [
                "Estado civil: I am single / married / divorced.",
                "Filhos: I have [número] children — child → children (plural irregular).",
                "Partner = termo neutro e moderno para companheiro/a.",
                "Kids = informal | Children = formal — os dois são aceitos."
            ],
        },
    },
    # ===== WAVE 2 – Aulas 11–30 (PT-BR didáticas) =====
    11: {
        "title": "Membros da família — vocabulário essencial",
        "description": "Alex faz uma videochamada e apresenta Sarah para a família — aprenda os nomes dos membros da família com as formas casuais e formais.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá nomear os membros da família em inglês e usar 'I have' para falar sobre eles.",
            "story_context": "Alex faz uma videochamada com a família no Brasil. Ele apresenta Sarah para a mãe ('This is my mom!') e para o irmão mais novo. A mãe pergunta em português quem é Sarah — e Alex ri, explicando em inglês.",
            "introduction": "Família é um dos temas mais universais do inglês. Antes de aprender tudo de uma vez, domine as palavras mais usadas no dia a dia — as versões casuais que todo americano usa.",
            "explanation": "Membros principais: mother/mom (mãe), father/dad (pai), sister (irmã), brother (irmão), grandparents (avós). 'Mom' e 'Dad' são as formas casuais usadas no dia a dia — assim como 'Mãe' e 'Pai' em português. 'Mother' e 'Father' aparecem em contextos mais formais. Para dizer que você tem alguém na família: 'I have [número] + membro'. Ex: 'I have two brothers and one sister.' Uma palavra útil: 'siblings' = irmãos (sem especificar gênero).",
            "cultural_insight": "Nos EUA, o Thanksgiving (Ação de Graças, novembro) é a grande reunião da 'extended family' — toda a família ampliada: tios (uncles), tias (aunts), primos (cousins). É o equivalente ao Natal brasileiro em termos de reunião familiar.",
            "pro_tips": [
                "Descreva sua família agora: 'I have [número] brothers/sisters. My mom is [adjetivo].'",
                "Para apresentar alguém: 'This is my mom/brother/sister.'",
                "Para falar de alguém ausente: 'My dad works as a [profissão].'"
            ],
            "notes": [
                "Mom/Dad = casual (uso diário) | Mother/Father = formal (documentos, discursos).",
                "Siblings = irmãos sem especificar gênero — muito usado quando não quer detalhar.",
                "⚠️ Plural irregular: child → children. Nunca 'childs'."
            ],
            "summary": [
                "Mom/Dad = casual | Mother/Father = formal.",
                "Sister = irmã | Brother = irmão | Siblings = irmãos (gênero neutro).",
                "Para falar de família: I have + número + membro.",
                "Extended family = família ampliada: aunts, uncles, cousins."
            ],
        },
    },
    12: {
        "title": "Descrevendo membros da família",
        "description": "Sarah quer saber como é a irmã de Alex — aprenda a descrever pessoas com adjetivos simples e sem concordância de gênero.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá descrever membros da família usando adjetivos básicos, sem os erros de concordância comuns do português.",
            "story_context": "Sarah vê a foto da irmã de Alex no celular e pergunta: 'What is she like?' Alex tenta descrever a irmã — engraçada, inteligente, um pouco teimosa — e percebe que em inglês os adjetivos não mudam. Nunca.",
            "introduction": "Descrever pessoas em inglês é mais simples do que em português: os adjetivos não mudam para masculino, feminino, singular ou plural. Um único adjetivo serve para todos.",
            "explanation": "Estrutura: [Pessoa] + is + adjetivo. Ex: 'My sister is funny.' / 'My brother is funny.' O adjetivo 'funny' não muda — serve para irmão e irmã, para um e para muitos. Para combinar adjetivos, use 'and': 'She is young and kind.' Para intensificar, use 'very': 'He is very funny.' Em português dizemos 'engraçada' e 'engraçado' — em inglês é sempre 'funny', sem variação.",
            "cultural_insight": "Elogiar a família de alguém é uma forma natural de criar conexão nos EUA. Dizer 'Your sister sounds really kind' ou 'Your mom seems amazing' são elogios genuínos e bem recebidos.",
            "pro_tips": [
                "Descreva um membro da sua família agora: 'My [membro] is [adjetivo] and [adjetivo].'",
                "Adjetivos úteis para começar: tall, short, funny, kind, smart, hardworking, young, old.",
                "Para perguntar como alguém é: 'What is he/she like?' (não 'How is he/she?' — essa pergunta é sobre saúde)."
            ],
            "notes": [
                "⚠️ Adjetivos em inglês NÃO variam: funny = engraçado e engraçada. Não existe 'funnied' ou 'funnys'.",
                "Estrutura sempre: [pessoa] + is/are + adjetivo.",
                "'What is he/she like?' = Como ele/ela é? | 'How is he/she?' = Como ele/ela está? (saúde)"
            ],
            "summary": [
                "Estrutura: My [membro] is [adjetivo].",
                "Adjetivos não mudam para gênero ou número — nunca.",
                "Use 'very' para intensificar: very tall, very smart.",
                "Combine com 'and': She is young and hardworking."
            ],
        },
    },
    13: {
        "title": "Família — palavras básicas",
        "description": "Domine o vocabulário fundamental para falar sobre os membros principais da família.",
        "content": {
            "learning_goal": "Ao final desta aula, você reconhecerá e usará as palavras para os membros básicos da família.",
            "introduction": "Nesta aula focamos nas palavras mais usadas para descrever a família nuclear e próxima.",
            "explanation": "Os membros básicos da família incluem: mother (mãe), father (pai), sister (irmã), brother (irmão) e baby (bebê). No inglês informal é comum usar Mom e Dad. Uma dica importante: o termo 'sibling' cobre tanto irmão quanto irmã — é útil quando você não quer especificar o sexo.",
            "notes": [
                "Sibling = irmão ou irmã (sem especificar sexo).",
                "Mom/Dad são as formas casuais mais usadas no dia a dia.",
                "Baby pode ser usado para bebê de qualquer gênero."
            ],
            "summary": [
                "Mother/Mom, Father/Dad, Sister, Brother, Baby.",
                "Sibling = irmão ou irmã (neutro).",
                "Mom e Dad são casuais; Mother e Father são formais."
            ],
        },
    },
    14: {
        "title": "Família ampliada — avós, tios e primos",
        "description": "Expanda seu vocabulário de família com avós, tios, tias e primos em inglês.",
        "content": {
            "learning_goal": "Ao final desta aula, você saberá nomear e explicar as relações da família ampliada em inglês.",
            "introduction": "Além dos pais e irmãos, há toda a família ampliada! Aprenda como chamar avós, tios e primos em inglês.",
            "explanation": "Família ampliada inclui: grandmother/grandma (avó), grandfather/grandpa (avô), aunt (tia), uncle (tio) e cousin (primo ou prima). Atenção: 'cousin' em inglês serve para primo E prima — não há distinção de gênero. Para perguntar sobre parentesco, use: 'Who is she?' / 'She is my aunt.'",
            "notes": [
                "Cousin = primo ou prima — sem distinção de gênero em inglês.",
                "Grandma/Grandpa são informais; Grandmother/Grandfather são formais.",
                "Para descrever relações: 'She is my mother's sister' = 'She is my aunt.'"
            ],
            "summary": [
                "Grandmother/Grandma, Grandfather/Grandpa, Aunt, Uncle, Cousin.",
                "Cousin é neutro — serve para primo e prima.",
                "Para explicar relações: 'my mother's sister = my aunt'."
            ],
        },
    },
    15: {
        "title": "Estado civil e relacionamentos",
        "description": "Aprenda o vocabulário para descrever situações de estado civil e tipos de relacionamento em inglês.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá descrever o estado civil de alguém e perguntar sobre relacionamentos.",
            "introduction": "Em conversas formais e informais, estado civil aparece com frequência. Aprenda as palavras certas para cada situação.",
            "explanation": "Estado civil em inglês: married (casado/a), single (solteiro/a), divorced (divorciado/a), widowed (viúvo/a), engaged (noivo/a). Pergunte com: 'Are you married?' Responda com: 'I'm single' ou 'I'm married.' Widowed descreve quem perdeu o cônjuge.",
            "notes": [
                "Engaged = noivo/a — quem está planejando se casar.",
                "Widowed = viúvo/a — quem perdeu o cônjuge.",
                "Use 'I am' para descrever seu próprio estado: 'I'm married.'"
            ],
            "summary": [
                "Married (casado), Single (solteiro), Divorced (divorciado), Widowed (viúvo), Engaged (noivo).",
                "Pergunte: Are you married? | Responda: I'm single.",
                "Engaged = planejando casar; Widowed = perdeu o cônjuge."
            ],
        },
    },
    16: {
        "title": "Números de 0 a 20",
        "description": "Domine os números de zero a vinte em inglês — base para toda comunicação numérica.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá dizer e escrever os números de 0 a 20 em inglês.",
            "introduction": "Os números de 0 a 20 são a base de tudo — idades, quantidades, horas. Vamos aprender todos eles!",
            "explanation": "Os números até 12 são únicos e precisam ser memorizados. De 13 a 19, quase todos seguem o padrão: base + teen (thirteen, fourteen, fifteen...). Atenção às exceções: eleven (11) e twelve (12) não seguem padrão. 'Zero' é pronunciado como 'zero' ou 'oh' no dia a dia.",
            "notes": [
                "11 = eleven, 12 = twelve — não seguem padrão, memorize!",
                "13 a 19 = base + teen: fourteen, sixteen, seventeen...",
                "Cuidado com a pronúncia de 13 (thirteen) vs 30 (thirty)."
            ],
            "summary": [
                "Números únicos: zero a twelve — memorize.",
                "Padrão teen: thirteen, fourteen, fifteen... nineteen.",
                "Eleven e twelve são exceções sem padrão."
            ],
        },
    },
    17: {
        "title": "Números de 20 a 100",
        "description": "Aprenda a contar de vinte a cem em inglês com o padrão de dezenas e combinações.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá dizer e entender qualquer número de 20 a 100 em inglês.",
            "introduction": "Agora que você conhece os números básicos, é hora de avançar para as dezenas e combinações!",
            "explanation": "As dezenas seguem um padrão: twenty (20), thirty (30), forty (40), fifty (50), sixty (60), seventy (70), eighty (80), ninety (90). Para os números intermediários, combine dezena + hífen + unidade: twenty-one, thirty-five, ninety-nine. O 100 é 'one hundred' ou apenas 'hundred'.",
            "notes": [
                "Sempre use hífen entre a dezena e a unidade: forty-five (não fortyfive).",
                "Forty (40) não tem 'u' — é uma exceção de escrita.",
                "Hundred = 100. Para 200: two hundred."
            ],
            "summary": [
                "Dezenas: twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety.",
                "Combinar: trinta e cinco = thirty-five (com hífen).",
                "Forty não tem 'u' — exceção ortográfica importante."
            ],
        },
    },
    18: {
        "title": "Números ordinais",
        "description": "Aprenda os números ordinais em inglês para falar de posição, ordem e datas.",
        "content": {
            "learning_goal": "Ao final desta aula, você saberá usar números ordinais para indicar posição e datas em inglês.",
            "introduction": "Ordinais indicam ordem ou posição: primeiro lugar, segundo andar, terceiro mês. São essenciais para datas e rankings.",
            "explanation": "Os três primeiros são irregulares: first (1º), second (2º), third (3º). Do quarto em diante, a regra é: número cardinal + th. Exceções de escrita: fifth (não fiveth), eighth (não eighthth), ninth (não nineth). Para datas, use ordinal + of + mês: 'the fifth of January' = 5 de janeiro.",
            "notes": [
                "First, second, third são irregulares — memorize!",
                "De fourth em diante: adicione -th ao cardinal.",
                "Exceções: fifth, eighth, ninth, twelfth — aprenda a escrever certo."
            ],
            "summary": [
                "Irregulares: first, second, third.",
                "Regra geral: número + th (fourth, sixth, tenth...).",
                "Para datas: the fifth of March = 5 de março."
            ],
        },
    },
    19: {
        "title": "Dias da semana e meses do ano",
        "description": "Aprenda os dias da semana e os meses do ano em inglês para usar em datas e planejamentos.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá nomear os dias da semana e os meses em inglês e usá-los em frases.",
            "introduction": "Dias e meses são essenciais para combinar compromissos, ler calendários e entender datas em inglês.",
            "explanation": "Dias da semana: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Meses: January, February, March, April, May, June, July, August, September, October, November, December. Regra importante: em inglês os dias e meses sempre começam com letra maiúscula.",
            "notes": [
                "Dias e meses sempre com letra maiúscula em inglês.",
                "Weekend = sábado e domingo (Saturday and Sunday).",
                "Weekdays = dias úteis: Monday to Friday."
            ],
            "summary": [
                "7 dias: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.",
                "12 meses: January a December.",
                "Dias e meses sempre com letra maiúscula."
            ],
        },
    },
    20: {
        "title": "Dizendo as horas em inglês",
        "description": "Aprenda a perguntar e responder sobre horas em inglês usando as expressões mais comuns.",
        "content": {
            "learning_goal": "Ao final desta aula, você saberá dizer e perguntar as horas em inglês com expressões naturais.",
            "introduction": "Saber dizer as horas é essencial para combinar encontros, entender horários e se virar no dia a dia em inglês.",
            "explanation": "Para perguntar: 'What time is it?' Para responder, use: 'It is [hora]'. Expressões-chave: o'clock (em ponto), half past (e meia = :30), quarter past (e quinze = :15), quarter to (menos quinze = :45). Exemplo: 3:00 = three o'clock | 3:30 = half past three | 3:15 = quarter past three | 3:45 = quarter to four.",
            "notes": [
                "O'clock só é usado para horas exatas: one o'clock, two o'clock.",
                "Half past = e meia. Ex: half past six = 6:30.",
                "Quarter to = menos quinze. Ex: quarter to eight = 7:45."
            ],
            "summary": [
                "Perguntar: What time is it?",
                "Em ponto: [hora] o'clock.",
                "E meia: half past [hora] | E quinze: quarter past [hora] | Menos quinze: quarter to [hora+1]."
            ],
        },
    },
    21: {
        "title": "Alimentos básicos em inglês",
        "description": "Aprenda o vocabulário dos alimentos mais comuns para usar em restaurantes, mercados e refeições.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá nomear alimentos comuns e usá-los em frases simples.",
            "introduction": "Alimentos são um tema diário e essencial. Nesta aula você aprende os nomes dos alimentos mais usados em inglês.",
            "explanation": "Alimentos básicos: bread (pão), rice (arroz), chicken (frango), cheese (queijo), egg (ovo). Em inglês, alguns alimentos são incontáveis — não usamos 'a' ou número com eles: bread, rice. Já egg é contável: one egg, two eggs. Para falar do que você come: 'I eat [alimento]' ou 'I like [alimento].'",
            "notes": [
                "Bread e rice são incontáveis — não usamos 'a bread' ou 'a rice'.",
                "Egg é contável: one egg, three eggs.",
                "Para preferências: 'I like + alimento' ou 'I don't like + alimento'."
            ],
            "summary": [
                "Alimentos básicos: bread, rice, chicken, cheese, egg.",
                "Incontáveis (sem 'a/an'): bread, rice. Contáveis: egg, apple.",
                "Use 'I eat' ou 'I like' para falar sobre alimentação."
            ],
        },
    },
    22: {
        "title": "Bebidas e líquidos",
        "description": "Aprenda os nomes das bebidas mais comuns em inglês para usar em restaurantes, cafés e no dia a dia.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá pedir e nomear bebidas comuns em inglês.",
            "introduction": "Saber pedir uma bebida é uma das primeiras necessidades em inglês. Vamos aprender as palavras mais usadas!",
            "explanation": "Bebidas essenciais: water (água), coffee (café), milk (leite), tea (chá), juice (suco). Para pedir em cafés ou restaurantes, use: 'Can I have a [bebida], please?' ou 'I'd like a [bebida].' Bebidas são incontáveis em inglês — diga 'a cup of coffee' ou 'a glass of water' para indicar quantidade.",
            "notes": [
                "Bebidas são incontáveis: use 'a glass of / a cup of' para quantidade.",
                "Can I have a coffee? = uma forma educada de pedir.",
                "Juice pode ser acompanhado do tipo: orange juice, apple juice."
            ],
            "summary": [
                "Bebidas: water, coffee, milk, tea, juice.",
                "Para pedir: Can I have a [bebida], please?",
                "Use 'a cup of' ou 'a glass of' para indicar porção."
            ],
        },
    },
    23: {
        "title": "Frutas e verduras",
        "description": "Aprenda o vocabulário de frutas e vegetais para compras no mercado e conversas sobre alimentação saudável.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá nomear frutas e vegetais comuns e usá-los em frases descritivas.",
            "introduction": "Frutas e vegetais aparecem em compras, receitas e conversas sobre saúde. Aprenda como se chamam em inglês!",
            "explanation": "Frutas comuns: apple (maçã), banana, orange (laranja), strawberry (morango). Vegetais: carrot (cenoura), lettuce (alface), tomato (tomate). Para descrever cor e característica, use: [fruta/vegetal] + is + adjetivo. Ex: 'Bananas are yellow.' Uma curiosidade: botanicamente o tomato é uma fruta, mas culinariamente é tratado como vegetal.",
            "notes": [
                "Para falar de cor: 'Carrots are orange.' / 'Lettuce is green.'",
                "Strawberry = morango — palavra diferente do espanhol!",
                "Plural da maioria: basta adicionar -s. Strawberry → strawberries (exceção)."
            ],
            "summary": [
                "Frutas: apple, banana, orange, strawberry.",
                "Vegetais: carrot, lettuce, tomato.",
                "Para descrever: [fruta/vegetal] + is/are + adjetivo."
            ],
        },
    },
    24: {
        "title": "Refeições e horários de comer",
        "description": "Aprenda os nomes das refeições do dia e o vocabulário básico de alimentação em inglês.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá falar sobre as refeições do dia e o que come em cada uma.",
            "introduction": "Café da manhã, almoço, jantar — cada refeição tem seu nome em inglês. Aprenda e use no dia a dia!",
            "explanation": "As três refeições principais são: breakfast (café da manhã), lunch (almoço), dinner (jantar). Outras: snack (lanche/petisco) e dessert (sobremesa). Para dizer o que você come em cada refeição: 'For breakfast, I eat [alimento].' Para falar do horário: 'I have breakfast at 7 AM.'",
            "notes": [
                "Breakfast = café da manhã (da manhã até ao meio-dia).",
                "Dinner = jantar (à noite).",
                "Snack = pequeno lanche entre refeições principais."
            ],
            "summary": [
                "Refeições: breakfast (manhã), lunch (meio-dia), dinner (noite).",
                "Snack = lanche extra | Dessert = sobremesa.",
                "Use: 'For [refeição], I eat [alimento].'"
            ],
        },
    },
    25: {
        "title": "Preferências alimentares e gostos",
        "description": "Aprenda a expressar o que você gosta ou não gosta de comer e descrever sabores em inglês.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá expressar preferências alimentares e descrever sabores em inglês.",
            "introduction": "Falar sobre o que você gosta de comer é uma das conversas mais naturais em inglês. Vamos aprender!",
            "explanation": "Use 'I like + alimento' para dizer que gosta. Use 'I don't like + alimento' para dizer que não gosta. Palavras de sabor: sweet (doce), salty (salgado), sour (azedo), bitter (amargo), spicy (picante). Uma dica importante: em inglês usamos 'like + gerúndio' quando o next elemento é uma ação: 'I like eating pizza', não 'I like eat pizza'.",
            "notes": [
                "I like + substantivo OR I like + verbo-ing.",
                "Sabores: sweet, salty, sour, bitter, spicy, delicious.",
                "Para alergia: 'I'm allergic to [alimento]' — frase importante para situações reais."
            ],
            "summary": [
                "Gostar: I like [alimento] | Não gostar: I don't like [alimento].",
                "Sabores: sweet, salty, sour, bitter, spicy.",
                "I like eating = verbo-ing após 'like'."
            ],
        },
    },
    26: {
        "title": "Cômodos da casa e móveis",
        "description": "Aprenda a nomear os cômodos de uma casa e os principais móveis em inglês.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá nomear cômodos da casa e descrever onde você faz atividades do dia a dia.",
            "introduction": "Descrever sua casa em inglês é muito comum em conversas. Aprenda os nomes dos cômodos e dos móveis mais importantes!",
            "explanation": "Cômodos: kitchen (cozinha), living room (sala de estar), bedroom (quarto), bathroom (banheiro). Móveis comuns: table (mesa), chair (cadeira), bed (cama), sofa/couch (sofá). Para dizer o que você faz em cada cômodo, use: 'I [ação] in the [cômodo].' Ex: 'I sleep in the bedroom.' / 'I cook in the kitchen.'",
            "notes": [
                "Living room = sala de estar (onde a família se reúne).",
                "Use 'in the' antes de cômodos: in the kitchen, in the bedroom.",
                "Bathroom pode ser banheiro ou lavabo dependendo do contexto."
            ],
            "summary": [
                "Cômodos: kitchen, living room, bedroom, bathroom.",
                "Móveis: table, chair, bed, sofa.",
                "Estrutura: I [ação] in the [cômodo]."
            ],
        },
    },
    27: {
        "title": "Lugares da cidade",
        "description": "Aprenda o vocabulário dos principais lugares de uma cidade em inglês para se orientar e pedir ajuda.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá nomear lugares da cidade e dizer o que faz em cada um.",
            "introduction": "Navegar pela cidade em inglês exige saber os nomes dos lugares! Aprenda os mais importantes nesta aula.",
            "explanation": "Lugares essenciais: bank (banco), school (escola), hospital (hospital), park (parque), supermarket (supermercado), restaurant (restaurante). Use 'at the [lugar]' para dizer onde está ou vai: 'I'm at the bank.' / 'I go to the supermarket on Saturdays.' Use 'the' antes do nome do lugar.",
            "notes": [
                "Sempre use 'the' antes do lugar: the bank, the school, the park.",
                "Go to the = ir para. Frase natural para rotina: 'I go to the supermarket.'",
                "At the = estar em. Ex: 'I'm at the hospital.'"
            ],
            "summary": [
                "Lugares: bank, school, hospital, park, supermarket, restaurant.",
                "Use 'the' antes do lugar: the bank, the school.",
                "Go to the [lugar] = ir até o lugar | At the [lugar] = estar no lugar."
            ],
        },
    },
    28: {
        "title": "Preposições de lugar",
        "description": "Aprenda as preposições de lugar em inglês para descrever onde objetos e pessoas estão.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá usar preposições de lugar para descrever a posição de objetos e pessoas.",
            "introduction": "Saber dizer onde algo está é fundamental. Com as preposições certas, você consegue dar e entender qualquer direção!",
            "explanation": "Preposições de lugar essenciais: on (sobre/em cima), under (embaixo), in (dentro), between (entre), next to (ao lado de), in front of (na frente de), behind (atrás de). Use a estrutura: [objeto] + is + preposição + [referência]. Ex: 'The book is on the table.' / 'The cat is under the chair.'",
            "notes": [
                "On = superfície (on the table, on the wall).",
                "In = espaço fechado (in the box, in the room).",
                "Between = entre dois objetos específicos (between the bank and the school)."
            ],
            "summary": [
                "Preposições: on, under, in, between, next to, in front of, behind.",
                "Estrutura: [objeto] + is + preposição + [referência].",
                "On = superfície | In = espaço fechado | Under = abaixo."
            ],
        },
    },
    29: {
        "title": "Direções e imperativo",
        "description": "Aprenda a dar e seguir direções em inglês usando o modo imperativo.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá dar instruções de direção em inglês usando verbos no imperativo.",
            "introduction": "Pedir informações e dar direções é uma das situações mais práticas em inglês. Aprenda os verbos e expressões essenciais!",
            "explanation": "O imperativo em inglês é simples: use o verbo base sem sujeito. Ex: 'Go straight ahead.' / 'Turn left.' / 'Stop here.' Verbos de direção: go (ir), turn (virar), walk (caminhar), stop (parar), cross (atravessar). Direções: left (esquerda), right (direita), straight (em frente). Para ser educado, adicione 'please': 'Please turn right.'",
            "notes": [
                "Imperativo = verbo base, sem sujeito: Turn left. Go straight.",
                "Adicione 'please' para soar educado: Please turn left.",
                "Straight ahead = em frente — expressão muito usada."
            ],
            "summary": [
                "Imperativo: verbo base sem sujeito (Go, Turn, Stop).",
                "Direções: left (esquerda), right (direita), straight (em frente).",
                "Para ser educado: Please + imperativo."
            ],
        },
    },
    30: {
        "title": "Onde fica? — Perguntas de localização",
        "description": "Aprenda a perguntar e responder onde algo fica usando 'Where is/are' em inglês.",
        "content": {
            "learning_goal": "Ao final desta aula, você conseguirá perguntar e responder sobre a localização de objetos e lugares em inglês.",
            "introduction": "A pergunta 'Where is it?' é uma das mais úteis em inglês. Aprenda a usá-la e a responder com segurança!",
            "explanation": "Para perguntar localização use: 'Where is [singular]?' ou 'Where are [plural]?' Para responder, combine o verbo 'is/are' com uma preposição de lugar: 'It is on the table.' / 'They are in the bedroom.' A diferença: 'Where is' = singular | 'Where are' = plural. Exemplos: 'Where is my phone? It is on the table.' / 'Where are the keys? They are in the bag.'",
            "notes": [
                "Where is = singular | Where are = plural.",
                "Responda com: It is / They are + preposição + referência.",
                "Contração: Where's = onde está (informal e muito usado)."
            ],
            "summary": [
                "Where is [singular]? / Where are [plural]?",
                "Resposta: It is + preposição + lugar.",
                "Where's = contração informal de Where is."
            ],
        },
    },
}



def _as_text(value, default=""):
    if value is None:
        return default
    text = str(value).strip()
    return text if text else default


def _ensure_text_list(value):
    if isinstance(value, list):
        clean = [_as_text(item) for item in value]
        return [item for item in clean if item]
    text = _as_text(value)
    return [text] if text else []


def _normalize_translate_prompt(question):
    lower_q = question.lower()
    if lower_q.startswith("translate to english:"):
        return "Traduza para o inglês:" + question[len("Translate to English:") :]
    if lower_q.startswith("translate:"):
        return "Traduza:" + question[len("Translate:") :]
    return question


def _resolve_correct_index(exercise, options):
    raw_index = exercise.get("correct")
    if isinstance(raw_index, int) and 0 <= raw_index < len(options):
        return raw_index

    answer_text = _as_text(exercise.get("answer")).lower()
    if answer_text:
        for idx, option in enumerate(options):
            if _as_text(option).lower() == answer_text:
                return idx
    return None


def _normalize_matching_exercise(exercise):
    terms = [_as_text(opt) for opt in (exercise.get("options") or []) if _as_text(opt)]
    raw_answer = _as_text(exercise.get("answer"))
    definitions = [part.strip() for part in raw_answer.split(",") if part.strip()]

    if not terms:
        return None

    anchor_term = terms[0]
    correct_definition = definitions[0] if definitions else f"Definição correta de {anchor_term}."
    distractors = [item for item in definitions[1:] if item and item != correct_definition]
    fallback_distractors = [
        f"Definição de {terms[-1] if terms else 'outro termo'}.",
        "Descrição genérica sem relação.",
        "Significado oposto ao termo.",
    ]

    options = [correct_definition]
    for candidate in distractors + fallback_distractors:
        if candidate not in options:
            options.append(candidate)
        if len(options) == 4:
            break

    while len(options) < 4:
        options.append(f"Opção {len(options) + 1}")

    return {
        "type": "multiple_choice",
        "question": f"No exercício de associação, qual definição combina com '{anchor_term}'?",
        "question_pt": "Conecte o termo ao seu significado correto:",
        "options": options,
        "correct": 0,
        "explanation": "Dica: associe o termo ao significado mais direto.",
    }


def _normalize_vocabulary_match_exercise(exercise):
    raw_pairs = exercise.get("options") or []
    pairs = []
    for pair in raw_pairs:
        if not isinstance(pair, dict):
            continue
        english_word = _as_text(pair.get("english_word"))
        portuguese_word = _as_text(pair.get("portuguese_word"))
        if english_word and portuguese_word:
            pairs.append((english_word, portuguese_word))

    if not pairs:
        return None

    anchor_english, correct_portuguese = pairs[0]
    distractors = [pt for _, pt in pairs[1:] if pt != correct_portuguese]
    fallback_distractors = ["Pai", "Mãe", "Irmão", "Irmã"]

    options = [correct_portuguese]
    for candidate in distractors + fallback_distractors:
        if candidate not in options:
            options.append(candidate)
        if len(options) == 4:
            break

    while len(options) < 4:
        options.append(f"Opção {len(options) + 1}")

    return {
        "type": "multiple_choice",
        "question": f"Qual é a tradução correta de '{anchor_english}'?",
        "question_pt": "Escolha a tradução correta para a palavra em inglês:",
        "options": options,
        "correct": 0,
        "explanation": "Dica: releia o vocabulário principal da aula.",
    }


def _normalize_exercise(exercise):
    if not isinstance(exercise, dict):
        return None

    exercise_type = _as_text(exercise.get("type"), "multiple_choice").lower()

    if exercise_type == "matching":
        return _normalize_matching_exercise(exercise)
    if exercise_type == "vocabulary_match":
        return _normalize_vocabulary_match_exercise(exercise)

    raw_options = exercise.get("options") or []
    if not isinstance(raw_options, list):
        raw_options = []

    options = []
    for opt in raw_options:
        if isinstance(opt, dict):
            if "label" in opt:
                option_text = _as_text(opt.get("label"))
            elif "english_word" in opt and "portuguese_word" in opt:
                option_text = f"{_as_text(opt.get('english_word'))} = {_as_text(opt.get('portuguese_word'))}"
            else:
                option_text = _as_text(opt)
        else:
            option_text = _as_text(opt)

        if option_text:
            options.append(option_text)

    if exercise_type == "true_false" and not options:
        options = ["True", "False"]

    if not options:
        options = ["Opção 1", "Opção 2", "Opção 3", "Opção 4"]

    if len(options) > 4:
        options = options[:4]
    while len(options) < 4:
        options.append(f"Opção {len(options) + 1}")

    correct_index = _resolve_correct_index(exercise, options)
    if correct_index is None:
        correct_index = 0

    question = _as_text(exercise.get("question"), "Selecione a alternativa correta.")
    if exercise_type == "translate":
        question = _normalize_translate_prompt(question)

    normalized_type = (
        exercise_type if exercise_type in SUPPORTED_NORMALIZED_EXERCISE_TYPES else "multiple_choice"
    )

    _PT_HINTS = {
        "multiple_choice": "Escolha a opção correta:",
        "true_false": "Verdadeiro ou falso?",
        "fill_blank": "Complete o espaço em branco:",
        "fill-blank": "Complete o espaço em branco:",
        "translate": "Traduza para o inglês:",
        "translation": "Traduza para o inglês:",
        "matching": "Conecte os pares correspondentes:",
        "vocabulary_match": "Conecte a palavra com o seu significado:",
        "reorder_sentence": "Reordene as palavras para formar uma frase:",
    }

    return {
        "type": normalized_type,
        "question": question,
        "question_pt": exercise.get("question_pt") or _PT_HINTS.get(normalized_type, "Responda à pergunta:"),
        "options": options,
        "correct": correct_index,
        "explanation": _as_text(
            exercise.get("explanation"), "Revise a explicação da aula e tente novamente."
        ),
    }


def _normalize_vocabulary_items(vocabulary_items, examples):
    if not isinstance(vocabulary_items, list):
        return []

    normalized = []
    for item in vocabulary_items:
        if isinstance(item, dict):
            word = _as_text(item.get("word"))
            translation = _as_text(item.get("translation"))
            example = _as_text(item.get("example"))
        else:
            word = _as_text(item)
            translation = ""
            example = ""

        if not word:
            continue

        if not example:
            token = word.split("/")[0].split(" ")[0].strip().lower()
            for ex in examples:
                english_example = _as_text(ex.get("english"))
                if token and token in english_example.lower():
                    example = english_example
                    break

        if not example:
            example = f"Use '{word}' em uma frase simples."

        normalized.append(
            {
                "word": word,
                "translation": translation or "Sem tradução disponível",
                "example": example,
            }
        )
    return normalized


def _default_description(title):
    return f"Pratique o tema '{title}' com explicação em português e exercícios guiados para iniciantes."


def _default_learning_goal(title):
    return f"Ao final desta aula, você conseguirá usar o tema '{title}' em frases curtas do dia a dia."


def _apply_pt_br_override(lesson):
    override = PT_BR_DIDACTIC_OVERRIDES.get(lesson.get("id"))
    if not override:
        return

    if override.get("title"):
        lesson["title"] = override["title"]
    if override.get("description"):
        lesson["description"] = override["description"]

    content = lesson.get("content", {})
    content_override = override.get("content", {})
    for key in (
        "learning_goal",
        "story_context",
        "introduction",
        "explanation",
        "cultural_insight",
        "pro_tips",
        "notes",
        "summary",
    ):
        if key in content_override:
            content[key] = deepcopy(content_override[key])
    lesson["content"] = content


def _normalize_lesson(raw_lesson):
    lesson = deepcopy(raw_lesson) if isinstance(raw_lesson, dict) else {}
    lesson_id = int(lesson.get("id", 0))
    title = _as_text(lesson.get("title"), f"Aula {lesson_id}")

    raw_content = lesson.get("content") if isinstance(lesson.get("content"), dict) else {}
    raw_examples = raw_content.get("examples") if isinstance(raw_content.get("examples"), list) else []

    examples = []
    for ex in raw_examples:
        if not isinstance(ex, dict):
            continue
        english = _as_text(ex.get("english"))
        portuguese = _as_text(ex.get("portuguese"))
        if english or portuguese:
            examples.append({"english": english, "portuguese": portuguese})

    exercises = []
    for ex in raw_content.get("exercises") if isinstance(raw_content.get("exercises"), list) else []:
        normalized_exercise = _normalize_exercise(ex)
        if normalized_exercise:
            exercises.append(normalized_exercise)

    normalized_content = {
        "learning_goal": _as_text(raw_content.get("learning_goal"), _default_learning_goal(title)),
        "story_context": _as_text(raw_content.get("story_context"), None),
        "introduction": _as_text(raw_content.get("introduction"), "Introdução em atualização."),
        "explanation": _as_text(raw_content.get("explanation"), "Explicação em atualização."),
        "cultural_insight": _as_text(raw_content.get("cultural_insight"), None),
        "examples": examples,
        "vocabulary": _normalize_vocabulary_items(raw_content.get("vocabulary"), examples),
        "notes": _ensure_text_list(raw_content.get("notes")),
        "pro_tips": _ensure_text_list(raw_content.get("pro_tips")) if raw_content.get("pro_tips") else None,
        "exercises": exercises,
        "summary": _ensure_text_list(raw_content.get("summary")),
    }

    lesson["id"] = lesson_id
    lesson["title"] = title
    lesson["level"] = _as_text(lesson.get("level"), "A1")
    lesson["lesson_type"] = _as_text(lesson.get("lesson_type"), "general")
    lesson["categories"] = _ensure_text_list(lesson.get("categories"))
    lesson["description"] = _as_text(lesson.get("description"), _default_description(title))

    raw_time = lesson.get("estimated_time")
    if not isinstance(raw_time, int) or raw_time <= 0:
        raw_time = max(10, len(exercises) * 4)
    lesson["estimated_time"] = raw_time
    lesson["content"] = normalized_content

    _apply_pt_br_override(lesson)

    lesson["content"]["notes"] = _ensure_text_list(lesson["content"].get("notes"))
    lesson["content"]["summary"] = _ensure_text_list(lesson["content"].get("summary"))
    lesson["content"]["learning_goal"] = _as_text(
        lesson["content"].get("learning_goal"), _default_learning_goal(lesson["title"])
    )
    lesson["description"] = _as_text(lesson.get("description"), _default_description(lesson["title"]))
    return lesson

# Try to import additional lessons if available
try:
    # Try to load lessons 13-30
    spec = importlib.util.spec_from_file_location(
        "lessons_a1_13_30", os.path.join(MODULE_DIR, "lessons_a1_13_30.py")
    )
    if spec and spec.loader:
        module_13_30 = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module_13_30)
        # Get lessons 13-30
        try:
            additional_lessons = module_13_30.get_all_lessons()
            print(f"[LESSONS] Successfully loaded {len(additional_lessons)} additional lessons")
            LESSONS_13_30 = additional_lessons
        except:
            LESSONS_13_30 = []
    else:
        LESSONS_13_30 = []
except Exception as e:
    print(f"[LESSONS] Could not load lessons 13-30: {e}")
    LESSONS_13_30 = []

# Try to load lessons 31-50
try:
    spec2 = importlib.util.spec_from_file_location(
        "lessons_a1_31_50", os.path.join(MODULE_DIR, "lessons_a1_31_50.py")
    )
    if spec2 and spec2.loader:
        module_31_50 = importlib.util.module_from_spec(spec2)
        spec2.loader.exec_module(module_31_50)
        try:
            LESSONS_31_50 = module_31_50.get_all_lessons()
            print(f"[LESSONS] Successfully loaded {len(LESSONS_31_50)} lessons (31-50)")
        except:
            LESSONS_31_50 = []
    else:
        LESSONS_31_50 = []
except Exception as e:
    print(f"[LESSONS] Could not load lessons 31-50: {e}")
    LESSONS_31_50 = []


def get_all_lessons():
    """Returns all 50 A1 lessons organized by category"""
    # Import base lessons (1-12) from inline definitions
    base_lessons = [
        # ==================== CATEGORY 1: GREETINGS & INTRODUCTIONS ====================
        {
            "id": 1,
            "title": "Hello and Hi - Basic Greetings",
            "level": "A1",
            "lesson_type": "vocabulary",
            "categories": ["Greetings & Introductions"],
            "content": {
                "introduction": "Learn the most common ways to greet people in English. These are the first words you'll use when meeting someone.",
                "explanation": "In English, we use 'Hello' and 'Hi' to greet people. 'Hello' is more formal and 'Hi' is more casual. Both are appropriate in most situations. When greeting someone for the first time, you often add a handshake or a wave.",
                "examples": [
                    {
                        "english": "Hello! How are you?",
                        "portuguese": "Olá! Como você está?"
                    },
                    {
                        "english": "Hi! Nice to see you.",
                        "portuguese": "Oi! Legal te ver."
                    },
                    {
                        "english": "Hello there!",
                        "portuguese": "Olá!"
                    },
                    {
                        "english": "Hi, what's your name?",
                        "portuguese": "Oi, qual é o seu nome?"
                    },
                    {
                        "english": "Hello, I'm David.",
                        "portuguese": "Olá, sou David."
                    },
                    {
                        "english": "Hi! I'm Maria. Nice to meet you.",
                        "portuguese": "Oi! Sou Maria. Prazer em conhecer."
                    }
                ],
                "vocabulary": [
                    {"word": "Hello", "translation": "Olá"},
                    {"word": "Hi", "translation": "Oi"},
                    {"word": "How are you?", "translation": "Como você está?"},
                    {"word": "Nice to meet you", "translation": "Prazer em conhecer"},
                    {"word": "Name", "translation": "Nome"}
                ],
                "notes": [
                    "Use 'Hello' in formal situations (meetings, interviews, customer service)",
                    "Use 'Hi' with friends and casual situations",
                    "Always follow a greeting with a question like 'How are you?' to be polite"
                ],
                "exercises": [
                    {
                        "type": "multiple_choice",
                        "question": "What do you say when meeting someone for the first time?",
                        "options": ["Hello, nice to meet you", "Goodbye", "See you later", "Not now"],
                        "answer": "Hello, nice to meet you"
                    },
                    {
                        "type": "fill_blank",
                        "question": "_____ ! How are you?",
                        "options": ["Hello", "Goodbye", "Thank you", "Please"],
                        "answer": "Hello"
                    },
                    {
                        "type": "translate",
                        "question": "Translate to English: 'Oi, como você está?'",
                        "options": ["Hi, how are you?", "Goodbye, how are you?", "Hi, where are you?", "Hello, what are you?"],
                        "answer": "Hi, how are you?"
                    }
                ],
                "summary": [
                    "Hello = formal greeting",
                    "Hi = casual greeting",
                    "Both are correct in most English-speaking countries",
                    "Always follow with a question to continue the conversation"
                ]
            }
        },
        {
            "id": 2,
            "title": "Good Morning, Good Afternoon, Good Evening",
            "level": "A1",
            "lesson_type": "vocabulary",
            "categories": ["Greetings & Introductions"],
            "content": {
                "introduction": "Learn time-specific greetings. English speakers use different greetings depending on what time of day it is.",
                "explanation": "Different times of day require different greetings. 'Good morning' is used from sunrise until noon, 'Good afternoon' from noon until sunset, and 'Good evening' after sunset. 'Goodnight' is only used when saying goodbye late at night.",
                "examples": [
                    {"english": "Good morning! Did you sleep well?", "portuguese": "Bom dia! Você dormiu bem?"},
                    {"english": "Good afternoon! How is your day?", "portuguese": "Boa tarde! Como está seu dia?"},
                    {"english": "Good evening! Welcome!", "portuguese": "Boa noite! Bem-vindo!"},
                    {"english": "It's 7 AM - Good morning!", "portuguese": "São 7 da manhã - Bom dia!"},
                    {"english": "It's 3 PM - Good afternoon!", "portuguese": "São 3 da tarde - Boa tarde!"},
                    {"english": "It's 8 PM - Good evening!", "portuguese": "São 8 da noite - Boa noite!"}
                ],
                "vocabulary": [
                    {"word": "Good morning", "translation": "Bom dia"},
                    {"word": "Good afternoon", "translation": "Boa tarde"},
                    {"word": "Good evening", "translation": "Boa noite"},
                    {"word": "Sunrise", "translation": "Amanhecer"},
                    {"word": "Sleep well", "translation": "Durma bem"}
                ],
                "notes": [
                    "Morning = 6 AM to 12 PM (noon)",
                    "Afternoon = 12 PM to 6 PM",
                    "Evening = 6 PM onwards",
                    "Never say 'Goodnight' as a greeting, only as a goodbye"
                ],
                "exercises": [
                    {
                        "type": "multiple_choice",
                        "question": "It's 10 AM. What do you say?",
                        "options": ["Good morning", "Good afternoon", "Good evening", "Goodnight"],
                        "answer": "Good morning"
                    },
                    {
                        "type": "fill_blank",
                        "question": "_____ ! How was your day?",
                        "options": ["Good evening", "Good morning", "Goodbye", "Hello"],
                        "answer": "Good evening"
                    },
                    {
                        "type": "multiple_choice",
                        "question": "It's 3 PM. Which greeting is correct?",
                        "options": ["Good afternoon", "Good morning", "Good evening", "Goodnight"],
                        "answer": "Good afternoon"
                    },
                    {
                        "type": "translate",
                        "question": "Translate: 'Bom dia, como você está?'",
                        "options": ["Good morning, how are you?", "Good afternoon, how are you?", "Good evening, how are you?", "Goodnight, how are you?"],
                        "answer": "Good morning, how are you?"
                    }
                ],
                "summary": [
                    "Use time-specific greetings based on the hour",
                    "Morning (6 AM - 12 PM) = Good morning",
                    "Afternoon (12 PM - 6 PM) = Good afternoon",
                    "Evening (6 PM+) = Good evening"
                ]
            }
        },
        {
            "id": 3,
            "title": "Introducing Yourself - My Name Is...",
            "level": "A1",
            "lesson_type": "grammar",
            "categories": ["Greetings & Introductions"],
            "content": {
                "introduction": "Learn how to introduce yourself in English. This is essential for first conversations.",
                "explanation": "There are two main ways to introduce yourself: 'My name is [name]' or 'I'm [name]'. Both are correct and commonly used. 'I'm' is the contraction of 'I am' and is more casual and common in spoken English.",
                "examples": [
                    {"english": "My name is Carlos.", "portuguese": "Meu nome é Carlos."},
                    {"english": "I'm Maria.", "portuguese": "Sou a Maria."},
                    {"english": "Hello, my name is João.", "portuguese": "Olá, meu nome é João."},
                    {"english": "Hi! I'm Ana.", "portuguese": "Oi! Sou a Ana."},
                    {"english": "My name is David and I'm from Brazil.", "portuguese": "Meu nome é David e sou do Brasil."},
                    {"english": "I'm Pedro. Nice to meet you!", "portuguese": "Sou o Pedro. Prazer em conhecer!"}
                ],
                "vocabulary": [
                    {"word": "Name", "translation": "Nome"},
                    {"word": "My", "translation": "Meu/Minha"},
                    {"word": "I am / I'm", "translation": "Eu sou"},
                    {"word": "From", "translation": "De"},
                    {"word": "Nice to meet you", "translation": "Prazer em conhecer"}
                ],
                "notes": [
                    "'My name is' is more formal",
                    "'I'm' is more casual and common in spoken English",
                    "Both forms are 100% correct",
                    "Always follow with something else to keep the conversation going"
                ],
                "exercises": [
                    {
                        "type": "fill_blank",
                        "question": "_____ name _____ Paulo.",
                        "options": ["My / is", "I / am", "Your / is", "His / are"],
                        "answer": "My / is"
                    },
                    {
                        "type": "translate",
                        "question": "Translate: 'Meu nome é Julia.'",
                        "options": ["My name is Julia", "I'm Julia", "Her name is Julia", "Your name is Julia"],
                        "answer": "My name is Julia"
                    },
                    {
                        "type": "multiple_choice",
                        "question": "Which is more casual?",
                        "options": ["I'm David", "My name is David", "Both are the same", "Neither is correct"],
                        "answer": "I'm David"
                    },
                    {
                        "type": "fill_blank",
                        "question": "Hello! _____ Lucas.",
                        "options": ["I'm", "My name is", "You're", "He's"],
                        "answer": "I'm"
                    }
                ],
                "summary": [
                    "Use 'My name is [name]' for formal introductions",
                    "Use 'I'm [name]' for casual introductions",
                    "Both are correct and commonly used",
                    "Follow with additional information about yourself"
                ]
            }
        },
        {
            "id": 4,
            "title": "Asking for Names - What's Your Name?",
            "level": "A1",
            "lesson_type": "vocabulary",
            "categories": ["Greetings & Introductions"],
            "content": {
                "introduction": "Learn how to ask someone their name. This is how you continue a greeting and learn about others.",
                "explanation": "The most common way to ask someone's name is 'What's your name?' which is short for 'What is your name?' You can also ask 'Who are you?' but this is less common for initial introductions.",
                "examples": [
                    {"english": "What's your name?", "portuguese": "Qual é o seu nome?"},
                    {"english": "What is your name?", "portuguese": "Qual é o seu nome?"},
                    {"english": "Who are you?", "portuguese": "Quem é você?"},
                    {"english": "Can I have your name, please?", "portuguese": "Você pode me dar seu nome, por favor?"},
                    {"english": "May I ask your name?", "portuguese": "Posso saber seu nome?"},
                    {"english": "Nice to meet you! What's your name?", "portuguese": "Prazer em conhecer! Qual é o seu nome?"}
                ],
                "vocabulary": [
                    {"word": "What's", "translation": "Qual é / O que é"},
                    {"word": "Your", "translation": "Seu / Sua"},
                    {"word": "Name", "translation": "Nome"},
                    {"word": "Who", "translation": "Quem"},
                    {"word": "Please", "translation": "Por favor"}
                ],
                "notes": [
                    "'What's your name?' is the most common and casual form",
                    "Use 'May I ask your name?' for more formal situations",
                    "'Who are you?' can sound rude, avoid it for introductions",
                    "Always say 'please' to be polite"
                ],
                "exercises": [
                    {
                        "type": "multiple_choice",
                        "question": "How do you ask someone's name casually?",
                        "options": ["What's your name?", "Who are you?", "What is your?", "Name what?"],
                        "answer": "What's your name?"
                    },
                    {
                        "type": "reorder_sentence",
                        "question": "Reorder: name / your / What's / ?",
                        "options": ["What's your name?", "Your name What's?", "Name your What's?", "What's name your?"],
                        "answer": "What's your name?"
                    },
                    {
                        "type": "fill_blank",
                        "question": "_____ is your name?",
                        "options": ["What", "Who", "Where", "When"],
                        "answer": "What"
                    },
                    {
                        "type": "translate",
                        "question": "Translate: 'Qual é o seu nome?'",
                        "options": ["What's your name?", "What are your names?", "Who is your name?", "Where is your name?"],
                        "answer": "What's your name?"
                    }
                ],
                "summary": [
                    "'What's your name?' is the standard casual way",
                    "'What is your name?' is the formal way",
                    "Use 'please' to be polite",
                    "Avoid 'Who are you?' for introductions"
                ]
            }
        },
        {
            "id": 5,
            "title": "Polite Responses - Nice to Meet You",
            "level": "A1",
            "lesson_type": "vocabulary",
            "categories": ["Greetings & Introductions"],
            "content": {
                "introduction": "Learn polite phrases to use when meeting someone for the first time. These phrases show respect and friendliness.",
                "explanation": "'Nice to meet you' is the standard polite response when introduced to someone. You can also say 'Pleased to meet you' (more formal) or 'Great to meet you' (more casual). These phrases are typically said while shaking hands or nodding.",
                "examples": [
                    {"english": "Nice to meet you!", "portuguese": "Prazer em conhecer!"},
                    {"english": "Pleased to meet you.", "portuguese": "Fico feliz em conhecer."},
                    {"english": "Great to meet you!", "portuguese": "Que legal te conhecer!"},
                    {"english": "The pleasure is mine.", "portuguese": "O prazer é meu."},
                    {"english": "Nice to meet you too!", "portuguese": "Prazer em conhecer você também!"},
                    {"english": "Welcome! Nice to meet you.", "portuguese": "Bem-vindo! Prazer em conhecer você."}
                ],
                "vocabulary": [
                    {"word": "Nice", "translation": "Agradável / Legal"},
                    {"word": "Pleased", "translation": "Feliz / Satisfeito"},
                    {"word": "Great", "translation": "Ótimo"},
                    {"word": "Pleasure", "translation": "Prazer"},
                    {"word": "Mine", "translation": "Meu / Minha"}
                ],
                "notes": [
                    "'Nice to meet you' is the most common and can be used in any situation",
                    "'Pleased to meet you' is more formal (business situations)",
                    "'Great to meet you' is very casual (with friends)",
                    "Always respond with the same phrase or something similar"
                ],
                "exercises": [
                    {
                        "type": "multiple_choice",
                        "question": "Someone says 'Nice to meet you!' What should you say?",
                        "options": ["Nice to meet you too!", "Goodbye!", "What?", "No thank you"],
                        "answer": "Nice to meet you too!"
                    },
                    {
                        "type": "fill_blank",
                        "question": "_____ to meet you!",
                        "options": ["Nice", "Mean", "Rude", "Far"],
                        "answer": "Nice"
                    },
                    {
                        "type": "translate",
                        "question": "Translate: 'O prazer é meu.'",
                        "options": ["The pleasure is mine", "The pleasure is yours", "The pain is mine", "The price is mine"],
                        "answer": "The pleasure is mine"
                    },
                    {
                        "type": "multiple_choice",
                        "question": "Which is most formal?",
                        "options": ["Pleased to meet you", "Nice to meet you", "Great to meet you", "Hey, I know you"],
                        "answer": "Pleased to meet you"
                    }
                ],
                "summary": [
                    "Nice to meet you = standard, use anywhere",
                    "Pleased to meet you = formal, business situations",
                    "Great to meet you = casual, with friends",
                    "The pleasure is mine = very polite response"
                ]
            }
        },
        # ==================== CATEGORY 2: PERSONAL INFORMATION ====================
        {
            "id": 6,
            "title": "Age and Birthdays - How Old Are You?",
            "level": "A1",
            "lesson_type": "vocabulary",
            "categories": ["Personal Information"],
            "content": {
                "introduction": "Learn how to talk about age and birthdays. This is basic personal information you'll often share.",
                "explanation": "To ask someone's age, you say 'How old are you?' The answer is 'I'm [number] years old' or 'I am [number]'. For birthdays, you say 'My birthday is [month] [day]' or 'I was born on [date]'.",
                "examples": [
                    {"english": "How old are you?", "portuguese": "Quantos anos você tem?"},
                    {"english": "I'm 25 years old.", "portuguese": "Tenho 25 anos."},
                    {"english": "My birthday is December 15.", "portuguese": "Meu aniversário é 15 de dezembro."},
                    {"english": "When is your birthday?", "portuguese": "Quando é seu aniversário?"},
                    {"english": "I was born in 1995.", "portuguese": "Nasci em 1995."},
                    {"english": "Happy birthday! How old are you now?", "portuguese": "Feliz aniversário! Quantos anos você tem agora?"}
                ],
                "vocabulary": [
                    {"word": "Age", "translation": "Idade"},
                    {"word": "Old", "translation": "Velho / Idade"},
                    {"word": "Years old", "translation": "Anos de idade"},
                    {"word": "Birthday", "translation": "Aniversário"},
                    {"word": "Born", "translation": "Nascido"}
                ],
                "notes": [
                    "Use 'How old are you?' to ask age",
                    "Answer with 'I'm [number] years old'",
                    "You can also say 'I'm [number]' without 'years old'",
                    "Never ask a woman's age unless you know her well"
                ],
                "exercises": [
                    {
                        "type": "fill_blank",
                        "question": "I'm 30 _____ _____.",
                        "options": ["years old", "years long", "years big", "year old"],
                        "answer": "years old"
                    },
                    {
                        "type": "multiple_choice",
                        "question": "How do you ask someone's age?",
                        "options": ["How old are you?", "What old are you?", "How are you old?", "Are you old?"],
                        "answer": "How old are you?"
                    },
                    {
                        "type": "translate",
                        "question": "Translate: 'Meu aniversário é em junho.'",
                        "options": ["My birthday is in June", "My age is in June", "My day is in June", "My old is in June"],
                        "answer": "My birthday is in June"
                    },
                    {
                        "type": "reorder_sentence",
                        "question": "Reorder: old / are / you / How?",
                        "options": ["How old are you?", "How are you old?", "Are how you old?", "Old you are how?"],
                        "answer": "How old are you?"
                    }
                ],
                "summary": [
                    "How old are you? = How to ask age",
                    "I'm [number] years old = How to answer",
                    "My birthday is [date] = How to say birthday",
                    "You can also say just 'I'm 25' without 'years old'"
                ]
            }
        },
        {
            "id": 7,
            "title": "Nationality and Where You're From",
            "level": "A1",
            "lesson_type": "vocabulary",
            "categories": ["Personal Information"],
            "content": {
                "introduction": "Learn to talk about where you're from and your nationality. This is important personal information.",
                "explanation": "To say where you're from, use 'I'm from [country/city]'. To say your nationality, use 'I'm [nationality]' or 'I am a [nationality] person'. For example: 'I'm from Brazil' or 'I'm Brazilian'.",
                "examples": [
                    {"english": "Where are you from?", "portuguese": "De onde você é?"},
                    {"english": "I'm from Brazil.", "portuguese": "Sou do Brasil."},
                    {"english": "I'm Brazilian.", "portuguese": "Sou brasileiro."},
                    {"english": "What is your nationality?", "portuguese": "Qual é sua nacionalidade?"},
                    {"english": "I'm from São Paulo.", "portuguese": "Sou de São Paulo."},
                    {"english": "I'm American from California.", "portuguese": "Sou americano da Califórnia."}
                ],
                "vocabulary": [
                    {"word": "From", "translation": "De"},
                    {"word": "Country", "translation": "País"},
                    {"word": "City", "translation": "Cidade"},
                    {"word": "Nationality", "translation": "Nacionalidade"},
                    {"word": "Brazilian", "translation": "Brasileiro"}
                ],
                "notes": [
                    "Use 'I'm from [place]' for location",
                    "Use 'I'm [nationality]' for nationality",
                    "English = adjective (English person, English teacher)",
                    "Countries are capitalized: Brazil, USA, Japan, etc."
                ],
                "exercises": [
                    {
                        "type": "fill_blank",
                        "question": "I'm _____ Brazil.",
                        "options": ["from", "of", "in", "at"],
                        "answer": "from"
                    },
                    {
                        "type": "multiple_choice",
                        "question": "How do you say your nationality?",
                        "options": ["I'm Brazilian", "I from Brazil", "Brazil is me", "I me from Brazil"],
                        "answer": "I'm Brazilian"
                    },
                    {
                        "type": "translate",
                        "question": "Translate: 'Sou da Argentina.'",
                        "options": ["I'm from Argentina", "I'm Argentine", "Argentina is me", "I have Argentina"],
                        "answer": "I'm from Argentina"
                    },
                    {
                        "type": "multiple_choice",
                        "question": "What's the correct form?",
                        "options": ["I'm from São Paulo", "I'm from the São Paulo", "I from São Paulo", "I'm in São Paulo"],
                        "answer": "I'm from São Paulo"
                    }
                ],
                "summary": [
                    "Where are you from? = Ask where someone is from",
                    "I'm from [country/city] = Answer with location",
                    "I'm [nationality] = Answer with nationality",
                    "Always capitalize country and city names"
                ]
            }
        },
        {
            "id": 8,
            "title": "Occupation and Jobs",
            "level": "A1",
            "lesson_type": "vocabulary",
            "categories": ["Personal Information"],
            "content": {
                "introduction": "Learn vocabulary and phrases to talk about jobs and occupations. What do you do for work?",
                "explanation": "To ask what someone does for work: 'What do you do?' or 'What's your job?' To answer: 'I'm a [job]' or 'I work as a [job]'. Common jobs: teacher, engineer, doctor, nurse, chef, student, etc.",
                "examples": [
                    {"english": "What do you do?", "portuguese": "O que você faz?"},
                    {"english": "What's your job?", "portuguese": "Qual é seu trabalho?"},
                    {"english": "I'm a teacher.", "portuguese": "Sou professor."},
                    {"english": "I work as a nurse.", "portuguese": "Trabalho como enfermeira."},
                    {"english": "I'm an engineer.", "portuguese": "Sou engenheiro."},
                    {"english": "I'm a student. I study English.", "portuguese": "Sou estudante. Estudo inglês."}
                ],
                "vocabulary": [
                    {"word": "Job", "translation": "Trabalho / Emprego"},
                    {"word": "Occupation", "translation": "Ocupação"},
                    {"word": "Teacher", "translation": "Professor"},
                    {"word": "Engineer", "translation": "Engenheiro"},
                    {"word": "Doctor", "translation": "Médico"}
                ],
                "notes": [
                    "Use 'What do you do?' to ask about someone's job",
                    "Answer with 'I'm a/an' + job",
                    "Use 'a' before consonant sounds (a teacher, a doctor)",
                    "Use 'an' before vowel sounds (an engineer, an actor)"
                ],
                "exercises": [
                    {
                        "type": "multiple_choice",
                        "question": "What do you say if you're a doctor?",
                        "options": ["I'm a doctor", "I'm doctor", "I doctor", "I'm the doctor"],
                        "answer": "I'm a doctor"
                    },
                    {
                        "type": "fill_blank",
                        "question": "I'm _____ teacher.",
                        "options": ["a", "an", "the", "some"],
                        "answer": "a"
                    },
                    {
                        "type": "translate",
                        "question": "Translate: 'O que você faz?'",
                        "options": ["What do you do?", "Where do you do?", "When do you do?", "Why do you do?"],
                        "answer": "What do you do?"
                    },
                    {
                        "type": "multiple_choice",
                        "question": "Which uses 'an'?",
                        "options": ["an engineer", "an teacher", "an doctor", "an nurse"],
                        "answer": "an engineer"
                    }
                ],
                "summary": [
                    "What do you do? = Standard way to ask about job",
                    "I'm a/an [job] = How to answer",
                    "Use 'a' before consonant sounds",
                    "Use 'an' before vowel sounds"
                ]
            }
        },
        {
            "id": 9,
            "title": "Hobbies and Interests",
            "level": "A1",
            "lesson_type": "vocabulary",
            "categories": ["Personal Information"],
            "content": {
                "introduction": "Learn to talk about what you like to do in your free time. This helps you have casual conversations.",
                "explanation": "To ask about hobbies: 'What do you like to do?' or 'What are your hobbies?' To answer: 'I like to [activity]' or 'I enjoy [activity]'. Common hobbies: reading, sports, music, movies, cooking, traveling, etc.",
                "examples": [
                    {"english": "What do you like to do?", "portuguese": "O que você gosta de fazer?"},
                    {"english": "What are your hobbies?", "portuguese": "Quais são seus hobbies?"},
                    {"english": "I like to read books.", "portuguese": "Gosto de ler livros."},
                    {"english": "I enjoy playing sports.", "portuguese": "Gosto de praticar esportes."},
                    {"english": "My hobby is cooking.", "portuguese": "Meu hobby é cozinhar."},
                    {"english": "I love traveling to new places.", "portuguese": "Amo viajar para novos lugares."}
                ],
                "vocabulary": [
                    {"word": "Hobby", "translation": "Hobby / Passatempo"},
                    {"word": "Like", "translation": "Gostar"},
                    {"word": "Enjoy", "translation": "Aproveitar / Gostar"},
                    {"word": "Love", "translation": "Amar / Adorar"},
                    {"word": "Interest", "translation": "Interesse"}
                ],
                "notes": [
                    "'What do you like to do?' is very common",
                    "Like > Enjoy > Love (increasing intensity of preference)",
                    "After like/enjoy/love, use -ing form of verb (reading, playing, cooking)",
                    "This is great for getting to know people better"
                ],
                "exercises": [
                    {
                        "type": "fill_blank",
                        "question": "I _____ to read books.",
                        "options": ["like", "like to", "like in", "like for"],
                        "answer": "like"
                    },
                    {
                        "type": "translate",
                        "question": "Translate: 'Gosto de assistir a filmes.'",
                        "options": ["I like to watch movies", "I like to read movies", "I like movies to watch", "I movies like to watch"],
                        "answer": "I like to watch movies"
                    },
                    {
                        "type": "multiple_choice",
                        "question": "Which hobby verb is strongest?",
                        "options": ["love", "like", "enjoy", "prefer"],
                        "answer": "love"
                    },
                    {
                        "type": "reorder_sentence",
                        "question": "Reorder: hobbies / What / your / are?",
                        "options": ["What are your hobbies?", "What your hobbies are?", "Your hobbies what are?", "Are your hobbies what?"],
                        "answer": "What are your hobbies?"
                    }
                ],
                "summary": [
                    "What do you like to do? = Ask about hobbies",
                    "I like/enjoy/love [activity] = How to answer",
                    "Use -ing form after like/enjoy/love (reading, playing)",
                    "Love > Enjoy > Like (in terms of preference intensity)"
                ]
            }
        },
        {
            "id": 10,
            "title": "Family Status and Relationships",
            "level": "A1",
            "lesson_type": "vocabulary",
            "categories": ["Personal Information"],
            "content": {
                "introduction": "Learn to talk about your family situation and relationships. These are natural topics in conversation.",
                "explanation": "Common relationship statuses: single, married, divorced, widowed. You can say 'I'm married' or 'I'm married to [name]'. For family, use 'I have [number] children' or 'I'm married with two kids.'",
                "examples": [
                    {"english": "Are you married?", "portuguese": "Você é casado?"},
                    {"english": "I'm single.", "portuguese": "Sou solteiro."},
                    {"english": "I'm married to Maria.", "portuguese": "Sou casado com Maria."},
                    {"english": "I have two children.", "portuguese": "Tenho dois filhos."},
                    {"english": "Do you have a family?", "portuguese": "Você tem família?"},
                    {"english": "I live with my boyfriend.", "portuguese": "Vivo com meu namorado."}
                ],
                "vocabulary": [
                    {"word": "Married", "translation": "Casado"},
                    {"word": "Single", "translation": "Solteiro"},
                    {"word": "Children", "translation": "Filhos"},
                    {"word": "Family", "translation": "Família"},
                    {"word": "Relationship", "translation": "Relacionamento"}
                ],
                "notes": [
                    "'Married' = casado (para sempre legalmente)",
                    "'Single' = solteiro",
                    "'Have children' não 'have kids' (kids é informal)",
                    "You can also say boyfriend/girlfriend without defining status"
                ],
                "exercises": [
                    {
                        "type": "multiple_choice",
                        "question": "How do you say you're not married?",
                        "options": ["I'm single", "I'm alone", "I'm not married", "I'm independent"],
                        "answer": "I'm single"
                    },
                    {
                        "type": "fill_blank",
                        "question": "I _____ married to Paulo.",
                        "options": ["am", "have", "is", "are"],
                        "answer": "am"
                    },
                    {
                        "type": "translate",
                        "question": "Translate: 'Tenho dois filhos.'",
                        "options": ["I have two children", "I have two kids", "I have two babies", "I'm two children"],
                        "answer": "I have two children"
                    },
                    {
                        "type": "multiple_choice",
                        "question": "Which is more formal?",
                        "options": ["I have children", "I have kids", "I have baby", "I have son"],
                        "answer": "I have children"
                    }
                ],
                "summary": [
                    "I'm single = unmarried",
                    "I'm married = married",
                    "I have [number] children = to say how many kids",
                    "You can also mention boyfriend/girlfriend status"
                ]
            }
        },
        # ==================== CATEGORY 3: FAMILY & RELATIONSHIPS ====================
        {
            "id": 11,
            "title": "Family Members - Basic Vocabulary",
            "level": "A1",
            "lesson_type": "vocabulary",
            "categories": ["Family & Relationships"],
            "content": {
                "introduction": "Learn the names of family members in English. This is fundamental vocabulary for talking about family.",
                "explanation": "Family members are called: mother/mom, father/dad, sister/sibling, brother/sibling, grandparents, aunts, uncles, cousins. 'Mom' and 'Dad' are informal and casual, while 'Mother' and 'Father' are more formal.",
                "examples": [
                    {"english": "My mother is a teacher.", "portuguese": "Minha mãe é professora."},
                    {"english": "My dad works as an engineer.", "portuguese": "Meu pai trabalha como engenheiro."},
                    {"english": "I have one sister and two brothers.", "portuguese": "Tenho uma irmã e dois irmãos."},
                    {"english": "My grandparents live in the countryside.", "portuguese": "Meus avós vivem no interior."},
                    {"english": "My uncle is a doctor.", "portuguese": "Meu tio é médico."},
                    {"english": "I have many cousins.", "portuguese": "Tenho muitos primos."}
                ],
                "vocabulary": [
                    {"word": "Mother / Mom", "translation": "Mãe"},
                    {"word": "Father / Dad", "translation": "Pai"},
                    {"word": "Sister", "translation": "Irmã"},
                    {"word": "Brother", "translation": "Irmão"},
                    {"word": "Grandparents", "translation": "Avós"}
                ],
                "notes": [
                    "'Mom' and 'Dad' are everyday/casual language",
                    "'Mother' and 'Father' are more formal",
                    "The phrase 'I have' is used to talk about family members you possess",
                    "Plural forms: mother→mothers, father→fathers, but: child→children"
                ],
                "exercises": [
                    {
                        "type": "vocabulary_match",
                        "question": "Match family members:",
                        "options": [
                            {"english_word": "Mother", "portuguese_word": "Mãe"},
                            {"english_word": "Father", "portuguese_word": "Pai"},
                            {"english_word": "Brother", "portuguese_word": "Irmão"}
                        ],
                        "answer": "All correct"
                    },
                    {
                        "type": "fill_blank",
                        "question": "My _____ is my female parent.",
                        "options": ["mother", "father", "sister", "brother"],
                        "answer": "mother"
                    },
                    {
                        "type": "translate",
                        "question": "Translate: 'Meu irmão'",
                        "options": ["My brother", "My sister", "My cousin", "My uncle"],
                        "answer": "My brother"
                    },
                    {
                        "type": "multiple_choice",
                        "question": "Which is informal?",
                        "options": ["Dad", "Father", "Father of mine", "My father"],
                        "answer": "Dad"
                    }
                ],
                "summary": [
                    "Mother = formal, Mom = casual",
                    "Father = formal, Dad = casual",
                    "Sister, Brother = siblings",
                    "Grandparents, Aunts, Uncles, Cousins are extended family"
                ]
            }
        },
        {
            "id": 12,
            "title": "Describing Family Members",
            "level": "A1",
            "lesson_type": "grammar",
            "categories": ["Family & Relationships"],
            "content": {
                "introduction": "Learn to describe family members using basic adjectives and information.",
                "explanation": "Use adjectives to describe family members: tall/short, young/old, friendly, kind, etc. Common structure: 'My mother is tall and friendly.' You can also mention their job, personality, or hobbies.",
                "examples": [
                    {"english": "My mother is tall and friendly.", "portuguese": "Minha mãe é alta e amigável."},
                    {"english": "My father is a doctor and very kind.", "portuguese": "Meu pai é médico e muito gentil."},
                    {"english": "My sister is young and intelligent.", "portuguese": "Minha irmã é jovem e inteligente."},
                    {"english": "My brother is funny and loves to play sports.", "portuguese": "Meu irmão é engraçado e adora praticar esportes."},
                    {"english": "My grandmother is old but very active.", "portuguese": "Minha avó é velha mas muito ativa."},
                    {"english": "My family is big and happy.", "portuguese": "Minha família é grande e feliz."}
                ],
                "vocabulary": [
                    {"word": "Tall", "translation": "Alto"},
                    {"word": "Short", "translation": "Baixo / Curto"},
                    {"word": "Young", "translation": "Jovem"},
                    {"word": "Old", "translation": "Velho"},
                    {"word": "Kind", "translation": "Gentil"}
                ],
                "notes": [
                    "Use 'is' + adjective to describe people",
                    "Adjectives don't change form in English",
                    "You can use 'and' to add multiple adjectives",
                    "'Very' is used to intensify adjectives"
                ],
                "exercises": [
                    {
                        "type": "fill_blank",
                        "question": "My mother _____ tall.",
                        "options": ["is", "are", "am", "be"],
                        "answer": "is"
                    },
                    {
                        "type": "fill_blank",
                        "question": "My sister is young _____ intelligent.",
                        "options": ["and", "or", "but", "with"],
                        "answer": "and"
                    },
                    {
                        "type": "translate",
                        "question": "Translate: 'Meu pai é muito gentil.'",
                        "options": ["My father is very kind", "My father is kind very", "My father very is kind", "My father is very kindly"],
                        "answer": "My father is very kind"
                    },
                    {
                        "type": "multiple_choice",
                        "question": "How do you make an adjective stronger?",
                        "options": ["Use 'very'", "Use 'much'", "Use 'more'", "Use 'is'"],
                        "answer": "Use 'very'"
                    }
                ],
                "summary": [
                    "[Family member] + is + adjective",
                    "Use 'and' to combine adjectives",
                    "Use 'very' to intensify adjectives",
                    "You can describe appearance, personality, job, or hobbies"
                ]
            }
        },
    ]
    
    # Combine all lessons: base (1-12) + lessons_a1_13_30.py (13-30) + lessons_a1_31_50.py (31-50)
    all_lessons = base_lessons + LESSONS_13_30 + LESSONS_31_50
    
    # Sort by ID to ensure correct order
    all_lessons.sort(key=lambda x: x.get("id", 0))

    # Normalize to a canonical schema for frontend/backend compatibility.
    normalized_lessons = [_normalize_lesson(lesson) for lesson in all_lessons]
    return normalized_lessons


def get_lesson_by_id(lesson_id):
    """Get a specific lesson by ID"""
    all_lessons = get_all_lessons()
    for lesson in all_lessons:
        if lesson["id"] == lesson_id:
            return lesson
    return None


def get_lessons_by_category(category_name):
    """Get all lessons in a specific category"""
    all_lessons = get_all_lessons()
    return [lesson for lesson in all_lessons if category_name in lesson["categories"]]


def get_all_categories():
    """Get all unique categories"""
    all_lessons = get_all_lessons()
    categories = set()
    for lesson in all_lessons:
        categories.update(lesson["categories"])
    return sorted(list(categories))


def get_lessons_count():
    """Get total number of lessons"""
    return len(get_all_lessons())


# Keywords per error type for lesson matching
_ERROR_LESSON_KEYWORDS = {
    "article": ["artigo", "a/an", "article", "profissão", "profession", "work", "job"],
    "gerund_after_verb": ["gerúndio", "gerund", "hobby", "hobbies", "like", "enjoy", "love", "-ing", "interest"],
    "verb_tense": ["tempo verbal", "verb tense", "tense", "past", "present", "future", "passado", "presente"],
    "preposition": ["preposição", "preposition", "in", "on", "at", "location", "lugar", "time"],
    "word_choice": ["vocabulário", "vocabulary", "word", "expression", "expressão", "phrasal"],
    "subject_verb_agreement": ["concordância", "agreement", "subject", "sujeito", "plural", "singular"],
    "capitalization": ["maiúscula", "capital", "nationality", "nacionalidade", "country", "país", "name"],
    "spelling": ["ortografia", "spelling", "word", "palavra"],
}


def find_lessons_for_error_type(error_type: str, max_results: int = 2) -> list:
    """Find lessons that cover grammar concepts related to a given error type."""
    keywords = _ERROR_LESSON_KEYWORDS.get(error_type, [])
    if not keywords:
        return []

    matches = []
    for lesson in get_all_lessons():
        lesson_text = " ".join([
            lesson.get("title", ""),
            lesson.get("description", ""),
            lesson.get("content", {}).get("explanation", ""),
            lesson.get("content", {}).get("introduction", ""),
            " ".join(lesson.get("categories", [])),
        ]).lower()

        score = sum(1 for kw in keywords if kw.lower() in lesson_text)
        if score > 0:
            matches.append((score, lesson))

    matches.sort(key=lambda x: x[0], reverse=True)
    return [lesson for _, lesson in matches[:max_results]]


# Metadata about lesson structure
LESSON_METADATA = {
    "total_lessons": 50,
    "level": "A1",
    "target_audience": "Brazilian Portuguese speakers",
    "lesson_structure": {
        "introduction": "Hook and brief intro to topic",
        "explanation": "Core concept explained simply",
        "examples": "4-6 real-world examples with translations",
        "vocabulary": "5 key words to learn",
        "notes": "Helpful tips and cultural notes",
        "exercises": "3-5 practice exercises",
        "summary": "Key takeaways"
    },
    "exercise_types": [
        "multiple_choice",
        "fill_blank",
        "translate",
        "reorder_sentence",
        "vocabulary_match"
    ],
    "categories": [
        "Greetings & Introductions",
        "Personal Information",
        "Family & Relationships",
        "Numbers & Time",
        "Food & Drinks",
        "Places & Locations",
        "Verbs & Actions",
        "Adjectives & Descriptions",
        "Daily Routines",
        "Hobbies & Interests"
    ]
}
