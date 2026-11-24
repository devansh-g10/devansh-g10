import { pathToFileURL } from 'node:url';
import { label, caption, panel, path, dot, save, ink, muted, cyan, blue, violet, escape } from './svg.mjs';
import { today, repositoryStats, contributionDays } from './github.mjs';

const palette=['#1b3043','#245968','#348d94','#52bfb4',cyan];
const level=n=>n===0 ? 0 : n<3 ? 1 : n<6 ? 2 : n<10 ? 3 : 4;
const pretty=n=>n.toLocaleString('en-US');

function metric(x,y,value,title) {
  return label(x,y,pretty(value),39,ink,'font-weight="650" letter-spacing="-1"')
    +label(x,y+23,title,16,muted);
}

export function renderStats({count,originals,stars,languages},date=today) {
  const colors=[cyan,blue,violet,'#f0be86','#db9ac4','#65819a'];
  const series=languages.slice(0,5);
  const other=languages.slice(5).reduce((sum,row)=>sum+row[1],0);
  if(other) series.push(['Other',other]);
  const total=series.reduce((sum,row)=>sum+row[1],0);
  let x=26;
  const segments=series.map(([name,bytes],i)=>{
    const width=676*bytes/total;
    const rect=`<rect x="${x.toFixed(2)}" y="181" width="${width.toFixed(2)}" height="10" fill="${colors[i]}"><title>${escape(name)}: ${pretty(bytes)} bytes</title></rect>`;
    x+=width;
    return rect;
  }).join('');
  const legend=series.map(([name,bytes],i)=>{
    const x=28+(i%3)*227, y=221+Math.floor(i/3)*27;
    return dot(x,y-5,4,colors[i])+label(x+11,y,`${name}  ${(100*bytes/total).toFixed(1)}%`,15);
  }).join('');
  const summary=`${count} public repositories, ${originals} non-forks and ${stars} stars across non-forks. `+series.map(([name,b])=>`${name}: ${pretty(b)} bytes`).join(', ');
  save('stats/repositories.svg',730,272,'Public repositories',summary,
    panel(730,272)+caption(26,30,'REPOSITORY ACTIVITY',cyan)+caption(521,30,date+' UTC')
    +metric(26,86,count,'Public repositories')+metric(268,86,originals,'Non-fork repositories')
    +metric(506,86,stars,'Stars on non-forks')+path('M26 130H703','#354761')
    +label(26,166,'Language share by bytes',19,ink,'font-weight="600"')
    +label(520,166,'Public non-fork repos',14,muted)
    +segments+(total ? legend : label(26,220,'No language bytes reported.',16,muted)));
  const mobileLegend=series.map(([name,bytes],i)=>{
    const y=224+i*25;
    return dot(24,y-5,4,colors[i])+label(37,y,name,16)+label(358,y,(100*bytes/total).toFixed(1)+'%',16,ink,'text-anchor="end"');
  }).join('');
  save('stats/repositories-mobile.svg',390,Math.max(255,232+series.length*25),'Public repositories',summary,
    panel(390,Math.max(255,232+series.length*25))+caption(22,29,'REPOSITORIES',cyan)+caption(238,29,date+' UTC',muted,10)
    +metric(22,91,count,'Public repos')+metric(151,91,originals,'Non-forks')+metric(274,91,stars,'Stars¹')
    +label(22,143,'¹ Stars on public non-fork repositories',14,muted)+path('M22 159H368','#354761')
    +label(22,191,'Language share by bytes',19,ink,'font-weight="600"')+(total ? mobileLegend : label(22,227,'No language bytes reported.',15,muted)));
}

function streaks(days) {
  let run=0, longest=0;
  for (const d of days) {
    run=d.count ? run+1 : 0;
    longest=Math.max(longest,run);
  }
  let end=days.length-1;
  if (!days[end].count) end--; // The current UTC day is still open.
  let current=0;
  while (end>=0 && days[end--].count) current++;
  return {current,longest};
}

