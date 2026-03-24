async function initPluralRulesPage() {
  const [rules, allNouns] = await Promise.all([
    fetchJSON('data/plural-rules.json'),
    fetchJSON('data/nouns-all.json')
  ]);

  const selectedRule = new URLSearchParams(location.search).get('rule');

  const allRules = [
    ...(rules.pluralRules?.defaultRules || []),
    ...(rules.pluralRules?.patternRules || [])
  ];

  const targetRules = selectedRule
    ? allRules.filter(rule => rule.id === selectedRule)
    : allRules;

  document.getElementById('rulesList').innerHTML = targetRules.map(rule => {
    const linked = allNouns
      .filter(noun => noun.pluralRuleId === rule.id)
      .slice(0, 20);

    return `
      <section class="rule-box">
        <h2 style="margin-top:0">${escapeHTML(rule.title || '')}</h2>

        <div class="badge" style="background: var(--${rule.colorKey || 'default'})">
          ${escapeHTML(rule.shortLabel || 'Plural rule')}
        </div>

        <p>${escapeHTML(rule.ruleLine || '')}</p>

        <p class="small">
          <strong>Examples:</strong>
          ${rule.examples?.map(escapeHTML).join(', ') || '—'}
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
