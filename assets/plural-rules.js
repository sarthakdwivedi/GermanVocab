async function initPluralRulesPage(){
  const [rules, allNouns] = await Promise.all([
    fetchJSON('data/rules.json'),
    fetchJSON('data/nouns-all.json')
  ]);

  const selectedRule = new URLSearchParams(location.search).get('rule');
  const targetRules = selectedRule
    ? rules.pluralRules.filter(rule => rule.id === selectedRule)
    : rules.pluralRules;

  document.getElementById('rulesList').innerHTML = targetRules.map(rule => {
    const linked = allNouns
      .filter(noun => noun.pluralRuleId === rule.id)
      .slice(0, 20);

    return `
      <section class="rule-box">
        <h2 style="margin-top:0">${escapeHTML(rule.title)}</h2>
        <div class="badge" style="background:${rule.color}">
          Plural rule
        </div>
        <p>${escapeHTML(rule.description)}</p>
        <p class="small">
          <strong>Examples:</strong>
          ${rule.examples.map(escapeHTML).join(', ') || '—'}
        </p>

        <div class="row">
          ${linked.map(noun => `
            <a class="badge" href="theme.html?theme=${encodeURIComponent(noun.id.split('-')[0])}">
              ${escapeHTML(noun.word)}
            </a>
          `).join('')}
        </div>
      </section>
    `;
  }).join('') || '<p>No plural rule found.</p>';
}

document.addEventListener('DOMContentLoaded', initPluralRulesPage);