function snakeGrid(days) {
  const offset=new Date(days[0].date).getUTCDay();
  const cells=days.map((day,i)=>{
    const index=i+offset;
    return {...day,x:39+Math.floor(index/7)*12.4,y:158+(index%7)*12.4};
  });
  const grid=cells.map(({x,y,date,count})=>`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="10" height="10" rx="2" fill="${palette[level(count)]}"><title>${date} · ${count}</title></rect>`).join('');
  // Visit active days in time order, only turning at right angles. Retrace
  // the path on the return trip so the looping snake never jumps a whole year.
  const active=cells.filter(d=>d.count);
  if (!active.length) return {grid,css:''};
  const points=[];
  for(const d of active) {
    const x=(d.x+5).toFixed(1), y=(d.y+5).toFixed(1);
    if(points.length) points.push([x,points.at(-1)[1]]);
    points.push([x,y]);
  }
  const route='M'+[...points,...points.slice(0,-1).reverse()].map(p=>p.join(' ')).join(' L');
  const body=Array.from({length:6},(_,i)=>`<circle class="snake" cx="0" cy="0" r="${2.3+i*.28}" fill="${i===5 ? '#fff2bf' : violet}" style="animation-delay:-${(i*.14).toFixed(2)}s"/>`).join('');
  const duration=Math.max(28,active.length*.6);
  const css=`.snake {display:none}
    @keyframes glide {from {offset-distance:0%} to {offset-distance:100%}}
    @supports (offset-path:path('M0 0L1 1')) {
      @media (prefers-reduced-motion:no-preference) {
        .snake {display:block;offset-path:path('${route}');animation:glide ${duration}s linear infinite}
      }
    }`;
  return {grid:grid+body,css};
}

function terrain(days) {
  const recent=days.slice(-84), peak=Math.max(1,...recent.map(d=>d.count));
  const points=[];
  for (const [i,day] of recent.entries()) {
    const x=208+Math.floor(i/7)*20-i%7*18;
    const y=89+Math.floor(i/7)*5.8+i%7*6.6;
    const height=day.count*44/peak;
    points.push({x,y,height,...day});
  }
  const surfaces=points.sort((a,b)=>a.y-b.y).map(({x,y,height,date,count})=>{
    const top=(y-height).toFixed(1);
    return `<g><title>${date} · ${count}</title>
      <path d="M${x-16} ${top}l16 5v${height.toFixed(1)}l-16-5z" fill="#2b596e"/>
      <path d="M${x} ${Number(top)+5}l16-5v${height.toFixed(1)}l-16 5z" fill="#1b3b51"/>
      <path d="M${x} ${top-5}l16 5-16 5-16-5z" fill="${palette[level(count)]}"/></g>`;
  }).join('');
  save('stats/terrain.svg',730,218,'Contribution terrain',
    `Daily contribution counts from ${recent[0].date} through ${recent.at(-1).date}. Column height is proportional to daily contributions.`,
    panel(730,218)+caption(26,29,'CONTRIBUTION TERRAIN',violet)
    +surfaces+label(480,86,'Last 84 days',27,ink,'font-weight="600"')
    +label(481,115,'Each tile is one day.',16,muted)
    +label(481,142,'Taller columns mark',16,muted)+label(481,163,'more contributions.',16,muted)
    +caption(26,198,recent[0].date+'  —  '+recent.at(-1).date,muted,11));
}

export function renderCalendar(days) {
  const {current,longest}=streaks(days);
  const total=days.reduce((sum,d)=>sum+d.count,0);
  const {grid,css}=snakeGrid(days);
  const legend=palette.map((color,i)=>`<rect x="${531+i*34}" y="271" width="10" height="10" rx="2" fill="${color}"/>`
    +label(531+i*34,298,['0','1–2','3–5','6–9','10+'][i],11,muted)).join('');
  save('stats/contributions.svg',730,312,'Contribution calendar and snake',
    `${total} contributions in 365 days ending ${days.at(-1).date}. Current streak ${current} days. Longest streak in window ${longest} days.`,
    panel(730,312)+caption(26,31,'CONTRIBUTION CALENDAR',cyan)+caption(520,31,days.at(-1).date+' UTC')
    +metric(26,89,total,'Contributions · 365 days')+metric(294,89,current,'Current streak · days')
    +metric(526,89,longest,'Best in window · days')+path('M26 133H703','#354761')+grid
    +label(39,279,days[0].date+'  —  '+days.at(-1).date,15,muted)+legend,css);
  save('stats/contributions-mobile.svg',390,255,'Contribution calendar and snake',
    'One year of contributions with current and best streaks in days.',
    panel(390,255)+caption(22,29,'CONTRIBUTIONS',cyan)+caption(238,29,days.at(-1).date+' UTC',muted,10)
    +metric(22,88,total,'In 365 days')+metric(151,88,current,'Streak · days')+metric(277,88,longest,'Best · days')
    +`<g transform="translate(0 58) scale(.56)">${grid}</g>`
    +label(22,224,days[0].date+'  —  '+days.at(-1).date,15,muted),css);
  terrain(days);
}

if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  const mode=process.argv[2];
  if (mode==='stats') renderStats(await repositoryStats());
  else if (mode==='contributions') renderCalendar(await contributionDays());
  else throw Error('Use node scripts/analytics.mjs stats or contributions');
}
