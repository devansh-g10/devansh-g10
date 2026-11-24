import {ink, muted, cyan, violet, blue, mono, label, caption, path, dot, series, panel, save} from './svg.mjs';

const roles = [
  'Computer Science Engineering Student', 'AI & Machine Learning Enthusiast',
  'Data Science Developer', 'Java & Python Programmer',
  'DSA Problem Solver', 'Building Real-World Solutions'
];

function waveform(x, y, length, height, phase = 0) {
  const points = Array.from({length: 101}, (_, i) => {
    const a = i / 100;
    const v = Math.sin(2 * Math.PI * a + phase) * Math.sin(Math.PI * a);
    return (i ? 'L' : 'M') + (x + a * length).toFixed(1) + ' ' + (y + height * v).toFixed(1);
  });
  return points.join(' ');
}

function hero() {
  // Parametric torus projected into the scope at a fixed oblique angle.
  function ringPoint(u, v) {
    const r = 79 + 30 * Math.cos(v);
    const x = r * Math.cos(u), y = r * Math.sin(u), z = 30 * Math.sin(v);
    const tilted = y * .62 - z * .8;
    return [(694 + x * .88 + tilted * .48).toFixed(1), (171 - x * .48 + tilted * .88).toFixed(1)].join(' ');
  }
  const torus = series(34, i => {
    const coords = Array.from({length: 33}, (_, j) => ringPoint(i * Math.PI / 17, j * Math.PI / 16));
    return path('M' + coords.join(' L') + 'Z', i < 17 ? cyan : violet, 1.2, 'opacity=".77"');
  }) + series(12, j => {
    const coords = Array.from({length: 69}, (_, i) => ringPoint(i * Math.PI / 34, j * Math.PI / 6));
    return path('M' + coords.join(' L') + 'Z', blue, .8, 'opacity=".65"');
  });
  const defs = `<radialGradient id="aura"><stop stop-color="#305f89" stop-opacity=".7"/><stop offset="1" stop-color="#141e38" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="#456385" stroke-width=".7"/></pattern>
    <linearGradient id="name" x1="0%" x2="100%" spreadMethod="reflect"><stop stop-color="#f3f9ff"/><stop offset=".35" stop-color="#89f4e7"/><stop offset=".75" stop-color="#8fbaff"/><stop offset="1" stop-color="#d0afff"/></linearGradient>
    <clipPath id="edge"><rect x="1" y="1" width="898" height="338" rx="18"/></clipPath>`;
  const css = `
    .role {opacity:0}.first {opacity:1}
    @keyframes role {0%,15% {opacity:1} 16.666%,100% {opacity:0}}
    @keyframes type {0% {clip-path:inset(0 100% 0 0)} 7%,100% {clip-path:inset(0 0 0 0)}}
    @keyframes orbit {to {transform:rotate(360deg)}}
    @keyframes drift {to {transform:translate(22px,22px)}}
    @keyframes tint {50% {filter:hue-rotate(32deg)}}
    @media (prefers-reduced-motion:no-preference) {
      .role {animation:role 30s linear infinite,type 30s steps(var(--steps)) infinite;animation-delay:var(--delay);clip-path:inset(0)}
      .orbit {transform-origin:694px 171px;animation:orbit 100s linear infinite}
      .grid {animation:drift 16s linear infinite}
      .name {animation:tint 7s ease-in-out infinite}
    }`;
  const scope = `<circle cx="694" cy="171" r="183" fill="url(#aura)"/>
    <circle cx="694" cy="171" r="129" fill="none" stroke="#446480" stroke-dasharray="2 6"/>
    <g class="orbit">${series(72, i => path('M694 44v' + (i % 6 ? 4 : 10), i%6 ? '#405571' : cyan, 1, `transform="rotate(${i*5} 694 171)"`))}
    ${dot(694,43,3.2,cyan)}${dot(694,299,2.5,violet)}</g><g class="float">${torus}</g>`;
  const stars = series(46, i => dot(450+(i*97)%445,18+(i*67)%296,i%7 ? 1 : 2,i%2 ? cyan : violet,`opacity=".5" ${i%7 ? '' : 'class="pulse"'}`));
  const type = roles.map((role,i) => label(63,258,role,19,ink,
    `font-family="${mono}" class="role ${i ? '' : 'first'}" style="--delay:${i*5}s;--steps:${role.length};transform-box:fill-box"`)).join('');
  save('banners/hero.svg',900,340,'Devansh Maheshwari',roles.join(' · '),
    panel(900,340) + `<g clip-path="url(#edge)"><rect class="grid" x="486" y="-30" width="440" height="380" fill="url(#grid)" opacity=".35"/>
    ${stars}${scope}${path('M32 44h9l5 -8 7 16 5 -8h12',cyan,2.2)}
    ${caption(83,48,'DEVANSH-G10  /  ENGINEERING PORTFOLIO',muted,12)}
    ${label(32,136,'Devansh',74,ink,'font-weight="700" letter-spacing="-3"')}
    ${label(32,210,'Maheshwari',74,'url(#name)','class="name" font-weight="700" letter-spacing="-3"')}
    ${label(35,258,'›',24,cyan)}${type}
    ${path('M32 286H868','#334560')}${caption(33,315,'B.TECH CSE   /   GLA UNIVERSITY',muted,12)}
    ${caption(714,315,'MATHURA, INDIA',muted,12)}</g>`,css,defs);
  const mobileRoles = roles.map((role,i) => label(23,232,role,15,ink,
    `font-family="${mono}" class="role ${i ? '' : 'first'}" style="--delay:${i*5}s;--steps:${role.length};transform-box:fill-box"`)).join('');
  save('banners/hero-mobile.svg',390,282,'Devansh Maheshwari',roles.join(' · '),
    panel(390,282)+caption(23,32,'DEVANSH-G10',cyan)
    +`<g transform="translate(-17 -4) scale(.47)">${scope}</g>`
    +label(22,130,'Devansh',48,ink,'font-weight="700" letter-spacing="-2"')
    +label(22,182,'Maheshwari',48,'url(#name)','class="name" font-weight="700" letter-spacing="-2"')
    +path('M24 202H365','#38536b')+mobileRoles+caption(24,260,'B.TECH CSE  /  GLA UNIVERSITY',muted,10),css,defs);
}

