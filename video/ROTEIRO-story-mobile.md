# Prompt — Story "O GRILO no seu celular" (Instagram, 9:16)

> Instrução de produção para o vídeo de comunicação do redesenho mobile.
> Implementação: Remotion em `video/grilo-rebrand/`. Versão final: composição `StoryMobile-E` → `out/story-mobile-E.mp4`.

## 1. Objetivo

Comunicar, num story de ~37 s, que o GRILO evoluiu no celular. **O GRILO é um site** (não existe app): a versão para celular ficou mais leve, mais claro e mais fácil para quem está chegando, e a voz que ensina inglês ficou mais natural.

O tom **não é de venda**. É de **marco de evolução contínua**: "a gente cresceu, ouviu, arrumou a casa e segue melhorando". O vídeo mostra o produto real funcionando e não promete nada que o app não faça.

## 2. Público e contexto

Brasileiros aprendendo inglês, muitos recém-chegados (o produto está crescendo rápido). O vídeo é assistido no celular, em story, muitas vezes sem som no começo. Por isso a mensagem precisa funcionar só com imagem e texto, e o áudio (a voz nova) entra como recompensa para quem está ouvindo.

## 3. Regras de direção (padrão da marca)

- **Peças reais.** As telas são capturas do app de verdade, já com o redesenho, e as interações são as reais: o sheet que sobe, o campo sendo digitado, os blocos da ditação se preenchendo, o karaokê acendendo palavra a palavra. Nada de mockup inventado.
- **Câmera viva, motion com motivo.** O celular é o ator: entra com perspectiva 3D, gira levemente, a câmera se aproxima nos detalhes e corta em *whip pan* com motion blur. Cada movimento tem motivo (o polegar toca, a câmera vai até o feedback).
- **Proibido:** fade genérico, card girando, traço se desenhando, partículas, grids ou barras decorativas, e texto sobre ou colado ao logo.
- **Texto em cartela própria**, acima do celular, com tempo real de leitura (no mínimo ~1,5 s por frase curta). Fora das zonas que o Instagram cobre: os 250 px de cima e os ~340 px de baixo.
- **Tipografia e cor do kit "A Ponte":** Inter 700, studio `#0F1E18`, papel `#FBFCFB`, sálvia `#7A9E84`, âmbar `#E6B800`. O lima do app (`#C9E86A`) aparece só porque está nas telas.
- **Áudio curado, nunca sintetizado:**
  - trilha final: "Samba Isobel" (Kevin MacLeod, incompetech.com, CC BY 4.0), um samba com piano entre a bossa e a batucada. O crédito ao autor fica no rodapé do fechamento, porque story não tem legenda. O arquivo é cortado para a música soar desde o quadro 0;
  - efeitos do kit;
  - a **voz é a real do app** (Groq Orpheus "troy", a mesma dos MP3 pré-gerados), com a trilha abaixando (*ducking*) enquanto ela fala.
- **Montagem na grade da trilha**: os marcos seguem um andamento de 122 BPM e cada um cai na colcheia mais próxima do samba (95 BPM).

## 4. Roteiro (batida 0 = primeira batida da trilha)

| Tempo | Cena | Imagem / câmera | Cartela | Som |
|---|---|---|---|---|
| 0 – b0 (~3,5 s) | **Abertura** | Fundo studio. Só tipografia, linhas subindo da máscara (mesma linguagem do vídeo de lançamento). | "Tem muita gente nova chegando no GRILO." | Intro da trilha |
| b0 – b8 | **O site no celular** | O celular sobe do fundo em perspectiva (inclinado → quase frontal) com o hub de aulas. O conteúdo rola sozinho até o cartão "Continuar". | "Então a gente refez o site pro celular." | Whoosh na entrada |
| b8 – b14 | **Voz nova** | *Whip pan* para a aula "Ouvir e falar". Push-in no botão de áudio, que pulsa enquanto a voz real fala "Good morning! How are you?". | "Ouça: voz nova, mais natural." | Trilha abaixa; voz do app |
| b14 – b20 | **Feedback no polegar** | O polegar toca a resposta certa e o sheet verde "Isso! Agora fala ela." sobe de baixo. A câmera desce até o sheet. | "Resposta na hora, no alcance do polegar." | Pop no toque |
| b20 – b32 | **Ditação** | *Whip pan*. Toque em "Ouvir" com a voz real "My name is Ana.". O texto é digitado palavra a palavra e os blocos coloridos (Sujeito, Verbo, Complemento) se preenchem ao vivo. Toque em Verificar, sobe o sheet "Perfeito!". A câmera orbita levemente. | "Você escreve. A frase se monta na hora." | Voz do app; pop no Verificar |
| b32 – b48 | **Shadowing: ouvir → repetir** | Celular frontal, câmera em órbita lenta. **Ouvir:** a voz real do app diz "I get the same coffee every single day." e a palavra dita acende em lima, com ondas saindo do botão. **Repetir:** o rótulo vira "Sua vez · repita" e as palavras ficam verdes no ritmo de quem fala. É o ciclo novo do shadowing. | "Primeiro, ouça a frase." → "Depois, repita em voz alta." | Voz do app; trilha abaixa |
| b48 – b56 | **Visão do todo** | *Dolly out*: três celulares lado a lado (Aulas, Ditação, Shadowing), em leque, deslizando em paralaxe. | "Pensado para quem está chegando agora." | Swoosh |
| b56 – b60 | **Marco** | O fundo clareia (papel). Só tipografia. | "E a gente segue melhorando." | — |
| b60 – fim | **Assinatura** | Os balões pt/en nascem do rabicho e o logo horizontal se abre (peças reais do kit). A cartela de CTA fica separada, abaixo; o crédito da música fica no rodapé. | CTA: "Toque no link e abra o GRILO no navegador do celular." (ao postar: **sticker de link** do Instagram apontando para o site) | Chime no logo |

## 5. Entregas

- `video/grilo-rebrand/out/story-mobile-E.mp4`: 1080×1920, 30 fps, H.264 (versão final).
- Ao postar: adicionar o sticker de link do Instagram com o endereço do site.
- Stills dos momentos-chave para revisão antes do render final.
- Checagem de mixagem: sem clipping (pico < −1 dBFS) e voz inteligível acima da trilha.

## 6. Fora de escopo

Promessas de preço, de resultado ("fluente em X dias") ou números de crescimento sem fonte. Telas que não existem no app.
