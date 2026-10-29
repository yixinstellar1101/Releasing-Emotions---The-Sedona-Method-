'use strict';
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = () => globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
  const STORE = 'songjian.sedona.v1';
  const themeTopics=window.SEDONA_THEMES?.topics||[],themeWeeks=window.SEDONA_THEMES?.weeks||[];
  let themeWeek='all',themeSearchQuery='',previewThemeId=null,previewThemeAngle=0,recordWantFilter='all';
  const emotions = [
    {id:'apathy',name:'麻木',en:'APATHY',color:'#a6ada4',hint:'没力气，像隔了一层',words:['麻木','无力','疲惫','空白','低落','无助','卡住'],keys:['累','不想动','没感觉','无所谓','麻木','无力','疲惫','空白','低落','无助','卡住']},
    {id:'grief',name:'悲伤',en:'GRIEF',color:'#9daebb',hint:'失落，想被理解',words:['难过','委屈','失望','孤独','内疚','后悔','心痛'],keys:['难过','委屈','失望','孤独','内疚','后悔','心痛','伤心','失去','被忽视']},
    {id:'fear',name:'恐惧',en:'FEAR',color:'#a6b5a0',hint:'紧绷，担心会发生什么',words:['焦虑','担心','紧张','不安','害怕','犹豫','不确定'],keys:['焦虑','担心','紧张','不安','害怕','犹豫','不确定','恐惧','怕','出错','风险']},
    {id:'lust',name:'渴求',en:'LUST',color:'#c9b38c',hint:'很想得到，好像还不够',words:['渴望','急切','不满足','羡慕','匮乏','执着','着急'],keys:['渴望','急切','不满足','羡慕','匮乏','执着','着急','想要','必须得到','不够']},
    {id:'anger',name:'愤怒',en:'ANGER',color:'#c29c88',hint:'有抗拒，觉得不公平',words:['生气','烦躁','不满','抗拒','恼火','受挫','不耐烦'],keys:['生气','烦躁','不满','抗拒','恼火','受挫','不耐烦','不公平','凭什么','愤怒']},
    {id:'pride',name:'骄傲',en:'PRIDE',color:'#b6a7b7',hint:'想证明，想守住立场',words:['优越感','逞强','要面子','防备','不服气','固执','自满'],keys:['优越','逞强','面子','防备','不服','固执','自满','证明','比别人','认输']},
    {id:'courage',name:'勇气',en:'COURAGEOUSNESS',color:'#9cae7b',hint:'愿意试试，有一点力量',words:['愿意','有力量','有信心','好奇','开放','坚定','有动力'],keys:['愿意','力量','信心','好奇','开放','坚定','动力','勇气']},
    {id:'acceptance',name:'接纳',en:'ACCEPTANCE',color:'#a9bda4',hint:'可以如此，容得下不同',words:['允许','理解','温柔','包容','欣赏','满足','自在'],keys:['允许','理解','温柔','包容','欣赏','满足','自在','接纳']},
    {id:'peace',name:'平静',en:'PEACE',color:'#a5b9b2',hint:'安静，暂时不需要改变',words:['平静','安宁','轻松','自由','踏实','宽广','安然'],keys:['平静','安宁','轻松','自由','踏实','宽广','安然','宁静']}
  ];
  const chartCategories=window.SEDONA_CHART?.categories||[];
  const chartFor=id=>chartCategories.find(c=>c.id===id);
  const quickEnglish={'麻木':'Numb','无力':'Powerless','疲惫':'Drained','空白':'Blank','低落':'Depressed','无助':'Helpless','卡住':'Stuck','难过':'Sadness','委屈':'Hurt','失望':'Disappointed','孤独':'Lonely','内疚':'Guilty','后悔':'Regret','心痛':'Heartache','焦虑':'Anxious','担心':'Worry','紧张':'Nervous','不安':'Apprehensive','害怕':'Scared','犹豫':'Hesitant','不确定':'Uncertain','渴望':'Craving','急切':'Can’t wait','不满足':'Never satisfied','羡慕':'Envy','匮乏':'Lack','执着':'Fixated','着急':'Impatient','生气':'Annoyed','烦躁':'Irritated','不满':'Resentment','抗拒':'Resistant','恼火':'Fuming','受挫':'Frustrated','不耐烦':'Impatience','优越感':'Superior','逞强':'Stoic','要面子':'Vain','防备':'Defensive','不服气':'Defiant','固执':'Stubborn','自满':'Complacent','愿意':'Willing','有力量':'Strong','有信心':'Confident','好奇':'Curious','开放':'Open','坚定':'Purposeful','有动力':'Motivated','允许':'Allowing','理解':'Understanding','温柔':'Gentle','包容':'Embracing','欣赏':'Appreciative','满足':'Fulfilled','自在':'Playful','平静':'Calm','安宁':'Tranquility','轻松':'Light','自由':'Free','踏实':'Secure','宽广':'Boundless','安然':'Serenity','暂时说不清':'Not sure yet','悲伤':'Grief','恐惧':'Fear','渴求':'Lust','愤怒':'Anger','骄傲':'Pride','勇气':'Courageousness','接纳':'Acceptance'};
  const chartEntries=chartCategories.flatMap(c=>c.entries);
  function wordEnglish(word){return quickEnglish[word]||chartEntries.find(entry=>entry.zh===word)?.en||'';}
  function bilingualWord(word){const en=wordEnglish(word);return `<span class="word-zh">${esc(word)}</span>${en?`<span class="word-en" lang="en">${esc(en)}</span>`:''}`;}
  const matchesWord=(word,query)=>[word,wordEnglish(word)].some(s=>s.toLocaleLowerCase().includes(query));
  const belongsTo=(emotion,word)=>word===emotion.name||emotion.words.includes(word)||Boolean(chartFor(emotion.id)?.entries.some(entry=>entry.zh===word));
  let mapCategoryChoice=null,mapSearchQuery='',visualTimer=null,visualDone=null;
  const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
  let quietMotion=false;try{quietMotion=localStorage.getItem('songjian.motion')==='quiet';}catch{}
  function syncMotionPreference(){document.documentElement.dataset.motion=quietMotion?'quiet':'full';}
  syncMotionPreference();

  const wants = [
    {id:'control',name:'想要控制',en:'Wanting Control',symbol:'control',prompt:'我希望什么必须改变，或必须按我的方式发生？',hint:'也可能是：急着消除感受、追求完美，或想让别人改变。',keys:['控制','必须','应该','一定','完美','改变','按我','赶快','立刻','释放不掉','结果']},
    {id:'approval',name:'想要认同',en:'Wanting Approval',symbol:'help',prompt:'我在期待谁的认可、理解、喜欢或肯定？',hint:'也可能是：怕让人失望、难以拒绝，或急着证明自己。',keys:['认同','认可','理解','喜欢','肯定','讨厌我','评价','拒绝','证明','面子','别人怎么看','点赞','让人失望']},
    {id:'security',name:'想要安全',en:'Wanting to be Safe, Secure, to Survive',symbol:'lock',prompt:'我在担心失去什么，或试图获得哪种确定感？',hint:'也可能是：担心未来、害怕出错，或不断寻找保证。',keys:['安全','失去','担心','害怕','未来','出错','确定','保证','钱','工作','稳定','风险']}
  ];
  const bodyWords = ['胸口发紧','喉咙堵住','胃部收缩','肩颈紧绷','身体沉重','暂时说不清'];
  const stepNames = ['觉察当下','识别情绪','看见想要','慢慢释放','记录此刻'];
  const reminders = window.SEDONA_PRACTICE_NOTES?.reminders||[];
  const questions = [
    {title:'我能允许此刻的感受，<br>先在这里吗？',short:'我能允许此刻的感受先在这里吗？',sub:'允许不需要制造感觉，只看看能否少一点阻止和对抗。',options:['可以','还不能','不确定'],feedback:['让它有一点位置。只需要留意此刻真实的体验。','还不能也被允许。能否先允许自己暂时卡住？也看看对这份感受的抗拒，不必勉强接纳。','不知道也可以。先给“还不确定”留一点空间。']},
    {title:'此刻，我能把这份紧抓，<br>松开一点点吗？',short:'我能把这份紧抓松开一点点吗？',sub:'先问能不能，不急着说服自己愿意；哪怕只松一点，也不用力。',options:['可以试试','暂时不能','不确定'],feedback:['如果愿意，让肩膀或手掌稍稍松一点，看看此刻有什么不同。','暂时不能也可以。先允许它留下，不把释放变成另一项要求。','不需要找到正确答案。只是留意：此刻有没有一点松动的可能？']},
    {title:'如果可以，<br>我愿意松开一点吗？',short:'如果可以，我愿意松开一点吗？',sub:'听听自己的真实回答，而不是应该怎样回答。',options:['愿意','还不愿意','不确定'],feedback:['跟随这点愿意。保留你的愿望，只松开对结果的紧抓。','尊重这份不愿意。可以看看它在保护什么，也可以不分析，先陪它一会儿。','可以带着不确定继续。不需要先说服自己。']},
    {title:'如果愿意，<br>我想什么时候试试？',short:'我想什么时候试着松开？',sub:'回到身体和感受再回答；现在、以后或还不知道都可以。',options:['现在试一下','晚一点','还不知道'],feedback:['停一小会儿，感受一下此刻。呼吸自然，不要求情绪消失。','晚一点也可以。这一轮可以只做觉察，结束时如实记录感受。','没有时间表也可以。留意一下当下，看看感受有没有变化。']}
  ];
  let storageOK=true,saveTimer,toastTimer,currentView='practice',reminderIndex=0,confirmAction=null,voiceActive=null,holdTimer=null,voiceDown=false;
  const newDraft=()=>({id:uid(),createdAt:new Date().toISOString(),step:0,theme:null,originRecordId:null,context:'',body:[],before:5,emotions:[],wants:[],wantNote:'',releaseStep:0,answers:[],roundBefore:5,roundAfter:5,roundNote:'',rounds:[],reminders:[],note:'',action:'',saved:false,completedAt:null,activeMs:0});
  const validString=(s,max=12000)=>typeof s==='string'&&s.length<=max;
  const validScore=n=>Number.isInteger(n)&&n>=0&&n<=10;
  const validArray=(a,max=100,limit=100)=>Array.isArray(a)&&a.length<=max&&a.every(s=>validString(s,limit));
  const validDate=s=>typeof s==='string'&&s.length<=50&&Number.isFinite(Date.parse(s));
  const validWants=a=>validArray(a,4)&&a.every(w=>['control','approval','security','unsure'].includes(w));
  const validAnswers=a=>Array.isArray(a)&&a.length<=4&&a.every((x,i)=>x&&validString(x.question,200)&&questions[i].options.includes(x.answer)&&validDate(x.at));
  function validTheme(theme){return theme===undefined||theme===null||Boolean(theme&&typeof theme==='object'&&!Array.isArray(theme)&&validString(theme.title,200)&&theme.title.length>0&&Number.isInteger(theme.day)&&theme.day>=1&&theme.day<=21&&theme.week===Math.ceil(theme.day/7)&&theme.id==='day-'+String(theme.day).padStart(2,'0')&&validString(theme.angle,1200));}
  function validDraft(d){return d&&validTheme(d.theme)&&(d.originRecordId==null||validString(d.originRecordId,100))&&typeof d==='object'&&validString(d.id,100)&&d.id.length>0&&validDate(d.createdAt)&&Number.isInteger(d.step)&&d.step>=0&&d.step<=4&&validString(d.context)&&validArray(d.body,6)&&validScore(d.before)&&validArray(d.emotions,500)&&validWants(d.wants)&&validString(d.wantNote)&&Number.isInteger(d.releaseStep)&&d.releaseStep>=0&&d.releaseStep<=4&&validAnswers(d.answers)&&validScore(d.roundBefore)&&validScore(d.roundAfter)&&validString(d.roundNote)&&Array.isArray(d.rounds)&&d.rounds.length<=1000&&d.rounds.every(r=>r&&validScore(r.before)&&validScore(r.after)&&validString(r.note)&&validDate(r.at)&&validArray(r.emotions,500)&&validWants(r.wants)&&validAnswers(r.answers)&&r.answers.length===4)&&Array.isArray(d.reminders)&&d.reminders.length<=2000&&d.reminders.every(r=>r&&validString(r.reason,100)&&validDate(r.at))&&validString(d.note)&&validString(d.action)&&typeof d.saved==='boolean'&&(d.completedAt===null||validDate(d.completedAt))&&Number.isFinite(d.activeMs)&&d.activeMs>=0&&d.activeMs<=1e13&&(d.step!==3||d.answers.length>=d.releaseStep)&&(d.step!==4||d.rounds.length>0);}
  const clone=value=>JSON.parse(JSON.stringify(value));
  let state={version:1,draft:newDraft(),records:[]};
  try{const raw=localStorage.getItem(STORE);if(raw){const data=JSON.parse(raw);if(data.version!==1||!validDraft(data.draft)||!Array.isArray(data.records)||!data.records.every(r=>validDraft(r)&&['completed','paused'].includes(r.status)&&(r.updatedAt===undefined||validDate(r.updatedAt))))throw Error('invalid');state=data;}}catch(error){storageOK=false;$('#storageWarning').hidden=false;$('#storageWarning').textContent='本机存储暂时无法读取。当前内容仅保留在页面内；请导出备份，避免关闭后丢失。原有存储不会被覆盖。';}
  let draft=state.draft,lastTick=Date.now();
  function updateClock(){const now=Date.now();if(!document.hidden&&currentView==='practice'&&!draft.saved)draft.activeMs+=Math.min(now-lastTick,5000);lastTick=now;const elapsed=$('#elapsed');if(elapsed)elapsed.textContent=draft.activeMs<60000?'慢慢来，不着急':`${Math.floor(draft.activeMs/60000)} 分钟相处`;}
  function persist(immediate=false){state.draft=draft;clearTimeout(saveTimer);const write=()=>{if(storageOK)try{localStorage.setItem(STORE,JSON.stringify(state));$('#saveStatus').textContent='已自动保存到本机';}catch(error){storageOK=false;$('#storageWarning').hidden=false;$('#storageWarning').textContent='本机存储不可用或空间不足。请导出备份，当前新内容暂时只保留在页面内。';}if(!storageOK)$('#saveStatus').textContent='暂存于当前页面 · 请导出';};if(immediate)write();else{$('#saveStatus').textContent=storageOK?'正在保存…':'暂存于当前页面 · 请导出';saveTimer=setTimeout(write,250);}}
  function touch(){draft.saved=false;draft.completedAt=null;persist();}
  function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,3400);}
  function dateLabel(s,full=false){return new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',...(full?{hour:'2-digit',minute:'2-digit'}:{})}).format(new Date(s));}
  function wantLabel(id){return wants.find(w=>w.id===id)?.name||'暂时不确定';}
  function tags(items,fallback='还没有选择'){return items.length?items.map(x=>`<span class="snapshot-tag">${esc(x)}</span>`).join(''):`<span class="snapshot-placeholder">${fallback}</span>`;}
  function updateAside(){
    $('#snapEmotions').innerHTML=tags(draft.emotions);$('#snapWants').innerHTML=tags(draft.wants.map(wantLabel));$('#snapIntensity').innerHTML=tags([`${draft.before} / 10`]);$('#snapRounds').innerHTML=tags(draft.rounds.length?[`已完成 ${draft.rounds.length} 轮`]:[],'随时可以开始');$('#recordCount').textContent=state.records.length;
    const quotes=[['你可以有情绪，<br>也可以有空间。','先感受，不急着分析。<br>每一种真实的回答，都被允许。'],['情绪是体验，<br>不是你的全部。','名字只是一个入口。<br>你的真实感受，比分类更重要。'],['愿望可以留下，<br>紧抓可以松开。','无需放弃目标和边界。<br>看看“非这样不可”能否松一点。'],['不需要用力，<br>也不需要做对。','“不愿意”和“不知道”，<br>同样可以是当下的答案。'],['允许有变化，<br>也允许没有变化。','给真实的此刻留个位置。<br>这次练习，可以到这里。']];
    $('#sideQuote').innerHTML=quotes[draft.step][0];$('#sideQuoteSub').innerHTML=quotes[draft.step][1];updateClock();
  }
  function voiceField(key,label,placeholder,rows=3){return `<label class="field-label" for="field-${key}">${label}</label><div class="input-wrap"><textarea id="field-${key}" data-field="${key}" rows="${rows}" maxlength="12000" placeholder="${esc(placeholder)}">${esc(draft[key])}</textarea><div class="voice-row"><button class="voice-btn" data-voice="${key}" aria-label="按住说话，转写到${label}">${icon('mic')}<span>按住说话</span></button><span class="voice-status" id="voice-${key}" role="status">松开转文字 · 可编辑</span></div></div>`;}
  function rangeField(key,label){return `<div class="range-line"><label class="field-label" for="range-${key}" style="margin:0">${label}</label><output class="range-value" for="range-${key}"><b id="value-${key}">${draft[key]}</b> / 10</output></div><input class="range" type="range" id="range-${key}" data-score="${key}" min="0" max="10" step="1" value="${draft[key]}"><div class="range-labels"><span>0 · 几乎没有</span><span>10 · 很强烈</span></div>`;}
  function frame(title,intro,content,footer){return `<div class="section-label"><span>0${draft.step+1} / ${['NOTICE','FEEL','EXPLORE','RELEASE','REFLECT'][draft.step]}</span><span>${draft.step===3?`第 ${draft.rounds.length+1} 轮`:'按你的节奏就好'}</span></div>${themeBanner()}<h2 class="serif" id="stepTitle" tabindex="-1">${title}</h2><p class="intro">${intro}</p>${themeWelcome()}${feelingCue()}${preparationHint()}${content}${returnPracticePanel()}<div class="card-footer">${footer}</div>`;}
  const nextButton=(label='继续',id='nextStep')=>`<button class="button primary" id="${id}">${label}${icon('arrow')}</button>`;
  const backButton=()=>'<button class="button ghost" id="prevStep">← 上一步</button>';
  function themeBanner(){
    if(!draft.theme)return '';const theme=draft.theme;
    return `<div class="practice-theme"><div class="practice-theme-head"><span>主题释放 · Day ${theme.day}</span><button id="openThemeLibrary">主题库 ↗</button></div><strong>${esc(theme.title)}</strong>${draft.step===0?`<p>${esc(theme.angle)}</p>`:''}</div>`;
  }
  function renderThemes(){
    $('#themeSearch').value=themeSearchQuery;
    $('#themeSearch').oninput=()=>{themeSearchQuery=$('#themeSearch').value;renderThemeCards();};
    $$('[data-theme-week]').forEach(button=>button.onclick=()=>{themeWeek=button.dataset.themeWeek;renderThemeCards();});
    const completed=themeTopics.filter(topic=>state.records.some(record=>record.theme?.id===topic.id&&record.status==='completed')).length;
    $('#themeProgress').innerHTML=`<b>${completed}</b> / ${themeTopics.length}<br>个主题留有记录`;
    const current=$('#themeContinue');current.hidden=!draft.theme||draft.saved;
    current.className='theme-continue';
    if(!current.hidden){current.innerHTML=`<p>正在练习<br><strong>${esc(draft.theme.title)}</strong></p><button class="button secondary" id="continueCurrentTheme">继续当前练习${icon('arrow')}</button>`;$('#continueCurrentTheme').onclick=()=>showView('practice');}
    renderThemeCards();
  }
  function renderThemeCards(){
    const query=themeSearchQuery.trim().toLocaleLowerCase();
    $$('[data-theme-week]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.themeWeek===themeWeek));
    const topics=themeTopics.filter(topic=>(themeWeek==='all'||topic.week===Number(themeWeek))&&(!query||[topic.title,topic.description,...topic.tags,...topic.angles,'Day '+topic.day].join(' ').toLocaleLowerCase().includes(query)));
    const week=themeWeeks.find(week=>week.id===Number(themeWeek));
    $('#themeResults').textContent=`${topics.length} 个主题${week?' · '+week.title:''} · 可以按需选择，也可以重复练习`;
    $('#themesGrid').innerHTML=topics.length?topics.map(topic=>{const count=state.records.filter(record=>record.theme?.id===topic.id&&record.status==='completed').length;const active=draft.theme?.id===topic.id&&!draft.saved;return `<button class="theme-card ${active?'active-theme':''}" data-theme-id="${topic.id}" aria-label="Day ${topic.day} ${esc(topic.title)}"><span class="theme-card-top"><span class="theme-day">DAY ${String(topic.day).padStart(2,'0')} · 第${topic.week}周</span>${active?'<span class="theme-practiced">正在练习</span>':count?`<span class="theme-practiced">已练 ${count} 次</span>`:''}</span><span class="theme-title">${esc(topic.title)}</span><span class="theme-description">${esc(topic.description)}</span><span class="theme-card-tags">${topic.tags.map(tag=>`<span>${esc(tag)}</span>`).join('')}</span><span class="theme-card-bottom"><span>选择这个主题</span><span aria-hidden="true">↗</span></span></button>`;}).join(''):'<div class="card empty-state"><h3>还没有找到贴近的主题。</h3><p>可以换个词，或看看全部主题。</p><button class="button secondary" id="resetThemeSearch">查看全部主题</button></div>';
    $$('[data-theme-id]').forEach(button=>button.onclick=()=>previewTheme(button.dataset.themeId));
    $('#resetThemeSearch')?.addEventListener('click',()=>{themeWeek='all';themeSearchQuery='';$('#themeSearch').value='';renderThemeCards();});
  }
  function previewTheme(id){
    const topic=themeTopics.find(topic=>topic.id===id);if(!topic)return;
    stopVoice(false);previewThemeId=id;previewThemeAngle=0;
    $('#themeDialogEyebrow').textContent=`主题释放 · Day ${topic.day} · 第${topic.week}周`;
    $('#themeDialogTitle').textContent=topic.title;$('#themeDialogDescription').textContent=topic.description;
    renderThemeAngles(topic);$('#themeDraftNote').hidden=draft.saved||!meaningful(draft);
    $('#viewThemeRecords').hidden=!state.records.some(record=>record.theme?.id===id);$('#themeDialog').showModal();
  }
  function renderThemeAngles(topic){
    $('#themeAngles').innerHTML=topic.angles.map((angle,index)=>`<button class="theme-angle" data-theme-angle="${index}" aria-pressed="${index===previewThemeAngle}"><span class="theme-angle-dot" aria-hidden="true"></span><span>${esc(angle)}</span></button>`).join('');
    $$('[data-theme-angle]').forEach(button=>button.onclick=()=>{previewThemeAngle=Number(button.dataset.themeAngle);$$('[data-theme-angle]').forEach(item=>item.setAttribute('aria-pressed',Number(item.dataset.themeAngle)===previewThemeAngle));});
  }
  function startTheme(){
    const topic=themeTopics.find(topic=>topic.id===previewThemeId);if(!topic)return;
    stopVoice(false);if(!draft.saved&&meaningful(draft))saveRecord('paused',false);
    draft=newDraft();draft.theme={id:topic.id,title:topic.title,day:topic.day,week:topic.week,angle:topic.angles[previewThemeAngle]};
    lastTick=Date.now();persist(true);$('#themeDialog').close();showView('practice');$('#stepTitle').focus({preventScroll:true});
    toast('已开始主题释放：'+topic.title);
  }
  function viewThemeRecords(){
    const topic=themeTopics.find(topic=>topic.id===previewThemeId);if(!topic)return;$('#themeDialog').close();recordWantFilter='all';$('#recordSearch').value=topic.title;showView('records');
  }

  function themeWelcome(){return draft.step===0&&!draft.theme?'<button class="theme-welcome-link" id="chooseTheme">从主题库选一个主题 ↗</button>':'';}
  function themeRecordTag(theme){return `<span class="theme-record-tag">主题 · ${esc(theme.title)}</span>`;}
  function themeRecordDetail(theme){return `<div class="detail-block"><h3>主题释放 · Day ${theme.day}</h3><p>${esc(theme.title)}<br>${esc(theme.angle)}</p></div>`;}
  const practiceNotes=window.SEDONA_PRACTICE_NOTES||{tools:[],reminders:[]};
  const practiceToolDrafts={};let practiceToolKind=null,practiceToolFocusIndex=0;
  function bindPracticeToolButtons(root=document){$$('[data-practice-tool]',root).forEach(button=>button.onclick=()=>openPracticeTool(button.dataset.practiceTool));}
  function preparationHint(){return draft.step===2?'<details class="prepare-release"><summary>也看看：我对释放本身有没有要求？</summary><p>很想轻松释放、一次完成，或一定要找到感觉时，可以先觉察这份期待。若感觉到用力，再由自己辨认三大想要。</p><button data-practice-tool="expectation">先练“对释放的期待” ↗</button></details>':'';}
  function feelingCue(){return draft.step===1||draft.step===3&&draft.releaseStep<4?'<details class="feeling-cue"><summary>脑中想法太多时，怎样回到感受？</summary><ul><li>不必先解释原因，先问：想到这句话，身体哪里最有感觉？</li><li>可以留意紧、沉、热或想躲开的感觉；也允许暂时说不清。</li><li>允许不是努力制造情绪，只是看看能否少一点阻止和对抗。</li></ul></details>':'';}
  function originPractice(){return draft.originRecordId&&draft.originRecordId!==draft.id?state.records.find(record=>record.id===draft.originRecordId&&record.status==='paused'):null;}
  function returnPracticePanel(){const origin=originPractice();return draft.step===4&&origin?`<div class="return-to-practice"><p>这次可以到这里。刚才的练习已保留：${esc((origin.context||origin.theme?.title||'一次释放练习').split('\n')[0].slice(0,60))}</p><button class="button secondary" id="returnOriginPractice">保存并回到刚才的练习${icon('arrow')}</button></div>`:'';}
  function returnOriginPractice(){const origin=originPractice();if(!origin)return;stopVoice(false);if(!draft.saved&&draft.step===4&&draft.rounds.length)saveRecord('completed',false);draft=clone(origin);delete draft.status;delete draft.updatedAt;draft.saved=false;lastTick=Date.now();persist(true);showView('practice');$('#stepTitle').focus({preventScroll:true});toast('已回到刚才停下的地方');}
  function toolField(key,label,placeholder,rows=3,max=2000){const value=practiceToolDrafts[practiceToolKind]?.[key]||'';return `<label class="tool-field"><span>${label}</span>${rows===1?`<input data-tool-field="${key}" maxlength="${max}" value="${esc(value)}" placeholder="${esc(placeholder)}">`:`<textarea data-tool-field="${key}" rows="${rows}" maxlength="${max}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`}</label>`;}
  function openPracticeTool(kind){
    const tool=practiceNotes.tools.find(tool=>tool.id===kind);if(!tool)return;stopVoice(false);
    if($('#stuckDialog').open){logReminder();$('#stuckDialog').close();}if($('#themeDialog').open)$('#themeDialog').close();
    practiceToolKind=kind;practiceToolFocusIndex=0;practiceToolDrafts[kind]??={goal:tool.goal,actions:'',benefits:'',concerns:'',reflection:''};
    $('#practiceToolTitle').textContent=tool.title;$('#practiceToolDescription').textContent=tool.description;$('#practiceToolHint').textContent=tool.hint;
    let fields=toolField('goal','我想练习的目标','例如：完成一次汇报、发出一个邀请…',1,300);
    if(kind==='action')fields+=toolField('actions','为了这个目标，我可以做的小行动（每行一项）','例如：打开文档\n写第一句话\n发出一条消息',3,3000);
    if(kind==='outcome')fields+=toolField('benefits','现在就实现，让我期待的好处（每行一项，可留空）','例如：更自在地表达、获得新的选择…',3,2500)+toolField('concerns','现在就实现，我担心什么（每行一项，可留空）','例如：被看见以后要承担更多责任…',3,2500);
    fields+=toolField('reflection',kind==='expectation'?'想到这个目标，我留意到的期待或担心（选填）':'此刻浮现的感受或想法（选填）','先写一两个真实的词，不必分析完整。',3,2000);
    $('#practiceToolFields').innerHTML=fields;$('#practiceToolError').hidden=true;$('#practiceToolDraftNote').hidden=draft.saved||!meaningful(draft);
    $$('[data-tool-field]').forEach(field=>field.oninput=()=>{practiceToolDrafts[kind][field.dataset.toolField]=field.value;$('#practiceToolError').hidden=true;renderPracticeToolFocus();});
    renderPracticeToolFocus();$('#practiceToolDialog').showModal();
  }
  function practiceToolChoices(){
    const values=practiceToolDrafts[practiceToolKind];if(!values)return [];
    const lines=value=>value.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
    if(practiceToolKind==='expectation')return [
      {label:'想到这个释放目标，最明显的感受是什么？',question:'想到“'+(values.goal.trim()||'轻松释放／一次性释放')+'”，此刻最明显的感受是什么？'},
      {label:'如果现在就实现，我会担心什么？',question:'如果现在就能轻松释放，我会担心什么？'},
      {label:'想到“必须有感觉、必须一次做完”，我有什么感受？',question:'想到“必须有感觉、必须一次做完”，我有什么感受？'}
    ];
    if(practiceToolKind==='action')return lines(values.actions).map(line=>({label:'想到这一步：'+line,question:'想到这一步行动：'+line.slice(0,500)+'，此刻最明显的感受是什么？'}));
    return [...lines(values.benefits).map(line=>({label:'期待的好处：'+line,question:'如果现在就实现，想到这个好处：'+line.slice(0,500)+'，我有什么感受？'})),...lines(values.concerns).map(line=>({label:'实现后的担心：'+line,question:'如果现在就实现，想到这个担心：'+line.slice(0,500)+'，我有什么感受？'}))];
  }
  function renderPracticeToolFocus(){const choices=practiceToolChoices();practiceToolFocusIndex=Math.min(practiceToolFocusIndex,Math.max(0,choices.length-1));$('#practiceToolFocus').innerHTML=choices.length?choices.map((choice,index)=>`<button class="tool-focus-choice" data-tool-focus="${index}" aria-pressed="${index===practiceToolFocusIndex}">${esc(choice.label)}</button>`).join(''):'<p class="tool-hint">先在上方写下一项行动，或一个好处／担心，就可以选它开始。</p>';$$('[data-tool-focus]').forEach(button=>button.onclick=()=>{practiceToolFocusIndex=Number(button.dataset.toolFocus);$$('[data-tool-focus]').forEach(item=>item.setAttribute('aria-pressed',Number(item.dataset.toolFocus)===practiceToolFocusIndex));});}
  function startPracticeTool(){
    const tool=practiceNotes.tools.find(tool=>tool.id===practiceToolKind);if(!tool)return;const values=practiceToolDrafts[practiceToolKind];
    $$('[data-tool-field]').forEach(field=>values[field.dataset.toolField]=field.value);
    const error=(message,key)=>{$('#practiceToolError').textContent=message;$('#practiceToolError').hidden=false;$(`[data-tool-field="${key}"]`)?.focus();};
    if(!values.goal.trim()){error('先写下一个你想觉察的目标。','goal');return;}const choices=practiceToolChoices();if(!choices.length){error(practiceToolKind==='action'?'先写下一项具体的小行动。':'好处或担心，写下一项就可以；不用强迫自己两边都有。',practiceToolKind==='action'?'actions':'benefits');return;}
    const choice=choices[Math.min(practiceToolFocusIndex,choices.length-1)];stopVoice(false);const previousOrigin=originPractice()?.id||null;let returnId=null;
    if(!draft.saved&&meaningful(draft)){const complete=draft.step===4&&draft.rounds.length>0;returnId=complete?null:draft.id;saveRecord(complete?'completed':'paused',false);}
    const content=['练习：'+tool.short,'目标：'+values.goal.trim(),'本轮关注：'+choice.question];
    if(values.actions.trim())content.push('行动清单：\n'+values.actions.trim());if(values.benefits.trim())content.push('实现的好处：\n'+values.benefits.trim());if(values.concerns.trim())content.push('实现后的担心：\n'+values.concerns.trim());if(values.reflection.trim())content.push('此刻浮现的感受或想法：\n'+values.reflection.trim());
    draft=newDraft();draft.originRecordId=previousOrigin||returnId;draft.context=content.join('\n\n');const topic=themeTopics.find(topic=>topic.id===tool.topic);if(topic)draft.theme={id:topic.id,title:topic.title,day:topic.day,week:topic.week,angle:choice.question};
    lastTick=Date.now();persist(true);$('#practiceToolDialog').close();showView('practice');$('#stepTitle').focus({preventScroll:true});
  }

  function renderPractice(focus=false){
    stopVoice(false);$('#steps').innerHTML=stepNames.map((name,i)=>`<li class="step ${i===draft.step?'active':i<draft.step?'done':''}" ${i===draft.step?'aria-current="step"':''}><span class="step-num">${i<draft.step?'✓':String(i+1).padStart(2,'0')}</span><span>${name}</span></li>`).join('');let html='';
    if(draft.step===0)html=frame('此刻，什么在牵动你？','从一件小事、一段想法，或身体里的感觉开始。',`${voiceField('context','我想从这里开始','例如：等了一整天没有收到回复，我有些不安…')}<div class="examples"><span>也可以从这里开始</span>${['一段关系','工作与期待','对未来的担心'].map(s=>`<button class="text-chip" data-example="${s}">${s}</button>`).join('')}</div><div class="field-block"><span class="field-label">身体有什么感觉？<span class="muted small"> 可多选，也可跳过</span></span><div class="chips">${bodyWords.map(s=>`<button class="chip ${draft.body.includes(s)?'selected':''}" data-body="${s}" aria-pressed="${draft.body.includes(s)}">${s}</button>`).join('')}</div></div><div class="field-block">${rangeField('before','这份感受，现在有多强？')}</div>`,`<span class="footer-hint">不想描述，也可以直接感受。</span>${nextButton('开始觉察')}`);
    if(draft.step===1)html=frame('如果给感受一个名字…','看看哪些词贴近此刻。可以多选，也可以暂时说不清。',`<label><span class="sr-only">搜索情绪词</span><input id="emotionSearch" class="search" maxlength="100" placeholder="寻找一个情绪词，比如：委屈、紧张…"></label><div id="emotionSuggestions" class="suggestion"></div><div class="emotion-grid" id="emotionGrid"></div><div id="emotionWords"></div><div class="chips"><button class="chip" id="unclearEmotion">暂时说不清</button></div><div class="inline-field"><label class="sr-only" for="customEmotion">自己的情绪词</label><input class="search" id="customEmotion" placeholder="或用自己的词描述…" maxlength="80"><button class="button secondary" id="addEmotion">添加</button></div><div class="help-note">已选：<span id="selectedEmotions"></span></div>`,`${backButton()}${nextButton('看看背后的想要')}`);
    if(draft.step===2)html=frame('这份感受背后，我在想要什么？','留意哪一句触动你。几种想要可能同时存在，不必分析出唯一答案。',`<div id="wantSuggestions" class="suggestion"></div><div class="want-list">${wants.map(w=>`<button class="want-card ${draft.wants.includes(w.id)?'selected':''}" data-want="${w.id}" aria-pressed="${draft.wants.includes(w.id)}"><span class="want-symbol">${icon(w.symbol)}</span><span><span class="want-name">${w.name}<span class="want-en" lang="en">${w.en}</span></span><small>${w.prompt}<br>${w.hint}</small></span><span class="checkmark" aria-hidden="true">✓</span></button>`).join('')}</div><div class="chips" style="margin-top:13px"><button class="chip ${draft.wants.includes('unsure')?'selected':''}" data-want="unsure" aria-pressed="${draft.wants.includes('unsure')}">暂时不确定</button></div><div class="help-note">松开的是“非这样不可”的紧抓。你的目标、现实需要和边界都可以保留。</div>${voiceField('wantNote','我留意到…（选填）','例如：我很想确认对方没有讨厌我。',2)}`,`${backButton()}${nextButton('进入释放')}`);
    if(draft.step===3){
      const n=draft.releaseStep,q=questions[n],answer=draft.answers[n]?.answer,idx=q?.options.indexOf(answer);const progress=`<div class="mini-progress" aria-label="本轮第 ${n+1} 步，共5步">${Array.from({length:5},(_,i)=>`<span class="${i===n?'active':i<n?'done':''}"></span>`).join('')}</div>`;const selected=[...draft.emotions,...draft.wants.map(wantLabel)];
      const content=n<4?`${progress}<div class="focus-tags chips">${selected.map(s=>`<span class="snapshot-tag">${esc(s)}</span>`).join('')}</div><button class="release-orb" id="visualizeRelease" aria-label="播放轻轻放下的意象动画">${icon('leaf')}</button><p class="visual-cue">按自己的节奏呼吸 · 轻触叶子，看一个放下的意象</p><div class="release-focus">${q.title}</div><p class="release-sub">${q.sub}</p><div class="answer-options">${q.options.map((s,i)=>`<button class="answer-option ${answer===s?'selected':''}" data-answer="${i}" aria-pressed="${answer===s}">${s}</button>`).join('')}</div><div class="answer-feedback" id="answerFeedback" role="status">${idx>=0?q.feedback[idx]:'选一个真实的回答。没有标准答案。'}</div><div class="round-help"><button id="inlineStuck">有点卡住，给自己一个提醒</button></div>`:`${progress}<div class="help-note">先停一下，再次想到这个主题，听听身体和直觉的回答。新的情绪、余感或没有变化，都可以如实记录；不必到零或某种指定状态才结束。</div><div class="field-block">${rangeField('roundAfter','回到感受，直觉上还剩多少？')}</div><p class="summary-detail">这一轮开始时：${draft.roundBefore} / 10。这里只是对比感受，不是练习评分。</p>${voiceField('roundNote','这一轮，我发现…（选填）','有什么松动、新的感受，或者没有变化？',3)}<div class="repeat-release-panel"><div><strong>情绪还剩下一点？</strong><p>保留这一轮记录，回到“允许感受在这里”，再慢慢松开一点。</p></div><button class="button primary" id="repeatFromCheck">还有一点，再释放一轮 ↻</button></div>`;
      html=frame(n<4?'给感受一点空间。':'此刻，有什么不一样？',n<4?'读一遍问题，停一下，回到身体和真实的感受。':'不需要达到某个数值，才允许自己结束。',content,`<button class="button ghost" id="releaseBack">← ${n===0?'看见想要':'前一个问题'}</button><button class="button primary" id="releaseNext" ${n<4&&!answer?'disabled':''}>${n===4?'完成这一轮':'继续'}${icon('arrow')}</button>`);
    }
    if(draft.step===4){const after=draft.rounds.at(-1)?.after??draft.before;html=frame('谢谢你，陪自己走到这里。','这次可以结束，也可以再看见一层新的感受。',`${draft.saved?`<div class="success-mark">${icon('check')}这次练习已保存。<button class="saved-record-link" id="viewSaved">查看记录</button></div>`:''}<div class="round-summary"><div class="score"><b>${draft.before}</b><span>开始时</span></div>${icon('arrow')}<div class="score"><b>${after}</b><span>此刻</span></div><span class="muted small">/ 10</span></div><p class="summary-detail">${after<draft.before?'也许有一点空间出现了。留意此刻的体验，无需抓住这份变化。':after>draft.before?'你可能看见了更多感受。可以再练习，也可以先休息，照顾此刻的自己。':'没有明显变化也可以。真实地看见这一刻，就可以停下来。'}</p><div class="rounds">${draft.rounds.map((r,i)=>`<div class="round-row"><span>第 ${i+1} 轮 · ${esc(r.emotions.join('、'))}</span><span>${r.before} → ${r.after}</span></div>`).join('')}</div>${voiceField('note','给这次练习留几句话（选填）','我留意到什么？现在更需要什么？',3)}<div class="field-block">${voiceField('action','接下来，我想照顾自己的一件小事（选填）','例如：喝点水，走一走，或把需要的话说清楚。',2)}</div><div class="actions" style="margin-top:19px"><button class="button secondary" id="repeatRound">再释放一轮</button><button class="button" id="reidentify">看看新的情绪</button></div>`,`<button class="button ghost" id="newSession">开始新的练习</button>${draft.saved?'<button class="button primary" id="showRecords">查看释放记录</button>':nextButton('保存这次记录','saveSession')}`);}
    $('#practiceCard').innerHTML=html;bindPractice();updateAside();if(draft.step===1){renderEmotions();renderSuggestions();}if(draft.step===2)renderWantSuggestions();if(focus){$('#stepTitle').focus({preventScroll:true});const card=$('#practiceCard');if(card.getBoundingClientRect().top<16)card.scrollIntoView({block:'start',behavior:'instant'});}
  }
  function toggle(items,value,unclear){if(items.includes(value))return items.filter(s=>s!==value);if(value===unclear)return[value];return[...items.filter(s=>s!==unclear),value];}
  function setStep(n){draft.step=n;touch();renderPractice(true);}
  function beginRelease(){draft.releaseStep=0;draft.answers=[];draft.roundBefore=draft.rounds.at(-1)?.after??draft.before;draft.roundAfter=draft.roundBefore;draft.roundNote='';draft.step=3;touch();renderPractice(true);}
  function bindPractice(){
    bindPracticeToolButtons($('#practiceCard'));$('#returnOriginPractice')?.addEventListener('click',returnOriginPractice);
    $('#openThemeLibrary')?.addEventListener('click',()=>showView('themes'));$('#chooseTheme')?.addEventListener('click',()=>showView('themes'));
    $$('[data-field]',$('#practiceCard')).forEach(el=>el.addEventListener('input',()=>{draft[el.dataset.field]=el.value;const wasSaved=draft.saved;touch();if(wasSaved&&draft.step===4){$('.success-mark')?.remove();const b=$('#showRecords');if(b){b.id='saveSession';b.innerHTML='保存这次记录'+icon('arrow');b.replaceWith(b.cloneNode(true));$('#saveSession').addEventListener('click',finishSession);}}}));
    $$('[data-score]').forEach(el=>el.addEventListener('input',()=>{draft[el.dataset.score]=Number(el.value);$(`#value-${el.dataset.score}`).textContent=el.value;touch();updateAside();}));
    $$('[data-body]').forEach(el=>el.addEventListener('click',()=>{draft.body=toggle(draft.body,el.dataset.body,'暂时说不清');touch();$$('[data-body]').forEach(b=>{const on=draft.body.includes(b.dataset.body);b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on);});}));
    $$('[data-example]').forEach(el=>el.addEventListener('click',()=>{const examples={'一段关系':'想到这段关系，我此刻感到…','工作与期待':'想到工作里的这件事，我此刻感到…','对未来的担心':'想到未来，我此刻在担心…'};const field=$('#field-context');if(field.value.trim()){field.focus();toast('可以在当前文字后，继续写下你的感受。');return;}draft.context=examples[el.dataset.example];field.value=draft.context;field.focus();touch();}));
    $('#nextStep')?.addEventListener('click',()=>{if(draft.step===1&&!draft.emotions.length){draft.emotions=['暂时说不清'];toast('先带着“暂时说不清”继续，也可以回来补充。');}if(draft.step===2){if(!draft.wants.length)draft.wants=['unsure'];beginRelease();}else setStep(draft.step+1);});
    $('#prevStep')?.addEventListener('click',()=>setStep(draft.step-1));$('#emotionSearch')?.addEventListener('input',renderEmotions);
    $('#unclearEmotion')?.addEventListener('click',()=>{draft.emotions=toggle(draft.emotions,'暂时说不清','暂时说不清');touch();renderEmotions();updateAside();});
    const addCustom=()=>{const el=$('#customEmotion'),word=el.value.trim();if(!word)return;if(draft.emotions.length>=80){toast('这次已记录许多感受，可以先选一个来体验。');return;}if(!draft.emotions.includes(word))draft.emotions=[...draft.emotions.filter(e=>e!=='暂时说不清'),word];el.value='';touch();renderEmotions();updateAside();};
    $('#addEmotion')?.addEventListener('click',addCustom);$('#customEmotion')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();addCustom();}});
    $$('[data-want]').forEach(el=>el.addEventListener('click',()=>{draft.wants=toggle(draft.wants,el.dataset.want,'unsure');touch();$$('[data-want]').forEach(b=>{const on=draft.wants.includes(b.dataset.want);b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on);});updateAside();}));
    $$('[data-answer]').forEach(el=>el.addEventListener('click',()=>{const n=draft.releaseStep,q=questions[n],i=Number(el.dataset.answer);draft.answers[n]={question:q.short,answer:q.options[i],at:new Date().toISOString()};draft.answers=draft.answers.slice(0,n+1);touch();$$('[data-answer]').forEach(b=>{const on=b===el;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on);});$('#answerFeedback').textContent=q.feedback[i];$('#releaseNext').disabled=false;}));
    $('#releaseBack')?.addEventListener('click',()=>{if(draft.releaseStep===0){setStep(2);return;}draft.releaseStep--;touch();renderPractice(true);});
    $('#releaseNext')?.addEventListener('click',()=>{if(draft.releaseStep===3&&draft.answers[3]?.answer===questions[3].options[0])playReleaseVisual(advanceRelease);else advanceRelease();});
    $('#visualizeRelease')?.addEventListener('click',()=>playReleaseVisual());
    $('#repeatFromCheck')?.addEventListener('click',()=>{if(completeReleaseRound())beginRelease();});
    $('#inlineStuck')?.addEventListener('click',openStuck);$('#repeatRound')?.addEventListener('click',beginRelease);$('#reidentify')?.addEventListener('click',()=>{draft.answers=[];draft.releaseStep=0;setStep(1);});
    $('#saveSession')?.addEventListener('click',finishSession);$('#newSession')?.addEventListener('click',()=>startNew());$('#showRecords')?.addEventListener('click',()=>{recordWantFilter='all';$('#recordSearch').value='';showView('records');});$('#viewSaved')?.addEventListener('click',()=>openRecord(draft.id));bindVoice();
  }
  function finishSession(){saveRecord('completed');renderPractice();toast(storageOK?'已保存这次释放记录':'已加入当前页面记录，请导出备份');}
  function playReleaseVisual(done=null){
    if(quietMotion||motionQuery.matches){if(done)done();else toast('留意一下：能否让这一点紧绷松开？');return;}
    const dialog=$('#releaseVisual');if(dialog.open)return;
    const word=draft.emotions.find(w=>w!=='暂时说不清')||'此刻的紧绷';
    $('#visualEmotion').textContent=word.slice(0,22);$('#visualEnglish').textContent=wordEnglish(word);
    $('#visualParticles').innerHTML=Array.from({length:16},(_,i)=>`<span style="--dx:${Math.round(Math.cos(i*2.4)*(45+(i%4)*16))}px;--dy:${-100-(i%5)*20}px;--delay:${i%6*65}ms;--size:${3+i%4}px"></span>`).join('');
    $('#quietMotion').checked=quietMotion;visualDone=done;dialog.showModal();dialog.classList.remove('playing');void dialog.offsetWidth;dialog.classList.add('playing');
    clearTimeout(visualTimer);visualTimer=setTimeout(finishReleaseVisual,2600);
  }
  function finishReleaseVisual(){
    clearTimeout(visualTimer);visualTimer=null;const done=visualDone;visualDone=null;const dialog=$('#releaseVisual');dialog.classList.remove('playing');if(dialog.open)dialog.close();done?.();
  }
  function completeReleaseRound(){
    stopVoice(false);
    if(draft.step!==3||draft.releaseStep!==4||draft.answers.length!==4)return false;
    draft.rounds.push({before:draft.roundBefore,after:draft.roundAfter,note:draft.roundNote,answers:clone(draft.answers),emotions:[...draft.emotions],wants:[...draft.wants],at:new Date().toISOString()});
    return true;
  }
  function advanceRelease(){
    if(draft.releaseStep<4){if(!draft.answers[draft.releaseStep])return;draft.releaseStep++;touch();renderPractice(true); }
    else if(completeReleaseRound())setStep(4);
  }
  function renderEmotions(){
    const query=$('#emotionSearch')?.value.trim().toLocaleLowerCase()||'';
    const matched=emotions.filter(e=>!query||[e.name,e.en,e.hint,...e.words,...(chartFor(e.id)?.entries.flatMap(w=>[w.zh,w.en])||[])].some(w=>w.toLocaleLowerCase().includes(query))||e.words.some(w=>matchesWord(w,query)));
    $('#emotionGrid').innerHTML=matched.map(e=>{const on=draft.emotions.some(s=>belongsTo(e,s));return `<button class="emotion-card ${on?'selected':''}" data-emotion="${e.id}" aria-pressed="${on}"><span class="emotion-top"><span class="emotion-dot" style="--dot:${e.color}"></span>${e.name}</span><span class="emotion-en" lang="en">${e.en}</span><small>${e.hint}</small></button>`;}).join('')||'<p class="no-results">没有找到接近的词，可以在下方用自己的话添加。</p>';
    const groups=emotions.filter(e=>draft.emotions.some(s=>belongsTo(e,s))||(query&&matched.includes(e)));
    const candidates=[...new Set(groups.flatMap(e=>query?[...e.words,...(chartFor(e.id)?.entries.map(w=>w.zh)||[])]:e.words))];
    const words=candidates.filter(w=>!query||matchesWord(w,query)||groups.some(e=>[e.name,e.en].some(n=>n.toLowerCase().includes(query))&&belongsTo(e,w))||draft.emotions.includes(w));
    $('#emotionWords').innerHTML=groups.length?`<div class="emotion-words"><p>再靠近一点：哪个词更像你的感受？</p><div class="chips bilingual-chips">${words.map(w=>`<button class="chip ${draft.emotions.includes(w)?'selected':''}" data-word="${esc(w)}" aria-pressed="${draft.emotions.includes(w)}">${bilingualWord(w)}</button>`).join('')}</div><button class="chart-link" id="browseFullChart">查看完整中英情绪表 ↗</button></div>`:'';
    $('#selectedEmotions').innerHTML=draft.emotions.length?draft.emotions.map(s=>`<button class="text-chip" data-remove-emotion="${esc(s)}" aria-label="移除${esc(s)}">${esc(s)}${wordEnglish(s)?` <span lang="en">${esc(wordEnglish(s))}</span>`:''} ×</button>`).join(' '):'还没选也没关系';
    const unclear=$('#unclearEmotion');unclear.classList.toggle('selected',draft.emotions.includes('暂时说不清'));unclear.setAttribute('aria-pressed',draft.emotions.includes('暂时说不清'));
    $$('[data-emotion]').forEach(el=>el.addEventListener('click',()=>{const e=emotions.find(x=>x.id===el.dataset.emotion),on=draft.emotions.some(s=>belongsTo(e,s));draft.emotions=on?draft.emotions.filter(s=>!belongsTo(e,s)):toggle(draft.emotions,e.name,'暂时说不清');touch();renderEmotions();updateAside();}));
    $$('[data-word]').forEach(el=>el.addEventListener('click',()=>{draft.emotions=toggle(draft.emotions,el.dataset.word,'暂时说不清');touch();renderEmotions();updateAside();}));
    $$('[data-remove-emotion]').forEach(el=>el.addEventListener('click',()=>{draft.emotions=draft.emotions.filter(s=>s!==el.dataset.removeEmotion);touch();renderEmotions();updateAside();}));
    $('#browseFullChart')?.addEventListener('click',()=>{mapCategoryChoice=groups.length===1?groups[0].id:'all';mapSearchQuery='';showView('map');});
  }

  function renderSuggestions(){const matches=emotions.map(e=>({e,words:e.keys.filter(k=>draft.context.includes(k))})).filter(m=>m.words.length).slice(0,3);$('#emotionSuggestions').innerHTML=matches.length?`文字里有“${matches.flatMap(m=>m.words).slice(0,3).map(esc).join('、')}”，可以看看：${matches.map(m=>`<button class="text-chip" data-suggest-emotion="${m.e.id}">${m.e.name}</button>`).join(' ')}<span class="small muted"> · 仅为词语线索，由你确认</span>`:'';$$('[data-suggest-emotion]').forEach(el=>el.addEventListener('click',()=>{const name=emotions.find(e=>e.id===el.dataset.suggestEmotion).name;if(!draft.emotions.includes(name))draft.emotions=toggle(draft.emotions,name,'暂时说不清');touch();renderEmotions();updateAside();}));}
  function renderWantSuggestions(){const text=draft.context+' '+draft.wantNote;const matches=wants.map(w=>({w,words:w.keys.filter(k=>text.includes(k))})).filter(m=>m.words.length);$('#wantSuggestions').innerHTML=matches.length?`从文字里的“${matches.flatMap(m=>m.words).slice(0,3).map(esc).join('、')}”出发，可以探索${matches.map(m=>m.w.name).map(esc).join('、')}。<br><span class="muted">这只是关键词提示，不代表你的真实动机。</span>`:'';}
  function showView(view){if(!['practice','themes','records','map','guide'].includes(view))return;stopVoice(false);updateClock();currentView=view;lastTick=Date.now();['practice','themes','records','map','guide'].forEach(v=>{$(`#${v}View`).hidden=v!==view;});$$('.nav-button').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});if(view==='practice')renderPractice();if(view==='records')renderRecords();if(view==='map')renderMap();if(view==='themes')renderThemes();window.scrollTo({top:0,behavior:'instant'});persist(true);}
  const meaningful=d=>d.theme||d.context.trim()||d.emotions.length||d.rounds.length||d.wants.length||d.note.trim()||d.body.length||d.step>0;
  function startNew(){stopVoice(false);const run=()=>{if(meaningful(draft)&&!draft.saved)saveRecord('paused',false);draft=newDraft();persist(true);showView('practice');};if(meaningful(draft)&&!draft.saved)confirmDialog('开始新的练习？','当前练习会先保存为暂停记录，之后可以从记录中继续。',run,'保存并开始');else run();}
  function saveRecord(status,notice=true){stopVoice(false);updateClock();const now=new Date().toISOString();draft.saved=status==='completed';draft.completedAt=status==='completed'?now:null;const record={...clone(draft),status,updatedAt:now};const i=state.records.findIndex(r=>r.id===draft.id);if(i>=0)state.records[i]=record;else state.records.unshift(record);persist(true);updateAside();if(status==='paused'&&notice)toast(storageOK?'已保存为暂停记录，随时可以继续':'已暂存暂停记录，请导出备份');}
  function recordWantIds(record){
    const selected=new Set([...(record.wants||[]),...(record.rounds||[]).flatMap(round=>round.wants||[])]);
    return wants.map(want=>want.id).filter(id=>selected.has(id));
  }
  function recordWantTitle(record){const ids=recordWantIds(record);return ids.length?ids.map(wantLabel).join(' · '):'三大想要 · 暂时不确定';}
  function recordFeelingWords(record){return [...new Set([...(record.emotions||[]),...(record.rounds||[]).flatMap(round=>round.emotions||[])])];}
  function recordWantsDetail(record){const ids=recordWantIds(record);return `<div class="detail-block record-primary-detail"><h3>主要想要</h3><div class="record-want-pills">${ids.length?ids.map(id=>`<span class="record-want-pill" data-want-id="${id}">${esc(wantLabel(id))}</span>`).join(''):'<span class="record-want-unset">暂时不确定</span>'}</div><p class="record-primary-note">${ids.length?'汇总本次各轮已辨认的想要，可以同时有几种。':'这次还没有确定三大想要，先如实保留感受。'}</p>${record.wantNote?`<p>${esc(record.wantNote)}</p>`:''}</div>`;}
  function matchesRecordWant(record,filter){const ids=recordWantIds(record);return filter==='all'||(filter==='unsure'?ids.length===0:ids.includes(filter));}
  function renderRecords(){
    const query=$('#recordSearch').value.trim().toLowerCase();
    const searched=state.records.filter(record=>[record.theme?.title||'',record.theme?.angle||'',record.theme?'主题释放 Day '+record.theme.day:'',record.context,record.note,record.action,record.wantNote,...recordFeelingWords(record),recordWantTitle(record),...(record.rounds||[]).map(round=>round.note)].join(' ').toLowerCase().includes(query));
    const list=searched.filter(record=>matchesRecordWant(record,recordWantFilter)).sort((a,b)=>Date.parse(b.updatedAt||b.createdAt)-Date.parse(a.updatedAt||a.createdAt));
    $('#recordResults').textContent=(recordWantFilter!=='all'||query)?`${list.length} / ${state.records.length} 条记录`:`${list.length} 条记录`;$('#recordCount').textContent=state.records.length;
    const filters=[{id:'all',name:'全部'},...wants.map(want=>({id:want.id,name:want.name})),{id:'unsure',name:'暂时不确定'}];
    $('#recordWantFilters').innerHTML=filters.map(filter=>`<button class="record-want-filter" data-record-want="${filter.id}" aria-pressed="${recordWantFilter===filter.id}"><span>${filter.name}</span><span class="record-filter-count">${searched.filter(record=>matchesRecordWant(record,filter.id)).length}</span></button>`).join('');
    $$('[data-record-want]').forEach(button=>button.onclick=()=>{recordWantFilter=button.dataset.recordWant;renderRecords();});
    $('#recordsList').innerHTML=list.length?list.map(record=>{const feelings=recordFeelingWords(record);return `<button class="card record-card" data-record="${esc(record.id)}"><div class="record-top"><span>${dateLabel(record.createdAt,true)} · ${Math.max(1,Math.ceil(record.activeMs/60000))} 分钟</span><span class="status-pill ${record.status==='paused'?'paused':''}">${record.status==='paused'?'暂停 · 可以继续':'已完成'}</span></div><div class="record-primary-label">主要想要</div><h3 class="record-wants-title">${esc(recordWantTitle(record))}</h3><p class="record-context">${esc(record.context.trim().slice(0,100)||record.theme?.title||'一次与自己的相处')}</p><div class="record-secondary-emotions"><span>具体情绪</span><span>${esc(feelings.length?feelings.slice(0,6).join('、')+(feelings.length>6?` 等 ${feelings.length} 种`:''):'暂时说不清')}</span></div><div class="record-meta">${record.theme?themeRecordTag(record.theme):''}<span class="record-score">${record.before} → ${record.rounds.at(-1)?.after??record.before} / 10 · ${record.rounds.length} 轮</span></div></button>`;}).join(''):`<div class="card empty-state">${icon('book')}<h3>${query||recordWantFilter!=='all'?'还没有匹配的记录':'把一次与自己的相处，留在这里。'}</h3><p>${query||recordWantFilter!=='all'?'可以换一个想要分类，或清空搜索。':'完成练习后保存，或在卡住时选择暂停保存。'}</p>${query||recordWantFilter!=='all'?'<button class="button secondary" id="clearRecordFilters">查看全部记录</button>':nextButton('开始一次释放','emptyStart')}</div>`;
    $$('[data-record]').forEach(button=>button.onclick=()=>openRecord(button.dataset.record));$('#emptyStart')?.addEventListener('click',()=>showView('practice'));$('#clearRecordFilters')?.addEventListener('click',()=>{recordWantFilter='all';$('#recordSearch').value='';renderRecords();});
  }

  function openRecord(id){const r=state.records.find(x=>x.id===id);if(!r)return;const answerTable=answers=>`<table class="detail-table"><tbody>${answers.map(a=>`<tr><td>${esc(a.question)}</td><td>${esc(a.answer)}</td></tr>`).join('')}</tbody></table>`;$('#recordTitle').textContent=recordWantTitle(r);$('#recordDetail').innerHTML=`<p class="dialog-intro">${dateLabel(r.createdAt,true)} · ${r.status==='paused'?'暂停记录':'已完成'} · ${Math.max(1,Math.ceil(r.activeMs/60000))} 分钟</p>${recordWantsDetail(r)}${r.theme?themeRecordDetail(r.theme):''}<div class="detail-block"><h3>当时发生了什么</h3><p>${esc(r.context||'没有文字描述')}</p></div><div class="detail-block record-specific-emotions"><h3>具体情绪（补充）</h3><div class="chips">${tags(recordFeelingWords(r),'暂时说不清')}</div></div><div class="detail-block"><h3>身体感受</h3><p>${esc(r.body.join('、')||'未记录')}</p></div><div class="round-summary"><div class="score"><b>${r.before}</b><span>开始时</span></div>${icon('arrow')}<div class="score"><b>${r.rounds.at(-1)?.after??r.before}</b><span>最后一轮后</span></div></div>${r.rounds.map((round,i)=>`<details class="detail-block"><summary>第 ${i+1} 轮 · ${round.before} → ${round.after} / 10</summary><p class="record-round-wants">本轮想要：${esc(recordWantTitle(round))}</p><p class="record-round-emotions">具体情绪：${esc(round.emotions.join('、')||'暂时说不清')}</p>${answerTable(round.answers)}<p>${esc(round.note||'这一轮没有文字记录')}</p></details>`).join('')}${r.status==='paused'&&r.step===3&&(r.answers.length||r.roundNote)?`<div class="detail-block"><h3>尚未完成的一轮</h3>${answerTable(r.answers)}<p>${esc(r.roundNote)}</p></div>`:''}${r.note?`<div class="detail-block"><h3>留给自己的话</h3><p>${esc(r.note)}</p></div>`:''}${r.action?`<div class="detail-block"><h3>接下来的一件小事</h3><p>${esc(r.action)}</p></div>`:''}${r.reminders.length?`<div class="detail-block"><h3>曾经给自己的提醒</h3><p>${esc(r.reminders.map(m=>m.reason).join(' · '))}</p></div>`:''}<div class="dialog-actions">${r.status==='paused'?'<button class="button primary" id="resumeRecord">继续这次练习</button>':''}<button class="button danger" id="deleteRecord">删除这条记录</button></div>`;$('#recordDialog').showModal();
    $('#deleteRecord').addEventListener('click',()=>confirmDialog('删除这条记录？','仅删除这条已保存的记录。删除后可以使用此前导出的备份恢复。',()=>{state.records=state.records.filter(x=>x.id!==id);if(draft.id===id){draft.saved=false;draft.completedAt=null;}persist(true);$('#recordDialog').close();renderRecords();toast('记录已删除');},'删除'));
    $('#resumeRecord')?.addEventListener('click',()=>{const run=()=>{if(draft.id!==r.id&&!draft.saved&&meaningful(draft))saveRecord('paused',false);draft=clone(r);delete draft.status;delete draft.updatedAt;draft.saved=false;lastTick=Date.now();persist(true);$('#recordDialog').close();showView('practice');toast('已回到上次停下的地方');};if(draft.id!==r.id&&!draft.saved&&meaningful(draft))confirmDialog('继续这条暂停记录？','当前练习会先保存为另一条暂停记录。',run,'保存并继续');else run();});
  }
  function renderMap(){
    if(mapCategoryChoice===null)mapCategoryChoice=window.matchMedia('(max-width:760px)').matches?'apathy':'all';
    $('#mapCategory').innerHTML='<option value="all">全部类别 · All emotions</option>'+chartCategories.map(c=>`<option value="${c.id}">${c.name} · ${c.en}</option>`).join('');
    $('#mapCategory').value=mapCategoryChoice;$('#mapSearch').value=mapSearchQuery;
    $('#mapSearch').oninput=()=>{mapSearchQuery=$('#mapSearch').value;renderChartCards();};
    $('#mapCategory').onchange=()=>{mapCategoryChoice=$('#mapCategory').value;renderChartCards();};
    renderChartCards();
  }
  function renderChartCards(){
    const query=mapSearchQuery.trim().toLocaleLowerCase();
    const categories=chartCategories.filter(c=>mapCategoryChoice==='all'||c.id===mapCategoryChoice).map(c=>({...c,visible:c.entries.filter(w=>!query||[w.zh,w.en,w.ipa,c.name,c.en].some(s=>s.toLocaleLowerCase().includes(query)))})).filter(c=>c.visible.length);
    $('#mapStatus').textContent=`${categories.reduce((sum,c)=>sum+c.visible.length,0)} 个词条 · ${query?'搜索结果':'中文 / English / 音标'}${mapCategoryChoice==='all'?'':' · 可切换类别'}`;
    $('#mapGrid').classList.toggle('single-category',mapCategoryChoice!=='all');
    $('#mapGrid').innerHTML=categories.length?categories.map(c=>{const e=emotions.find(e=>e.id===c.id);return `<article class="card map-card"><div class="chart-card-head"><h3><span class="emotion-dot" style="--dot:${e.color}"></span>${c.name}</h3><span class="chart-entry-count">${c.visible.length}</span></div><div class="eyebrow" lang="en">${c.en}</div><p>${e.hint}</p><div class="chart-table-scroll" tabindex="0" role="region" aria-label="${c.name}中英文词条"><table class="emotion-table"><caption class="sr-only">${c.name} · ${c.en}</caption><thead><tr><th scope="col">中文</th><th scope="col" lang="en">English / 音标</th></tr></thead><tbody>${c.visible.map(w=>`<tr class="${draft.emotions.includes(w.zh)?'chosen':''}"><td><button data-map-word="${esc(w.zh)}" aria-label="选择${esc(w.zh)} ${esc(w.en)}">${esc(w.zh)}</button></td><td><span class="table-english" lang="en">${esc(w.en)}</span>${w.ipa?`<span class="table-ipa" lang="en">${esc(w.ipa)}</span>`:''}</td></tr>`).join('')}</tbody></table></div></article>`;}).join(''):'<div class="card empty-state"><h3>这个类别里还没有找到对应词语。</h3><p>可以切换到“全部类别”，或换一个中文 / 英文关键词。</p><button class="button secondary" id="searchAllCategories">在全部类别查找</button></div>';
    $('#searchAllCategories')?.addEventListener('click',()=>{mapCategoryChoice='all';$('#mapCategory').value='all';renderChartCards();});
    $$('[data-map-word]').forEach(el=>el.addEventListener('click',()=>{const apply=()=>{if(draft.saved)draft=newDraft();if(!draft.emotions.includes(el.dataset.mapWord))draft.emotions=toggle(draft.emotions,el.dataset.mapWord,'暂时说不清');draft.answers=[];draft.releaseStep=0;draft.step=1;touch();showView('practice');toast('已带入当前练习，可以继续选择。');};if(draft.step===3)confirmDialog('带着新的感受继续？','当前尚未完成的一轮会重新开始；已完成的轮次会保留。',apply,'继续辨认');else apply();}));
  }

  function openStuck(){stopVoice(false);renderStuck();$('#stuckDialog').showModal();}
  function renderStuck(){$('#stuckReasons').innerHTML=reminders.map((r,i)=>`<button class="chip ${i===reminderIndex?'selected':''}" data-reason="${i}" aria-pressed="${i===reminderIndex}">${r.name}</button>`).join('');$('#stuckMessage').innerHTML=`<h3>${reminders[reminderIndex].title}</h3><p>${reminders[reminderIndex].text}</p>`;$$('[data-reason]').forEach(el=>el.addEventListener('click',()=>{reminderIndex=Number(el.dataset.reason);renderStuck();$(`[data-reason="${reminderIndex}"]`).focus();}));}
  function logReminder(){draft.reminders.push({reason:reminders[reminderIndex].name,at:new Date().toISOString()});touch();}
  function confirmDialog(title,message,action,label='确定'){$('#confirmTitle').textContent=title;$('#confirmText').textContent=message;$('#confirmYes').textContent=label;confirmAction=action;$('#confirmDialog').showModal();}
  function exportData(){stopVoice(false);persist(true);const blob=new Blob([JSON.stringify({app:'songjian-sedona',version:1,exportedAt:new Date().toISOString(),records:state.records,draft},null,2)],{type:'application/json;charset=utf-8'});const link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download=`松间-释放记录-${new Intl.DateTimeFormat('sv-SE').format(new Date())}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('已导出记录和当前草稿');}
  async function importData(file){if(!file)return;if(file.size>15*1024*1024){toast('文件超过15MB，请选择松间导出的备份文件');$('#importFile').value='';return;}try{const data=JSON.parse(await file.text());if(data.app!=='songjian-sedona'||data.version!==1||!validDate(data.exportedAt)||!Array.isArray(data.records)||data.records.length>10000||!data.records.every(r=>validDraft(r)&&['completed','paused'].includes(r.status)&&(r.updatedAt===undefined||validDate(r.updatedAt)))||(data.draft&&!validDraft(data.draft)))throw Error('invalid');const ids=new Set(state.records.map(r=>r.id)),incoming=new Map(data.records.filter(r=>!ids.has(r.id)).map(r=>[r.id,r]));const backupDraft=data.draft;let recoverDraft=false;if(backupDraft&&!backupDraft.saved&&meaningful(backupDraft)&&!ids.has(backupDraft.id)&&backupDraft.id!==draft.id){incoming.set(backupDraft.id,{...clone(backupDraft),status:'paused',updatedAt:data.exportedAt});recoverDraft=true;}const additions=[...incoming.values()];if(!additions.length){toast('备份中的记录已存在，无需重复导入');return;}confirmDialog('导入这份备份？',`将新增 ${additions.length} 条记录${recoverDraft?'，其中包含备份中未完成的草稿':''}。当前草稿会保留，已有同编号记录不会覆盖。`,()=>{state.records=[...clone(additions),...state.records];persist(true);renderRecords();toast(`已导入 ${additions.length} 条记录`);},'导入');}catch(error){toast('备份格式不正确，未导入任何内容');}finally{$('#importFile').value='';}}
  function speechStatus(key,message){const el=$(`#voice-${key}`);if(el)el.textContent=message;}
  function stopVoice(graceful=true){clearTimeout(holdTimer);holdTimer=null;voiceDown=false;const active=voiceActive;if(!active)return;if(graceful){try{active.rec.stop();}catch{}clearTimeout(active.finishTimer);active.finishTimer=setTimeout(()=>{if(voiceActive===active){commitVoice(active);try{active.rec.abort();}catch{}finishVoice(active);}},3000);}else{commitVoice(active);try{active.rec.abort();}catch{}finishVoice(active);}}
  function finishVoice(active){clearTimeout(active.finishTimer);if(voiceActive!==active)return;const button=$(`[data-voice="${active.key}"]`);button?.classList.remove('recording');button?.removeAttribute('aria-pressed');if(button)$('span',button).textContent='按住说话';voiceActive=null;}
  function commitVoice(active){if(active.committed||!active.transcript.trim()||active.draftId!==draft.id)return;active.committed=true;const current=draft[active.key]||'',addition=active.transcript.trim(),separator=current&&!/[s，。！？、]$/.test(current)?'，':'';draft[active.key]=(current+separator+addition).slice(0,12000);const field=$(`#field-${active.key}`);if(field){field.value=draft[active.key];field.dispatchEvent(new Event('input',{bubbles:true}));}else touch();speechStatus(active.key,'已转文字，可以继续编辑');}
  function beginVoice(key,button){
    if(voiceActive){toast('上一段语音正在整理，请稍后再按住说话');return;}const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SpeechRecognition){speechStatus(key,'浏览器不支持语音，请直接输入');toast('当前浏览器不支持语音识别，可换 Chrome / Edge 或打字输入');return;}if(!window.isSecureContext){speechStatus(key,'网页长按语音需要 HTTPS，可使用手机键盘上的麦克风');toast('点输入框，使用手机键盘的语音输入；网页麦克风需要 HTTPS');return;}
    const rec=new SpeechRecognition(),active={key,rec,transcript:'',committed:false,error:false,draftId:draft.id};voiceActive=active;rec.lang='zh-CN';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=1;button.classList.add('recording');button.setAttribute('aria-pressed','true');$('span',button).textContent='松开结束';speechStatus(key,'正在连接语音识别…');
    rec.onstart=()=>{if(voiceActive!==active)return;speechStatus(key,'正在听，松开结束');if(!voiceDown)stopVoice(true);};
    rec.onresult=event=>{if(voiceActive!==active||draft.id!==active.draftId)return;let final='',interim='';for(let i=0;i<event.results.length;i++){if(event.results[i].isFinal)final+=event.results[i][0].transcript;else interim+=event.results[i][0].transcript;}active.transcript=final+interim;speechStatus(key,active.transcript?`听到：${active.transcript.slice(-38)}`:'正在听…');};
    rec.onerror=event=>{if(voiceActive!==active)return;active.error=true;const messages={'not-allowed':'麦克风或语音服务权限未获允许，请在地址栏设置后重试','service-not-allowed':'浏览器或组织策略不允许此语音服务，请直接输入','audio-capture':'没有找到可用麦克风，请检查设备','network':'语音识别服务连接失败，请检查网络或直接输入','no-speech':'没有听清，可以再按住说一次','language-not-supported':'当前语音服务不支持中文，请直接输入','aborted':'语音已停止'};commitVoice(active);speechStatus(key,messages[event.error]||'语音暂不可用，请直接输入');finishVoice(active);};
    rec.onend=()=>{if(voiceActive!==active)return;commitVoice(active);if(!active.transcript.trim()&&!active.error)speechStatus(key,'没有识别到文字，可以重试或直接输入');finishVoice(active);};try{rec.start();}catch(error){speechStatus(key,'语音启动失败，请重试或直接输入');finishVoice(active);}
  }
  function bindVoice(){$$('[data-voice]',$('#practiceCard')).forEach(button=>{const start=()=>{if(voiceActive)return;voiceDown=true;clearTimeout(holdTimer);holdTimer=setTimeout(()=>{holdTimer=null;if(voiceDown)beginVoice(button.dataset.voice,button);},240);};const end=()=>{if(holdTimer){clearTimeout(holdTimer);holdTimer=null;speechStatus(button.dataset.voice,'请按住说话，松开结束');}if(voiceDown){voiceDown=false;stopVoice(true);}};button.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();button.focus({preventScroll:true});button.setPointerCapture?.(e.pointerId);start();});button.addEventListener('pointerup',end);button.addEventListener('pointercancel',end);button.addEventListener('lostpointercapture',end);button.addEventListener('contextmenu',e=>e.preventDefault());button.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!e.repeat)start();}});button.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();end();}});button.addEventListener('blur',end);button.addEventListener('click',e=>e.preventDefault());});}
  $$('[data-view]').forEach(el=>el.addEventListener('click',()=>showView(el.dataset.view)));$$('[data-close]').forEach(el=>el.addEventListener('click',()=>$(`#${el.dataset.close}`).close()));
  $$('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}}));
  $('#confirmYes').addEventListener('click',()=>{const action=confirmAction;confirmAction=null;$('#confirmDialog').close();action?.();});$('#confirmDialog').addEventListener('close',()=>confirmAction=null);
  $('#motionPreference').checked=quietMotion;$('#motionPreference').addEventListener('change',()=>{quietMotion=$('#motionPreference').checked;syncMotionPreference();$('#quietMotion').checked=quietMotion;try{localStorage.setItem('songjian.motion',quietMotion?'quiet':'full');}catch{}});
  $('#finishReleaseVisual').addEventListener('click',finishReleaseVisual);$('#releaseVisual').addEventListener('cancel',event=>{event.preventDefault();finishReleaseVisual();});$('#releaseVisual').addEventListener('close',()=>{if(!$('#releaseVisual').open&&visualTimer!==null)finishReleaseVisual();});$('#quietMotion').addEventListener('change',()=>{quietMotion=$('#quietMotion').checked;syncMotionPreference();$('#motionPreference').checked=quietMotion;try{localStorage.setItem('songjian.motion',quietMotion?'quiet':'full');}catch{}if(quietMotion)finishReleaseVisual();});motionQuery.addEventListener?.('change',()=>{if(motionQuery.matches&&$('#releaseVisual').open)finishReleaseVisual();});
  $('#startTheme').addEventListener('click',startTheme);$('#viewThemeRecords').addEventListener('click',viewThemeRecords);
  bindPracticeToolButtons();$('#startPracticeTool').addEventListener('click',startPracticeTool);
  $('#newPractice').addEventListener('click',startNew);$('#stuckButton').addEventListener('click',openStuck);$('#continueStuck').addEventListener('click',()=>{logReminder();$('#stuckDialog').close();toast('不急，按自己的节奏继续。');});$('#pauseSession').addEventListener('click',()=>{logReminder();saveRecord('paused');$('#stuckDialog').close();recordWantFilter='all';$('#recordSearch').value='';showView('records');});
  $('#recordSearch').addEventListener('input',renderRecords);$('#exportButton').addEventListener('click',exportData);$('#importButton').addEventListener('click',()=>$('#importFile').click());$('#importFile').addEventListener('change',e=>importData(e.target.files[0]));
  let phoneViewportHeight=window.visualViewport?.height||window.innerHeight;function updatePhoneKeyboard(){const active=document.activeElement,typing=active?.matches('textarea,input[type=search],input:not([type])'),height=window.visualViewport?.height||window.innerHeight;if(!typing)phoneViewportHeight=Math.max(height,window.innerHeight);document.body.classList.toggle('keyboard-open',Boolean(typing&&window.matchMedia('(pointer:coarse)').matches&&phoneViewportHeight-height>120));}document.addEventListener('focusin',updatePhoneKeyboard);document.addEventListener('focusout',()=>setTimeout(updatePhoneKeyboard,0));window.visualViewport?.addEventListener('resize',updatePhoneKeyboard);window.addEventListener('resize',updatePhoneKeyboard);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopVoice(false);persist(true);}lastTick=Date.now();});window.addEventListener('pagehide',()=>{stopVoice(false);persist(true);});window.addEventListener('blur',()=>{if(voiceDown)stopVoice(true);});
  $('#today').textContent=new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date());setInterval(updateClock,1000);setInterval(()=>{if(!draft.saved&&currentView==='practice'&&!document.hidden)persist(true);},15000);renderPractice();persist(true);
})();