function terminal() {
  const rows = [
    ['study', 'B.Tech in Computer Science · GLA University'],
    ['interests', 'Computer vision, NLP and algorithms'],
    ['learning', 'Model training and system design'],
    ['goal', 'Deploy reliable ML-backed services']
  ];
  const lines = rows.map(([key,value],i) => caption(28,111+i*33,key,cyan,14)
    + label(168,111+i*33,value,18,ink)).join('');
  const cmd = label(50,68,'cat devansh.profile',16,ink,`font-family="${mono}" class="cmd"`);
  const rain = series(7,i => `<g class="rain" opacity=".24" style="animation-delay:-${i}s">`
    +series(4,j=>label(618+i*13,83+(i*23)%68+j*11,(i*j+j)%3 ? '1' : '0',10,j===3 ? cyan : blue))+ '</g>');
  const terminalCSS = `@keyframes command {from {clip-path:inset(0 100% 0 0)} to {clip-path:inset(0)}}
    @keyframes rain {50% {transform:translateY(18px);opacity:.05}}
    @media (prefers-reduced-motion:no-preference) {.cmd {transform-box:fill-box;animation:command 1.6s steps(19) both}.cursor {animation:pulse 1.2s steps(2) infinite}.rain {animation:rain 5s ease-in-out infinite}}`;
  save('animations/terminal.svg',740,241,'Developer terminal',rows.map(r=>r.join(' — ')).join('. '),
    panel(740,241)+caption(27,28,'DEVANSH@GLA',muted)+caption(600,28,'PROFILE.SH',muted)
    +path('M1 41H739','#30415c')+label(28,68,'$',16,cyan)+cmd+lines+rain
    +`<rect class="cursor" x="28" y="217" width="9" height="3" fill="${cyan}"/>`,
    terminalCSS);
  const compactRows=rows.map(([key,value],i)=>caption(23,91+i*47,key,cyan,11)
    +label(23,112+i*47,value,15)).join('');
  save('animations/terminal-mobile.svg',390,278,'Developer terminal',rows.map(r=>r.join(' — ')).join('. '),
    panel(390,278)+caption(23,25,'DEVANSH@GLA',muted)+path('M1 39H389','#30415c')
    +label(23,63,'$ cat devansh.profile',15,ink,`class="cmd" font-family="${mono}"`)+compactRows
    +`<rect class="cursor" x="23" y="262" width="9" height="3" fill="${cyan}"/>`,terminalCSS);
}

