# 🚀 Debug - Aulas não abrem no Railway

## O que foi mudado

1. **URLs de API** - Mudadas de `window.location.origin + '/api/...'` para `/api/...` (URLs relativas)
   - `lessons-enhanced.js` (linha 3147)
   - `dashboard.js` (linha 6)  
   - `phrase-voice-trainer.js` (linha 15)
   - `utils.js` (linhas 18-21)

2. **Cache busting** - Versão atualizada de `?v=20260517` para `?v=20260520` em todos os arquivos HTML

3. **Debug logs** - Adicionados logs detalhados para rastrear o fluxo

## Como testar no Railway

### 1. Abrir o Console do Navegador
- Pressione `F12` ou `Ctrl+Shift+I`
- Vá para a aba **Console**

### 2. Procure por estes logs ao abrir a página:

```
[LESSONS-ENHANCED] Script iniciando...
[LESSONS] API_BASE_URL:  window.location.origin: https://seu-app.railway.app
[lessons-fallback] click em card: [slug da aula]
[LESSONS] Abrindo aula: [slug da aula]
[LESSONS-ENHANCED] Script carregado. window._griloOpenLesson disponível: true
```

### 3. Se clicou em uma aula mas nada aconteceu:

Rode estes comandos no console:

```javascript
// 1. Verificar se os dados das aulas estão carregados
console.log('Aulas disponíveis:', window._lessonsData ? Object.keys(window._lessonsData) : 'NÃO CARREGOU');

// 2. Verificar se a função de abrir aula existe
console.log('_griloOpenLesson existe:', typeof window._griloOpenLesson === 'function');

// 3. Tentar abrir manualmente uma aula
window._griloOpenLesson('pronomes');

// 4. Verificar se o modal existe no DOM
console.log('Modal existe:', document.getElementById('lessonContent') ? 'SIM' : 'NÃO');

// 5. Verificar a autenticação
console.log('Token localStorage:', localStorage.getItem('grilo_token') ? 'PRESENTE' : 'AUSENTE');
```

### 4. Testar as APIs diretamente

Abra `/test-api.html` no Railway e teste:
- URL relativa vs absoluta
- Autenticação com token
- Page-view tracking

### 5. Procurar por erros de rede

- Aba **Network** do DevTools
- Procure por requests de `/api/lessons/`
- Verifique se retornam HTTP 200 ou erro

## Possíveis problemas

### ❌ Problema: "Modal não existe no DOM"
- Solução: Verificar se o `lessons.html` está sendo servido corretamente
- Teste: Inspecione o HTML, procure por `id="lessonContent"`

### ❌ Problema: "Aulas não carregaram" (window._lessonsData vazio)
- Solução: `lessons-enhanced.js` não executou completamente
- Verificar erros de sintaxe no console
- Checar se houve erro durante a execução

### ❌ Problema: "_griloOpenLesson não é função"
- Solução: `lessons-enhanced.js` ainda não carregou
- Aguarde os `defer` scripts terminarem
- Verifique se há erro bloquando a execução

### ❌ Problema: APIs retornam erro 401
- Solução: Token inválido ou expirado
- Faça login novamente
- Verifique localStorage: `localStorage.getItem('grilo_token')`

### ❌ Problema: APIs retornam erro de CORS
- Solução: Pode ser problema na configuração do Railway backend
- Verifique se `CORS_ORIGINS` está configurado corretamente no `.env` do backend

## Next Steps

Se depois disso as aulas continuarem não abrindo:

1. **Cole o conteúdo do Console** aqui - todo o output
2. **Descreva o que vê**: nada acontece, erro de CORS, erro 401, etc.
3. **Verifique a aba Network**: quais requests falharam?

## Mudanças de segurança implementadas

✅ URLs relativas funcionam em qualquer domínio/proxy  
✅ Autenticação via Bearer token (segura)  
✅ CORS headers corretos  
✅ Token com expiração de 8h  
✅ Logs de debug para diagnóstico  
