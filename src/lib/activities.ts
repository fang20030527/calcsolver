export interface Activity { code: string; name: string; iframe: string; thumb: string; local?: boolean }

const hosts = new Set(['math.geet.in.net', 'st.8games.net', 'ixlad.com']);
const localPaths = new Set(['/games/2048/', '/games/snake/']);

export function isAllowedActivityUrl(value: string): boolean {
  if (localPaths.has(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && hosts.has(url.hostname) && !url.username && !url.password && (!url.port || url.port === '443');
  } catch { return false; }
}

export const localActivities: Activity[] = [
  { code: '3001', name: '2048 Classic', iframe: '/games/2048/', thumb: '/images/2048.svg', local: true },
  { code: '3002', name: 'Snake', iframe: '/games/snake/', thumb: '/images/snake.svg', local: true },
];

export function searchActivities(activities: Activity[], query: string): Activity[] {
  const search = query.trim().toLowerCase();
  return search ? activities.filter(activity => `${activity.name} ${activity.code}`.toLowerCase().includes(search)) : activities;
}