const glyphs = {
  code:'M12 2c5 3-4 5 0 9m4-7c4 2-3 4-1 6M4 13q8 4 17 0l-2 7q-7 4-13 0zM21 14q8-1 3 4l-4 1M2 24q10 4 23 0',
  network:'M15 2 6 11a10 10 0 1 0 16-1m-2-5h.1',
  chart:'M4 11v10m6-17v6m0 4v10m6-19v12m0 4v4m6-17v11',
  server:'M13 2a12 12 0 1 0 1 0zM16 5 7 16h6l-2 7 10-13h-7z',
  database:'M3 6c0-5 22-5 22 0s-22 5-22 0v14c0 6 22 6 22 0V6M3 13c0 5 22 5 22 0',
  cloud:'M14 3 27 24H1z',
  git:'M6 7v13m0-4c10 0 15-2 15-8M6 3a2 2 0 1 0 .1 0zM6 20a2 2 0 1 0 .1 0zM21 4a2 2 0 1 0 .1 0z'
};
const skills = [
  ['languages','Programming languages','Java · Python · TypeScript · JavaScript','code'],
  ['ml','AI & machine learning','PyTorch · OpenCV · scikit-learn','network'],
  ['data','Data science','pandas · NumPy · Jupyter','chart'],
  ['frontend','Frontend development','React · Vite · Tailwind CSS','web'],
  ['backend','Backend development','FastAPI · Flask · Express','server'],
  ['databases','Databases','DuckDB · MySQL · MongoDB','database'],
  ['cloud','Cloud computing','Vercel deployments · GitHub Pages','cloud'],
  ['tools','Developer tools','Git · GitHub Actions · Google Colab','git']
];
function skillCards() {
  for (const [id,title,stack,icon] of skills) {
    const mark=icon==='web' ? series(3,i=>`<ellipse cx="14" cy="14" rx="13" ry="5" fill="none" stroke="${cyan}" stroke-width="1.6" transform="rotate(${i*60} 14 14)"/>`)+dot(14,14,2,cyan) : path(glyphs[icon],cyan,1.7);
    const art = `<g transform="translate(19 24)"><rect width="43" height="43" rx="11" fill="#172f45" stroke="#34536a"/>
      <g transform="translate(8 8)"><g class="float">${mark}</g></g></g>`;
    save('icons/'+id+'.svg',395,94,title,stack,panel(395,94)+art
      +label(78,40,title,20,ink,'font-weight="650"')+label(78,66,stack,15,muted)
      +path('M17 92h361','url(#spectrum)',1.4,'class="flow" stroke-dasharray="68 12" opacity=".65"'));
  }
}

function projectArt(kind, accent) {
  const stroke = d => path(d,accent,1.8);
  if (kind==='transit') {
    const route='M8 97l26-26h26l25-31h28l23-22';
    return path('M8 36l34 24 23 39h27l40 23M14 112l35-29 34-3 42-25','#476177',2)
      +path(route,accent,3)+path(route,'#fff',2,'class="flow" stroke-dasharray="5 75"')
      +[[8,97],[34,71],[60,71],[85,40],[113,40],[136,18]].map(([x,y])=>dot(x,y,4,ink,`stroke="${accent}" stroke-width="2"`)).join('');
  }
  if (kind==='attendance') return stroke('M24 39V21h20m55 0h20v18m0 49v18H99m-55 0H24V88')
    +`<ellipse cx="72" cy="53" rx="15" ry="20" fill="none" stroke="${accent}" stroke-width="1.8"/>`
    +stroke('M41 97q5-36 31-19 26-17 31 19')+path('M17 67H127',cyan,2,'class="scan"');
  if (kind==='document') return stroke('M42 14h43l20 20v72H42zM85 14v22h20M52 45h39m-39 9h28m-27 34 9-10 6 8 12-13')
    +`<circle cx="92" cy="78" r="16" fill="#122238" stroke="${accent}" stroke-width="2"/>`
    +stroke('m104 91 17 17M85 81l5-9 4 6 5-3');
  return stroke('M22 27h98v74H22zM22 41h98M30 34h2m4 0h2M52 58l-9 9 9 9m36-18 9 9-9 9m-12-24-11 29')
    +path('M35 91h29',cyan,2,'class="pulse"');
}

