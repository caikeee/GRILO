# GRILO — Guia de Marca e Voz

Documento-piloto. Toda copy gerada para o GRILO (UI, landing, e-mail, push, suporte, redes) deve passar por este filtro antes de ir ao usuário.

---

## 1. Posicionamento em uma frase

**GRILO é o cheat code do seu inglês.** Não substitui curso, escola ou imersão — amplia. É o atalho que transforma o que você já vive em fluência.

- **O que somos:** ampliador de aprendizado.
- **O que NÃO somos:** curso, professor, app de gamificação, Duolingo.
- **Promessa central:** *"O inglês que você já tem, funcionando mais rápido."*

---

## 2. Persona da marca

GRILO fala como um **amigo bilíngue mais experiente** — não como professor, não como app fofo, não como coach motivacional.

- Direto, sem rodeio.
- Confiante, mas nunca arrogante.
- Bem-humorado em doses pequenas.
- Trata o usuário como adulto inteligente com pouco tempo.

---

## 3. Tom de voz (4 atributos)

| Somos                | Não somos              |
| -------------------- | ---------------------- |
| Direto               | Seco / robótico        |
| Confiante            | Arrogante / superior   |
| Próximo              | Infantil / forçado     |
| Útil                 | Motivacional vazio     |

**Régua rápida:** se a frase caberia num post do LinkedIn corporativo OU numa aula de criança, **reescreva**.

---

## 4. Princípios de copy (os 7 mandamentos)

1. **Português sempre como base.** Inglês só onde a prática exige (input do usuário, frase-alvo). Nunca em label, botão, erro ou estado de sistema.
2. **Verbo na frente.** *"Começar aula"* > *"Aula iniciar"*. *"Falar agora"* > *"Início da sessão de voz"*.
3. **Sentence case em tudo.** Botões, títulos, menus. Nada de Title Case. Nada de CAIXA ALTA (exceto sigla).
4. **Erro nunca é só "erro".** Diga **o que aconteceu + o que fazer**. Banido: *"Erro ao X"*, *"Algo deu errado"*, *"Tente novamente"* sem contexto.
5. **Nomeie pelo benefício, não pela engenharia.** *"Voice Core v2"* → não aparece. *"Daily Fluency Loop"* → não aparece. Termo interno fica interno.
6. **Errar é dado, não falha.** Nunca chame o que o usuário fez de "erro". Chame de *ponto a revisar*, *ajuste*, *próximo passo*.
7. **Cheat code, não muleta.** Comunicação evita "fácil", "rapidinho", "sem esforço". Prefira "atalho", "destrava", "amplifica", "vira a chave".

---

## 5. Glossário oficial (use estes termos, sempre os mesmos)

| Use                       | Não use                                  |
| ------------------------- | ---------------------------------------- |
| Aula                      | Lição / Lesson                           |
| Sessão de voz             | Voice Core / Voice session               |
| Falar agora               | Iniciar / Start voice                    |
| Ponto para revisar        | Erro / Mistake                           |
| Palavra do dia            | Word pulse / Daily focus                 |
| Foco de hoje              | Today / Daily focus                      |
| Tradução de apoio         | Bridge / Ponte ON / PT+EN                |
| Nível (A1, A2, B1…)       | CEFR (sem explicação)                    |
| Continuar                 | Resume / Continue session                |

**Regra:** se um termo aparece em mais de uma tela, ele entra aqui. Não inventar sinônimos.

---

## 6. Microcopy padrão (copiar e colar)

**Login bem-sucedido:** *Bem-vindo de volta.*
**Login falhou:** *E-mail ou senha não bateram. Confira e tente de novo.*
**Sem internet:** *Você está offline. Volte quando reconectar — seu progresso fica salvo.*
**Carregando:** *Preparando…* (nunca *"Aguarde"* nu).
**Vazio (primeira vez):* *Comece a falar — eu sigo a conversa.*
**Vazio (sem dados ainda):** *Nada por aqui ainda. Faça uma sessão e isto se preenche sozinho.*
**Sucesso pós-sessão:** *Sessão registrada. Próxima palavra te espera.*
**Pedindo permissão de microfone:** *Pra te ouvir, o navegador vai pedir acesso ao microfone. Pode liberar.*

---

## 7. Estrutura de erro (template)

> **[O que aconteceu, em uma frase humana].** [O que fazer agora.]

- ✅ *"O microfone não respondeu. Recarregue a página para tentar de novo."*
- ✅ *"Sua sessão expirou. Entre de novo pra continuar."*
- ❌ *"Erro 401."*
- ❌ *"Speech handler not available."*
- ❌ *"Algo deu errado."*

---

## 8. Antes → Depois (referência rápida)

| Antes (atual)                                | Depois (GRILO)                                                |
| -------------------------------------------- | ------------------------------------------------------------- |
| *"Iniciar Sessao de Voz"*                    | *"Falar agora"*                                               |
| *"ERROS DA SESSÃO"*                          | *"Pontos para revisar"*                                       |
| *"Speech handler not available"*             | *"O microfone não respondeu. Recarregue para tentar."*        |
| *"Bom dia."* (fixo)                          | *"Oi, Caike — bom te ver."* (dinâmico por horário/nome)       |
| *"Aulas geradas com IA"*                     | *"Vira a chave do inglês que você já tem."*                   |
| *"Voice Core v2 · Daily Fluency Loop"*       | (remover da UI — termo interno)                               |
| *"Write in English…"*                        | *"Escreva em inglês — traduzimos se precisar."*               |
| *"Login realizado com sucesso!"*             | *"Bem-vindo de volta."*                                       |
| *"Tentar Novamente"*                         | *"Tentar de novo"*                                            |

---

## 9. Acessibilidade comunicacional (não negociável)

- Todo botão tem `aria-label` que **descreve a ação**, não o ícone.
- Estados (carregando, erro, sucesso) usam `aria-live="polite"`.
- Texto nunca depende só de cor (verde/vermelho) — sempre tem palavra junto.
- Idioma da página declarado em `lang="pt-br"`. Trechos em inglês marcados com `lang="en"`.

---

## 10. Como usar este guia

1. Antes de escrever qualquer texto novo, abrir este arquivo.
2. Passar o texto pelos **7 mandamentos** (seção 4).
3. Conferir se o termo está no **glossário** (seção 5).
4. Se for erro, usar o **template** (seção 7).
5. Em dúvida, escolher a frase mais curta que ainda diga **o quê + o porquê**.

> **Teste final:** leia em voz alta. Se soa como amigo bilíngue te dando um atalho, está GRILO. Se soa como app, professor ou suporte de banco, reescreva.
