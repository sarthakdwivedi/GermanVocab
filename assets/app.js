const STORAGE_KEY='germanVocabProgress';

async function fetchJSON(path){
  const r=await fetch(path);
  if(!r.ok) throw new Error(path);
  return r.json();
}

function todayISO(){
  return new Date().toISOString().slice(0,10);
}

function loadProgress(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
  }catch{
    return {};
  }
}

function saveProgress(p){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function getEntryState(id){
  const p=loadProgress();
  return p[id] || {
    revise:false,
    revisionDate:'',
    lastReviewed:'',
    nextReviewDate:'',
    reviewCount:0,
    mastered:false
  };
}

function computeNextReviewDate(c){
  const d=new Date();
  const days = c<=1 ? 1 : c===2 ? 3 : c===3 ? 7 : 14;
  d.setDate(d.getDate()+days);
  return d.toISOString().slice(0,10);
}

function updateEntryState(id,a){
  const p=loadProgress();
  const e=p[id] || {
    revise:false,
    revisionDate:'',
    lastReviewed:'',
    nextReviewDate:'',
    reviewCount:0,
    mastered:false
  };
  const t=todayISO();

  if(a==='revise'){
    e.revise=true;
    e.revisionDate=t;
    e.nextReviewDate=e.reviewCount ? computeNextReviewDate(e.reviewCount) : t;
    e.mastered=false;
  }

  if(a==='schedule-next'){
    e.revise=true;
    e.revisionDate=t;
    e.reviewCount=(e.reviewCount||0)+1;
    e.nextReviewDate=computeNextReviewDate(e.reviewCount);
    e.mastered=false;
  }

  if(a==='reviewed'){
    e.lastReviewed=t;
    e.reviewCount=(e.reviewCount||0)+1;
    e.nextReviewDate=computeNextReviewDate(e.reviewCount);
  }

  if(a==='mastered'){
    e.mastered=!e.mastered;
    if(e.mastered) e.revise=false;
  }

  if(a==='clear'){
    e.revise=false;
    e.mastered=false;
    e.nextReviewDate='';
    e.revisionDate='';
    e.lastReviewed='';
    e.reviewCount=0;
  }

  p[id]=e;
  saveProgress(p);
  return e;
}

function isDueToday(e){
  return e.nextReviewDate && e.nextReviewDate <= todayISO();
}

function getRuleMap(r){
  const m={};
  [...r.genderRules,...r.pluralRules].forEach(x=>m[x.id]=x);
  return m;
}

function escapeHTML(s=''){
  return s.replace(/[&<>"']/g,m=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[m]));
}

function starHTML(filled){
  return `<span class="star ${filled ? 'filled' : ''}" title="${filled ? 'Mastered' : 'Not mastered'}">★</span>`;
}

function wordStyle(noun,ruleMap){
  const g=ruleMap[noun.genderRuleId];
  if(noun.isException) return 'background:#fecaca';
  if(g && !g.common) return `background:${g.color}`;
  return '';
}

function genderExceptionText(noun){
  return noun.genderExceptionToRule ? `Gender exception: ${noun.genderExceptionToRule}` : '';
}

function pluralExceptionText(noun){
  return noun.pluralExceptionToRule ? `Plural exception: ${noun.pluralExceptionToRule}` : '';
}

function exceptionText(noun){
  return [genderExceptionText(noun), pluralExceptionText(noun)].filter(Boolean).join(' | ');
}

function renderNounRow(noun,ruleMap){
  const s=getEntryState(noun.id);
  const g=ruleMap[noun.genderRuleId];
  const p=ruleMap[noun.pluralRuleId];
  const ex=exceptionText(noun);

  return `
    <tr>
      <td>${starHTML(!!s.mastered)}</td>
      <td><span class="word-pill ${noun.isException ? 'exception' : ''}" style="${wordStyle(noun,ruleMap)}">${escapeHTML(noun.word)}</span></td>
      <td>${escapeHTML(noun.english)}</td>
      <td>${escapeHTML(noun.plural)}</td>
      <td><a class="badge" href="gender-rules.html?rule=${encodeURIComponent(noun.genderRuleId)}">${escapeHTML(g?.title || noun.genderRuleId)}</a></td>
      <td><a class="badge" href="plural-rules.html?rule=${encodeURIComponent(noun.pluralRuleId)}">${escapeHTML(p?.title || noun.pluralRuleId)}</a></td>
      <td>${ex ? `<span class="badge exception">${escapeHTML(ex)}</span>` : '—'}</td>
      <td>${s.revisionDate || '—'}</td>
      <td>${s.nextReviewDate || '—'}</td>
      <td>${s.lastReviewed || '—'}</td>
      <td>${s.reviewCount || 0}</td>
      <td>
        <div class="row">
          <button class="icon-btn" title="Schedule next spaced revision" onclick="handleStateAction('${noun.id}','schedule-next')">⟳</button>
          <button class="icon-btn" title="Mark reviewed" onclick="handleStateAction('${noun.id}','reviewed')">✓</button>
          <button class="icon-btn" title="Toggle mastered" onclick="handleStateAction('${noun.id}','mastered')">★</button>
          <button class="icon-btn" title="Clear progress" onclick="handleStateAction('${noun.id}','clear')">✕</button>
        </div>
      </td>
    </tr>
  `;
}

function renderTable(nouns,ruleMap){
  return `
    <div class="table-wrap">
      <table class="vocab-table">
        <thead>
          <tr>
            <th>★</th>
            <th>Noun</th>
            <th>English</th>
            <th>Plural</th>
            <th>Gender rule</th>
            <th>Plural rule</th>
            <th>Exception detail</th>
            <th>Revision date</th>
            <th>Next revision</th>
            <th>Last reviewed</th>
            <th>Reviews</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${nouns.map(n=>renderNounRow(n,ruleMap)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function handleStateAction(id,a){
  updateEntryState(id,a);
  location.reload();
}
