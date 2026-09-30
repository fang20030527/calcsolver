import catalog from '../data/activities.json';
import { localActivities, isAllowedActivityUrl, searchActivities } from '../lib/activities';
import type { Activity } from '../lib/activities';

const dialog = document.querySelector<HTMLDialogElement>('#activities');
if (dialog) {
  const all: Activity[] = [...localActivities, ...catalog].filter(item => isAllowedActivityUrl(item.iframe));
  const search = dialog.querySelector<HTMLInputElement>('#activity-search')!;
  const source = dialog.querySelector<HTMLSelectElement>('#activity-source')!;
  const grid = dialog.querySelector<HTMLElement>('#activity-grid')!;
  const empty = dialog.querySelector<HTMLElement>('#activity-empty')!;
  const browser = dialog.querySelector<HTMLElement>('#activity-browser')!;
  const player = dialog.querySelector<HTMLElement>('#activity-player')!;
  const frame = dialog.querySelector<HTMLIFrameElement>('#game-frame')!;
  const loadStatus = dialog.querySelector<HTMLElement>('#game-load-status')!;
  const title = dialog.querySelector<HTMLElement>('#player-title')!;
  const back = dialog.querySelector<HTMLButtonElement>('#back-to-activities')!;
  const searchWrap = dialog.querySelector<HTMLElement>('#activity-search-wrap')!;
  const openLink = dialog.querySelector<HTMLAnchorElement>('#open-game-link')!;
  const recommendations = dialog.querySelector<HTMLElement>('#player-recommendations')!;
  let active: Activity | null = null;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  function thumbnail(activity: Activity) {
    const image = document.createElement('img');
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 180;
    image.height = 180;
    image.src = activity.thumb;
    image.addEventListener('error', () => {
      image.hidden = true;
      image.closest('button')?.classList.add('thumb-missing');
    }, { once: true });
    return image;
  }

  function card(activity: Activity, small = false) {
    const button = document.createElement('button');
    button.className = small ? 'recommendation-card' : 'activity-card';
    button.setAttribute('aria-label', `${activity.name}, code ${activity.code}`);
    const picture = document.createElement('span');
    picture.className = 'activity-picture';
    const fallback = document.createElement('span');
    fallback.className = 'thumbnail-fallback';
    fallback.setAttribute('aria-hidden', 'true');
    fallback.textContent = activity.name.slice(0, 2).toUpperCase();
    picture.append(fallback, thumbnail(activity));
    const name = document.createElement('span');
    name.className = 'activity-name';
    name.textContent = activity.name;
    button.append(picture, name);
    if (!small) {
      const code = document.createElement('span');
      code.className = 'activity-code';
      code.textContent = activity.code;
      button.append(code);
      if (activity.local) {
        const badge = document.createElement('span');
        badge.className = 'local-badge';
        badge.textContent = 'LOCAL';
        button.append(badge);
      }
    }
    button.addEventListener('click', () => play(activity));
    return button;
  }

  function render() {
    const items = source.value === 'local' ? localActivities : all;
    const filtered = searchActivities(items, search.value);
    grid.replaceChildren(...filtered.map(item => card(item)));
    empty.hidden = filtered.length !== 0;
    grid.hidden = filtered.length === 0;
    dialog!.querySelector('#activity-count')!.textContent = search.value.trim() ? `${filtered.length} of ${items.length} Activities` : `${items.length} Activities Available`;
  }

  function showGrid() {
    clearTimeout(timeout);
    active = null;
    frame.removeAttribute('src');
    player.hidden = true;
    browser.hidden = false;
    title.hidden = true;
    back.hidden = true;
    searchWrap.hidden = false;
    render();
    search.focus({ preventScroll: true });
  }

  function play(activity: Activity) {
    if (!isAllowedActivityUrl(activity.iframe)) return;
    clearTimeout(timeout);
    active = activity;
    browser.hidden = true;
    player.hidden = false;
    title.hidden = false;
    title.textContent = activity.name;
    back.hidden = false;
    searchWrap.hidden = true;
    frame.title = activity.name;
    frame.setAttribute('sandbox', `allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-popups${activity.local ? ' allow-top-navigation-by-user-activation' : ''}`);
    openLink.href = activity.iframe;
    dialog!.querySelector('#player-provider')!.textContent = activity.local ? 'On CalcSolver.info · Local game' : 'External activity';
    loadStatus.hidden = false;
    loadStatus.querySelector('h3')!.textContent = `Loading ${activity.name}…`;
    loadStatus.querySelector('p')!.textContent = activity.local ? 'Getting your game ready.' : 'Connecting to the activity provider.';
    dialog!.querySelector<HTMLButtonElement>('#dismiss-game-status')!.hidden = true;
    frame.src = activity.iframe;
    recommendations.replaceChildren(...all.filter(item=>item.code!==activity.code).slice(0,8).map(item=>card(item,true)));
    timeout = setTimeout(() => {
      if (!active || active.code !== activity.code || loadStatus.hidden) return;
      loadStatus.querySelector('h3')!.textContent = 'Taking a little longer…';
      loadStatus.querySelector('p')!.textContent = 'Try reloading or opening this activity in a new tab.';
      dialog!.querySelector<HTMLButtonElement>('#dismiss-game-status')!.hidden = false;
    }, 12000);
    back.focus({ preventScroll: true });
  }

  frame.addEventListener('load', () => {
    if (!active || !frame.hasAttribute('src')) return;
    clearTimeout(timeout);
    loadStatus.hidden = true;
  });

  function open(code: string) {
    const activity = all.find(item => item.code === code);
    if (code !== '0000' && !activity) {
      document.dispatchEvent(new CustomEvent('calcsolver:invalid-code'));
      return;
    }
    if (!dialog!.open) dialog!.showModal();
    document.documentElement.classList.add('vault-open');
    if (code === '0000') { source.value = 'all'; search.value = ''; showGrid(); }
    else if (activity) play(activity);
  }

  function release() {
    clearTimeout(timeout);
    frame.removeAttribute('src');
    active = null;
    document.documentElement.classList.remove('vault-open');
    document.dispatchEvent(new CustomEvent('calcsolver:closed'));
  }

  dialog.querySelector('#exit-activities')?.addEventListener('click', () => dialog!.close());
  dialog.addEventListener('close', release);
  back.addEventListener('click', showGrid);
  search.addEventListener('input', render);
  source.addEventListener('change', render);
  dialog.querySelector('#clear-search')?.addEventListener('click', () => { search.value = ''; render(); search.focus(); });
  dialog.querySelector('#retry-game')?.addEventListener('click', () => { if (active) play(active); });
  dialog.querySelector('#dismiss-game-status')?.addEventListener('click', () => { loadStatus.hidden = true; });
  dialog.querySelector('#fullscreen-game')?.addEventListener('click', async () => {
    try { await dialog!.querySelector<HTMLElement>('#game-frame-wrap')!.requestFullscreen(); }
    catch { const button = dialog!.querySelector<HTMLButtonElement>('#fullscreen-game')!; button.textContent = 'Open ↗'; openLink.focus(); }
  });
  document.addEventListener('calcsolver:open', event => open((event as CustomEvent<{code:string}>).detail.code));
}
