async function initThemePage(){
  const p=new URLSearchParams(location.search);
  const themeId=p.get('theme')||'family';

  const [theme,rules]=await Promise.all([
    fetchJSON(`data/themes/${themeId}.json`),
    fetchJSON('data/rules.json')
  ]);

  const ruleMap=getRuleMap(rules);

  document.getElementById('themeTitle').textContent=`${theme.title} (${theme.level})`;
  document.getElementById('themeDescription').textContent=theme.description;

  document.getElementById('tableHost').innerHTML=renderTable(
    theme.nouns.map(n=>({...n,themeId,level:theme.level})),
    ruleMap
  );
}

document.addEventListener('DOMContentLoaded',initThemePage);
