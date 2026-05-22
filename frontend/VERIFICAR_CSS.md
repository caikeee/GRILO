# 🎨 Verificar Carregamento do CSS Editorial v5

## Problema
O navegador pode estar cacheando a versão antiga do CSS. Solução: **fazer um hard refresh**.

## Como fazer Hard Refresh

### Windows/Linux (Chrome, Firefox, Edge)
- **Ctrl + Shift + R** (recomendado)
- Ou: **Ctrl + Shift + Delete** para abrir DevTools e limpar cache

### macOS
- **Cmd + Shift + R** (Chrome/Edge)
- **Cmd + Opt + R** (Firefox)

### No DevTools (Chrome/Firefox/Edge)
1. Abra **F12** (DevTools)
2. Clique com **botão direito** no botão de reload (seta circular)
3. Selecione **"Empty cache and hard refresh"** / **"Vider le cache et faire un rechargement difficile"**

## Verificar se CSS está carregando

1. Abra **F12** → **Console**
2. Procure por mensagens do editorial renderer:
   ```
   [editorial-renderer] hook instalado · layouts: 26
   [editorial-renderer] layout aplicado: soa1-alfabeto
   ```

3. Abra **F12** → **Network** → **CSS**
4. Procure por `lesson-editorial-v5.css`
5. Verifique se o status é **200** (carregado com sucesso)

## Checklist Visual

Ao abrir uma aula, você deve ver:

✅ **"ROTEIRO EDITORIAL"** em verde/sage
✅ Título grande da aula com ênfase em itálico
✅ Seções numeradas (01, 02, etc.)
✅ Componentes com espaçamento generoso
✅ Cores por módulo aplicadas (âmbar para módulo 01, sage para módulo 02, etc.)
✅ Hovering em elementos deve mudar cor e levantar ligeiramente (transform)
✅ Soundboard com grid de botões interativos

## Se ainda não funcionar

1. Feche a aba de lessons completamente
2. Abra **http://localhost:8000/lessons.html** novamente
3. Faça um hard refresh (Ctrl+Shift+R)

## Versão Atual
- CSS v5: **lesson-editorial-v5.css** (27.5KB)
- Layouts: **26 aulas implementadas**
- Componentes: **10 tipos pedagógicos**
- Cache busting: TS unix atual

---

**Se o problema persistir:** Verifique no console (F12) qual erro está aparecendo e compartilhe a mensagem.
