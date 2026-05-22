# 🔧 Debug Script para Modal de Aulas Não Carregar

Execute os comandos abaixo no console do navegador (F12) para diagnosticar:

## 1️⃣ Verificar se dados estão carregados

```javascript
console.log('=== DADOS ===');
console.log('_lessonsData disponível?', typeof window._lessonsData);
console.log('Número de aulas carregadas:', Object.keys(window._lessonsData || {}).length);
console.log('Slug "pronomes" existe?', 'pronomes' in (window._lessonsData || {}));
console.log('Primeiras chaves:', Object.keys(window._lessonsData || {}).slice(0, 5));
```

## 2️⃣ Verificar se função está disponível

```javascript
console.log('=== FUNÇÕES ===');
console.log('_griloOpenLesson disponível?', typeof window._griloOpenLesson);
console.log('showLessonContent disponível?', typeof window.showLessonContent);
```

## 3️⃣ Verificar DOM

```javascript
console.log('=== DOM ===');
const modal = document.getElementById('lessonContent');
const main = document.getElementById('lessonModalMain');
const aside = document.getElementById('lessonModalAside');
console.log('Modal existe?', !!modal);
console.log('Main existe?', !!main);
console.log('Aside existe?', !!aside);
console.log('Modal hidden?', modal ? modal.hasAttribute('hidden') : 'N/A');
console.log('Modal classList:', modal ? modal.className : 'N/A');
```

## 4️⃣ Teste completo - Abrir manualmente

```javascript
console.log('=== TESTE MANUAL ===');
window._griloOpenLesson('pronomes');
setTimeout(() => {
  const main = document.getElementById('lessonModalMain');
  console.log('Main innerHTML após abertura:', main ? main.innerHTML.substring(0, 200) : 'N/A');
  console.log('Main display (CSS):', main ? window.getComputedStyle(main).display : 'N/A');
}, 500);
```

## 5️⃣ Verificar todos os erros de console

Procure por logs com os padrões:
- `[LESSONS]` - logs da função principal
- `[lessons-fallback]` - logs do fallback
- `[lessons-trail]` - logs do trail
- Qualquer `Error:` ou `Uncaught`

## 🎯 Esperado vs Observado

### Se funcionando corretamente:
```
[LESSONS] Abrindo aula: pronomes
[LESSONS] Renderizando conteúdo para slug: pronomes
[LESSONS] Overview renderizado, tamanho: [número > 1000]
[LESSONS] Seções renderizadas: 3
[LESSONS] Conteúdo final renderizado. Main innerHTML length: [número > 5000]
[LESSONS] Modal classe "active" adicionada
[LESSONS] Modal display: flex (ou block)
[LESSONS] Main display: block
[LESSONS] showLessonContent completo para: pronomes | Modal visible: true | Main HTML length: [número > 5000]
```

### Se quebrado:
- `[LESSONS] Overview renderizado, tamanho: 0` → Problema na renderização
- `[LESSONS] Erro ao renderizar overview: ...` → Exceção na função
- `Main display: none` → Modal oculto por CSS
- `Main innerHTML length: 0` → Conteúdo não foi adicionado

## 📋 Checklist de Debug

- [ ] Verificar se `_lessonsData` tem dados
- [ ] Verificar se `_griloOpenLesson` é função
- [ ] Abrir DevTools e clicar em aula (observe os logs)
- [ ] Se modal abre mas vazio: execute comando 4️⃣ acima
- [ ] Procurar por erros como "Cannot read property 'sections'" 
- [ ] Verificar se há erros de CORS no Network
- [ ] Confirmar que arquivos CSS estão carregando (304 ou 200)

---

**Quando reportar:**
Copie TODO o output do console (F12 → Console → Ctrl+A → Ctrl+C) quando tentar abrir uma aula.
