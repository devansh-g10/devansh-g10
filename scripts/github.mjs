// Actions reads the GraphQL calendar. Without a token, read the same daily
// counts from the tooltips GitHub serves on its public contribution calendar.
const token = process.env.GITHUB_TOKEN;
export const owner = process.env.GITHUB_REPOSITORY_OWNER || 'devansh-g10';
const base = 'https://api.github.com';
const dayMs = 86_400_000;
const isoDay = time => new Date(time).toISOString().slice(0,10);
export const today = isoDay(Date.now());
const firstDay = isoDay(Date.parse(today) - 364 * dayMs);

async function request(url, options = {}) {
  const headers = {'User-Agent':'github-profile-artwork', ...options.headers};
  if (token && new URL(url).origin === base) headers.Authorization = 'Bearer ' + token;
  const response = await fetch(url, {...options,headers,signal:AbortSignal.timeout(30000)});
  if (!response.ok) throw Error('GitHub returned ' + response.status + ' for ' + new URL(url).pathname);
  return response;
}
async function api(endpoint) {
  return (await request(base+endpoint)).json();
}

export async function repositoryStats() {
  const repos = [];
  for (let page=1; ; page++) {
    const batch = await api(`/users/${encodeURIComponent(owner)}/repos?type=owner&per_page=100&page=${page}`);
    repos.push(...batch.filter(repo=>!repo.private));
    if (batch.length < 100) break;
  }
  const langs = new Map();
  const originals = repos.filter(repo=>!repo.fork);
  for (const repo of originals) {
    const languages = await api(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo.name)}/languages`);
    for (const [name, bytes] of Object.entries(languages)) {
      if (!Number.isSafeInteger(bytes) || bytes < 0) throw Error('Invalid language byte count');
      langs.set(name,(langs.get(name)||0) + bytes);
    }
  }
  return {
    count:repos.length, originals:originals.length,
    stars:originals.reduce((sum,r)=>sum+r.stargazers_count,0),
    languages:[...langs].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0]))
  };
}

async function graphCalendar() {
  const query = `query($login:String!, $from:DateTime!, $to:DateTime!){
    user(login:$login){contributionsCollection(from:$from,to:$to){
      contributionCalendar{weeks{contributionDays{date contributionCount}}}
    }}
  }`;
  const variables={login:owner,from:firstDay+'T00:00:00Z',to:new Date().toISOString()};
  const response=await request(base+'/graphql',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,variables})});
  const result=await response.json();
  if(result.errors || !result.data?.user) throw Error('Unable to read GitHub contribution calendar');
  return result.data.user.contributionsCollection.contributionCalendar.weeks.flatMap(w=>w.contributionDays);
}

async function publicCalendar() {
  const days = [];
  const years = new Set([firstDay.slice(0,4), today.slice(0,4)]);
  for (const year of years) {
    const html = await (await request(`https://github.com/users/${encodeURIComponent(owner)}/contributions?from=${year}-01-01&to=${year}-12-31`,{headers:{'Accept-Language':'en-US'}})).text();
    const dates = new Map();
    for (const tag of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
      const date = tag[0].match(/\bdata-date="([^"]+)"/)[1];
      const id = tag[0].match(/\bid="([^"]+)"/)?.[1];
      if (id) dates.set(id,date);
    }
    for (const tip of html.matchAll(/<tool-tip\b([^>]*)>\s*(No|[\d,]+) contributions?\b/gi)) {
      const date = dates.get(tip[1].match(/\bfor="([^"]+)"/)?.[1]);
      if (date) days.push({date,contributionCount:tip[2].toLowerCase()==='no' ? 0 : Number(tip[2].replaceAll(',',''))});
    }
  }
  return days;
}

export async function contributionDays() {
  const input = token ? await graphCalendar() : await publicCalendar();
  const counts = new Map(input.map(d=>[d.date,d.contributionCount]));
  return Array.from({length:365},(_,i)=>{
    const date=isoDay(Date.parse(firstDay)+i*dayMs);
    const count=counts.get(date);
    if (!Number.isSafeInteger(count) || count<0) throw Error('Missing or invalid calendar day: '+date);
    return {date,count};
  });
}