const projects = [
  ['crowdsense','CrowdSense','TRANSIT ANALYTICS','Compare Delhi bus routes using ticket records,','timetables and predicted crowding.','Python · DuckDB · FastAPI · React','transit',cyan],
  ['attendance','Smart Attendance','COMPUTER VISION','Recognize faces, record class attendance','and export reports by student or date.','Python · OpenCV · Flask · MySQL','attendance',violet],
  ['forensight','ForenSight-AI','DOCUMENT FORENSICS','Inspect IDs and documents for signs of forgery','with OCR and image analysis.','Python · PyTorch · OpenCV · FastAPI','document',blue],
  ['code-quest','Code Quest','DEVELOPER TOOLS','A full-stack coding challenge platform for','practising programming problems.','React · Vite · Express · MongoDB','code',cyan]
];
function projectCards() {
  for (const [id,title,topic,line1,line2,stack,kind,accent] of projects) {
    const defs='<pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".9" fill="#45627a"/></pattern>';
    const art=`<g transform="translate(17 15)"><rect width="144" height="122" rx="9" fill="#122339"/>
      <rect width="144" height="122" rx="9" fill="url(#dots)"/>${projectArt(kind,accent)}</g>`;
    save('projects/'+id+'.svg',668,152,title,line1+' '+line2+' '+stack,panel(668,152)+art
      +caption(181,29,topic,accent,11)+label(180,62,title,32,ink,'font-weight="650"')
      +label(181,88,line1,16)+label(181,108,line2,16)+label(181,135,stack,14,muted)
      +path('M626 35l14-14m-11 0h11v11',accent,1.6),
      '@keyframes scanline {50% {transform:translateY(18px)}} @media (prefers-reduced-motion:no-preference){.scan {animation:scanline 4s ease-in-out infinite}}',defs);
    save('projects/'+id+'-mobile.svg',390,201,title,line1+' '+line2+' '+stack,
      panel(390,201)+`<g transform="translate(287 9) scale(.54)"><g class="float">${projectArt(kind,accent)}</g></g>`
      +caption(22,33,topic,accent,11)+label(21,76,title,31,ink,'font-weight="650"')
      +label(22,111,line1,15)+label(22,134,line2,15)+path('M22 152H366','#354761')
      +label(22,180,stack,15,muted)+path('M350 179l12-12m-9 0h9v9',accent,1.6));
  }
}

function trim() {
  const traces=series(9,i=>path(waveform(1,44+i*2,898,26+i*2,i*.14),'url(#spectrum)',1,`opacity="${.22+i*.06}"`));
  save('animations/footer.svg',900,100,'Devansh Maheshwari','Flowing signal waves',panel(900,100)+traces
    +caption(27,27,'DEVANSH MAHESHWARI',ink,11)+path(waveform(1,51,898,36,1),cyan,1.5,'class="flow" stroke-dasharray="18 62"'));
  const nodes=[[310,12],[355,5],[397,16],[444,7],[485,17],[539,9],[581,14]];
  save('animations/divider.svg',900,22,'Section divider','',
    path('M0 12H310L355 5 397 16 444 7 485 17 539 9 581 14H900','#527694')
    +path('M310 12l87 4 88 1 96-3M355 5l89 2 95 2','url(#spectrum)',1,'class="flow" stroke-dasharray="50 30"')
    +nodes.map(([x,y])=>dot(x,y,2.5,cyan,'class="pulse"')).join(''));
  const contacts=[
    ['github','GitHub','M4 5v15m0-6c10 0 13-4 13-11',cyan],
    ['linkedin','LinkedIn','M3 10v10m0-16v1m6 15V10m0 5c0-7 10-7 10 0v5',blue],
    ['leetcode','LeetCode','M13 2 4 11q-2 2 0 4l5 5q3 2 6 0m-6-7h12',violet],
    ['email','Email','M2 5h20v14H2zM2 5l10 8L22 5',cyan]
  ];
  for(const [id,title,glyph,color] of contacts) {
    save('icons/contact-'+id+'.svg',150,48,title,title,panel(150,48)
      +`<g transform="translate(14 12)">${path(glyph,color,1.8)}</g>`
      +label(48,30,title,17,ink)+dot(136,13,2,color,'class="pulse"'));
  }
}
hero();
terminal();
skillCards();
projectCards();
trim();
