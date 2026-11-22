import{l as p}from"./site-text-BlHRsZyb.js";function t(a){return a.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function n(a){var s;const o=(s=a.paragraphs)!=null&&s.length?a.paragraphs.map(l=>`<p>${t(l)}</p>`).join(""):"",r=a.author?t(a.author):"",e=a.timeline?t(a.timeline):"";return`<article class="proposal-card">
            <div class="proposal-card__frame">
              <h2 class="proposal-card__title">${t(a.title)}</h2>
              <div class="proposal-card__body">${o}</div>
              <footer class="proposal-card__meta">
                <span class="proposal-card__author">${r}</span>
                <span class="proposal-card__timeline">${e}</span>
              </footer>
            </div>
          </article>`}async function i(){var o;const a=document.getElementById("proposals-root");if(a)try{const r=await p("proposals","/proposals.json");if(!((o=r.proposals)!=null&&o.length)){a.innerHTML='<p class="library-empty">No proposals yet.</p>';return}a.innerHTML=r.proposals.map(n).join(`
`),a.setAttribute("aria-busy","false")}catch(r){console.error("Failed to load proposals",r),a.innerHTML='<p class="library-empty">Proposals could not be loaded. Try again later.</p>',a.setAttribute("aria-busy","false")}}document.getElementById("proposals-root")&&i();
