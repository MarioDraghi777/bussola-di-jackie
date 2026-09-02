import { route, navigate, type PageName } from '../../router';

const TABS: Array<{ page: PageName; label: string; icon: string }> = [
  { page: 'lista', label: 'Lista', icon: '📋' },
  { page: 'mappa', label: 'Mappa', icon: '🗺️' },
  { page: 'vicino', label: 'Vicino', icon: '📍' },
  { page: 'aggiungi', label: 'Aggiungi', icon: '➕' },
  { page: 'impostazioni', label: 'Impostazioni', icon: '⚙️' },
];

export function TabBar() {
  const current = route.value.page;
  return (
    <nav class="tabbar">
      {TABS.map((tab) => (
        <button
          key={tab.page}
          class={`tabbar-btn ${current === tab.page ? 'active' : ''}`}
          onClick={() => navigate(tab.page)}
          aria-current={current === tab.page ? 'page' : undefined}
        >
          <span class="tabbar-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span class="tabbar-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
