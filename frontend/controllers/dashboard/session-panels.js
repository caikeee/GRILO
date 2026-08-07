    (function(){
        function closePanels(){
            document.querySelectorAll('.session-panel.active').forEach(p=>p.classList.remove('active'));
        }

        function openPanel(id){
            closePanels();
            const el = document.getElementById(id);
            if(!el) return;
            el.classList.add('active');
            // focus first item for keyboard nav
            const first = el.querySelector('.session-item');
            if(first) first.focus();
        }

        // Expose globally so switchTab wrapper can access them
        window.closePanels = closePanels;
        window.openPanel = openPanel;

        // Click outside closes any open session panels
        document.addEventListener('click', (ev)=>{
            const panels = document.querySelectorAll('.session-panel.active');
            if(!panels.length) return;
            // ignore clicks inside panel, sidebar, nav buttons or new session buttons
            if(ev.target.closest('.session-panel') || ev.target.closest('.sidebar') || ev.target.closest('.nav-btn') || ev.target.closest('.new-session-btn')) return;
            closePanels();
        }, true);

        // Esc closes
        document.addEventListener('keydown', (ev)=>{ if(ev.key === 'Escape') closePanels(); });

        document.addEventListener('DOMContentLoaded', ()=>{
            // Keyboard navigation only; session click handling is done via onclick in renderSessionList
            ['writtenSessionsList'].forEach(listId=>{
                const list = document.getElementById(listId);
                if(!list) return;

                // Keyboard navigation inside list
                list.addEventListener('keydown', (ev)=>{
                    const items = Array.from(list.querySelectorAll('.session-item'));
                    if(!items.length) return;
                    const cur = document.activeElement;
                    let idx = items.indexOf(cur);
                    if(ev.key === 'ArrowDown' || ev.key === 'j'){
                        ev.preventDefault(); idx = Math.min(items.length-1, (idx === -1 ? 0 : idx+1)); items[idx].focus();
                    }
                    if(ev.key === 'ArrowUp' || ev.key === 'k'){
                        ev.preventDefault(); idx = Math.max(0, (idx === -1 ? 0 : idx-1)); items[idx].focus();
                    }
                    if(ev.key === 'Enter'){
                        ev.preventDefault(); document.activeElement.click();
                    }
                });
            });
        });
    })();
