async function initIndex(){
  const [nouns,themes,rules]=await Promise.all([
    fetchJSON('data/nouns-all.json'),
    fetchJSON('data/themes.json'),
    fetchJSON('data/rules.json')
  ]);

  const ruleMap=getRuleMap(rules);

  nouns.forEach(n=>{
    const t=themes.find(x=>x.id===(n.themeId||n.id.split('-')[0]));
    n.themeId=n.themeId||n.id.split('-')[0];
    n.themeTitle=t?.title||n.themeId;
    n.level=t?.level||'';
  });

  const themeSel=document.getElementById('themeFilter');
  themes.forEach(t=>{
    const o=document.createElement('option');
    o.value=t.id;
    o.textContent=`${t.title} (${t.level})`;
    themeSel.appendChild(o);
  });

  function render(){
    const search=document.getElementById('searchInput').value.toLowerCase().trim();
    const level=document.getElementById('levelFilter').value;
    const theme=themeSel.value;
    const status=document.getElementById('statusFilter').value;
    const ex=document.getElementById('exceptionOnly').checked;

    const filtered=nouns.filter(n=>{
      const s=getEntryState(n.id);
      const text=`${n.word} ${n.english} ${n.plural} ${n.genderExceptionToRule||''} ${n.pluralExceptionToRule||''}`.toLowerCase();

      if(search && !text.includes(search)) return false;
      if(level && n.level!==level) return false;
      if(theme && n.themeId!==theme) return false;
      if(ex && !n.isException) return false;
      if(status==='revision' && !s.revise) return false;
      if(status==='mastered' && !s.mastered) return false;
      if(status==='due' && !isDueToday(s)) return false;
      if(status==='new' && (s.revise || s.mastered || s.reviewCount>0)) return false;

      return true;
    });

    document.getElementById('resultsCount').textContent=`${filtered.length} words`;
    document.getElementById('tableHost').innerHTML=renderTable(filtered,ruleMap);
  }

  ['searchInput','levelFilter','themeFilter','statusFilter','exceptionOnly'].forEach(id=>{
    document.getElementById(id).addEventListener('input',render);
    document.getElementById(id).addEventListener('change',render);
  });

  render();
}

document.addEventListener('DOMContentLoaded',initIndex);
