import{l as i}from"./site-text-BlHRsZyb.js";function s(e){return e.map(r=>{const t=r.items.map(l=>`<li><a href="${n(l.href)}" rel="noopener noreferrer">${a(l.title)}</a></li>`).join(`
          `),c=r.blurb?`<p>${a(r.blurb)}</p>`:"";return`<section class="research-section" id="${n(r.id)}">
        <div>
          <h2 class="section-heading">${a(r.type)}</h2>
          ${c}
        </div>
        <ul class="research-links">
          ${t}
        </ul>
      </section>`}).join(`

      `)}function a(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function n(e){return a(e).replaceAll("'","&#39;")}async function p(){var r;const e=document.getElementById("library-root");if(e)try{const t=await i("library","/library.json");if(!((r=t.sections)!=null&&r.length)){e.innerHTML='<p class="library-empty">No library entries yet.</p>';return}e.innerHTML=s(t.sections),e.setAttribute("aria-busy","false")}catch(t){console.error("Failed to load library",t),e.innerHTML='<p class="library-empty">Library could not be loaded. Try again later.</p>',e.setAttribute("aria-busy","false")}}document.getElementById("library-root")&&p();function o(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function u(e){const r=e.paragraphs.length?e.paragraphs.map(t=>`<p>${o(t)}</p>`).join(`
        `):'<p class="bio-empty">Bio coming soon.</p>';return`<article class="bio-block">
        <h2>${o(e.name)}</h2>
        ${r}
      </article>`}async function b(){var r;const e=document.getElementById("about-people");if(e)try{const t=await i("about","/about.json");if(!((r=t.people)!=null&&r.length)){e.innerHTML='<p class="library-empty">No bios yet.</p>';return}e.innerHTML=t.people.map(u).join(`

      `)}catch(t){console.error("Failed to load about page",t),e.innerHTML='<p class="library-empty">Bios could not be loaded. Try again later.</p>'}}b();
