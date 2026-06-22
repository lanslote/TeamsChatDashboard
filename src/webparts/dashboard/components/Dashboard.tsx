import * as React from 'react';
import styles from './Dashboard.module.scss';
import type { IDashboardProps } from './IDashboardProps';
import { Sidebar } from './Sidebar';
import { ChatCard } from './ChatCard';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { GraphService } from '../services/GraphService';
import { PreferencesService } from '../services/PreferencesService';
import { getMockChats, getMockMe } from '../services/MockData';
import {
  IChatSummary,
  IMe,
  IUserPrefs,
  DEFAULT_PREFS,
  NavKey,
  SortKey,
  ViewMode,
  ChatType
} from '../models/models';
import { isToday } from '../utils/format';

function dateVal(c: IChatSummary): number {
  return c.lastMessageDate ? new Date(c.lastMessageDate).getTime() : 0;
}

function recomputeFlags(chats: IChatSummary[], prefs: IUserPrefs): IChatSummary[] {
  const selectAll: boolean = prefs.selectedChatIds.length === 0;
  const selSet: Set<string> = new Set(prefs.selectedChatIds);
  const favSet: Set<string> = new Set(prefs.favoriteChatIds);
  return chats.map((c) => {
    const lv: string | undefined = prefs.lastViewedAt[c.id];
    const unreadByDate: boolean =
      !c.isFromMe &&
      !!c.lastMessageDate &&
      !!lv &&
      new Date(c.lastMessageDate).getTime() > new Date(lv).getTime();
    return {
      ...c,
      isSelected: selectAll ? true : selSet.has(c.id),
      isFavorite: favSet.has(c.id),
      isUnread: c.unreadCount > 0 ? true : unreadByDate
    };
  });
}

function filterChats(list: IChatSummary[], query: string): IChatSummary[] {
  const s: string = query.trim().toLowerCase();
  if (!s) {
    return list;
  }
  return list.filter(
    (c) =>
      c.title.toLowerCase().indexOf(s) >= 0 ||
      (c.lastMessageAuthor || '').toLowerCase().indexOf(s) >= 0 ||
      (c.lastMessageText || '').toLowerCase().indexOf(s) >= 0 ||
      c.members.some((m) => (m.displayName || '').toLowerCase().indexOf(s) >= 0)
  );
}

function sortChats(list: IChatSummary[], sort: SortKey): IChatSummary[] {
  const arr: IChatSummary[] = list.slice();
  if (sort === 'name') {
    arr.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
  } else if (sort === 'unread') {
    arr.sort(
      (a, b) =>
        b.unreadCount - a.unreadCount ||
        (b.isUnread ? 1 : 0) - (a.isUnread ? 1 : 0) ||
        dateVal(b) - dateVal(a)
    );
  } else {
    arr.sort((a, b) => dateVal(b) - dateVal(a));
  }
  return arr;
}

function chatTypeLabel(t: ChatType): string {
  if (t === 'oneOnOne') {
    return '1:1 채팅';
  }
  if (t === 'meeting') {
    return '미팅 채팅';
  }
  return '그룹 채팅';
}

const Dashboard: React.FC<IDashboardProps> = (props: IDashboardProps) => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [usingMock, setUsingMock] = React.useState<boolean>(true);
  const [me, setMe] = React.useState<IMe>({
    id: '',
    displayName: props.userDisplayName || '사용자',
    givenName: ''
  });
  const [chats, setChats] = React.useState<IChatSummary[]>([]);
  const [prefs, setPrefs] = React.useState<IUserPrefs>({ ...DEFAULT_PREFS, lastViewedAt: {} });
  const [nav, setNav] = React.useState<NavKey>('home');
  const [query, setQuery] = React.useState<string>('');
  const [photos, setPhotos] = React.useState<Record<string, string>>({});

  const servicesRef = React.useRef<{ graph?: GraphService; prefs?: PreferencesService }>({});

  React.useEffect(() => {
    let cancelled: boolean = false;

    const useMockData = (): void => {
      const mockChats: IChatSummary[] = getMockChats();
      const mockPrefs: IUserPrefs = {
        selectedChatIds: [],
        favoriteChatIds: mockChats.filter((c) => c.isFavorite).map((c) => c.id),
        lastViewedAt: {},
        sort: 'recent',
        viewMode: 'grid'
      };
      if (cancelled) {
        return;
      }
      setMe(getMockMe());
      setPrefs(mockPrefs);
      setChats(recomputeFlags(mockChats, mockPrefs));
      setUsingMock(true);
      setLoading(false);
    };

    const loadPhotos = async (graph: GraphService, list: IChatSummary[]): Promise<void> => {
      const ids: string[] = [];
      list.forEach((c) => {
        if (!c.isFromMe && c.lastMessageFromUserId && ids.indexOf(c.lastMessageFromUserId) < 0) {
          ids.push(c.lastMessageFromUserId);
        }
      });
      const map: Record<string, string> = {};
      await Promise.all(
        ids.slice(0, 25).map(async (id) => {
          const url: string = await graph.getUserPhotoUrl(id);
          if (url) {
            map[id] = url;
          }
        })
      );
      if (!cancelled && Object.keys(map).length > 0) {
        setPhotos(map);
      }
    };

    const load = async (): Promise<void> => {
      const client = props.graphClient;
      if (!client) {
        useMockData();
        return;
      }
      try {
        const graph: GraphService = new GraphService(client);
        const prefSvc: PreferencesService = new PreferencesService(client);
        const meInfo: IMe = await graph.getMe();
        const [chatList, loadedPrefs] = await Promise.all([graph.getChats(), prefSvc.load()]);
        if (cancelled) {
          return;
        }
        servicesRef.current = { graph, prefs: prefSvc };
        setMe(meInfo);
        setPrefs(loadedPrefs);
        setChats(recomputeFlags(chatList, loadedPrefs));
        setUsingMock(false);
        setLoading(false);
        loadPhotos(graph, chatList).catch(() => undefined);
      } catch {
        useMockData();
      }
    };

    load().catch(() => useMockData());

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPrefs = (next: IUserPrefs): void => {
    setPrefs(next);
    setChats((prev) => recomputeFlags(prev, next));
    const ps = servicesRef.current.prefs;
    if (ps) {
      ps.save(next).catch(() => undefined);
    }
  };

  const toggleSelected = (id: string): void => {
    const selectAll: boolean = prefs.selectedChatIds.length === 0;
    let sel: string[] = selectAll ? chats.map((c) => c.id) : prefs.selectedChatIds.slice();
    if (sel.indexOf(id) >= 0) {
      sel = sel.filter((x) => x !== id);
    } else {
      sel.push(id);
    }
    applyPrefs({ ...prefs, selectedChatIds: sel });
  };

  const toggleFavorite = (id: string): void => {
    let fav: string[] = prefs.favoriteChatIds.slice();
    if (fav.indexOf(id) >= 0) {
      fav = fav.filter((x) => x !== id);
    } else {
      fav.push(id);
    }
    applyPrefs({ ...prefs, favoriteChatIds: fav });
  };

  const openChat = (chat: IChatSummary): void => {
    const next: IUserPrefs = {
      ...prefs,
      lastViewedAt: { ...prefs.lastViewedAt, [chat.id]: new Date().toISOString() }
    };
    applyPrefs(next);
    if (!usingMock) {
      const url: string = `https://teams.microsoft.com/_#/conversations/${encodeURIComponent(
        chat.id
      )}?ctx=chat`;
      window.open(url, '_blank', 'noopener');
    }
  };

  if (loading) {
    return (
      <section className={styles.app}>
        <div className={styles.center}>
          <div className={styles.spinner} />
          <div>대화를 불러오는 중…</div>
        </div>
      </section>
    );
  }

  const firstName: string = (me.givenName || me.displayName || '사용자').split(' ')[0];
  const selectedChats: IChatSummary[] = chats.filter((c) => c.isSelected);
  const favorites: IChatSummary[] = chats.filter((c) => c.isFavorite);
  const unreadChats: IChatSummary[] = chats.filter((c) => c.unreadCount > 0 || c.isUnread);
  const totalUnread: number = chats.reduce((sum, c) => sum + c.unreadCount, 0) || unreadChats.length;
  const todayCount: number = chats.filter((c) => isToday(c.lastMessageDate)).length;
  const alertCount: number = unreadChats.length;

  const renderChatCollection = (list: IChatSummary[], emptyText: string): React.ReactNode => {
    if (list.length === 0) {
      return (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>표시할 채팅이 없습니다</div>
          {emptyText}
        </div>
      );
    }
    return (
      <div className={prefs.viewMode === 'grid' ? styles.cardsGrid : styles.cardsList}>
        {list.map((c) => (
          <ChatCard
            key={c.id}
            chat={c}
            authorPhotoUrl={photos[c.lastMessageFromUserId]}
            onOpen={openChat}
          />
        ))}
      </div>
    );
  };

  const renderSearchRow = (showAdd: boolean): React.ReactNode => (
    <div className={styles.searchRow}>
      <div className={styles.search}>
        <span className={styles.searchIcon}>
          <Icon name="search" size={20} />
        </span>
        <input
          className={styles.searchInput}
          placeholder="그룹명 또는 멤버, 메시지 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="button" className={styles.searchFilter} aria-label="필터">
          <Icon name="filter" size={20} />
        </button>
      </div>
      {showAdd && (
        <button type="button" className={styles.addBtn} onClick={() => setNav('settings')}>
          <Icon name="add" size={18} strokeWidth={2.2} />
          그룹 추가
        </button>
      )}
    </div>
  );

  const renderRecentControls = (): React.ReactNode => (
    <div className={styles.recentControls}>
      <span className={styles.sortSelect}>
        정렬:
        <select value={prefs.sort} onChange={(e) => applyPrefs({ ...prefs, sort: e.target.value as SortKey })}>
          <option value="recent">최신순</option>
          <option value="name">이름순</option>
          <option value="unread">미확인순</option>
        </select>
      </span>
      <div className={styles.viewToggle}>
        <button
          type="button"
          className={`${styles.viewBtn} ${prefs.viewMode === 'grid' ? styles.viewBtnActive : ''}`}
          onClick={() => applyPrefs({ ...prefs, viewMode: 'grid' as ViewMode })}
          aria-label="격자 보기"
        >
          <Icon name="grid" size={18} />
        </button>
        <button
          type="button"
          className={`${styles.viewBtn} ${prefs.viewMode === 'list' ? styles.viewBtnActive : ''}`}
          onClick={() => applyPrefs({ ...prefs, viewMode: 'list' as ViewMode })}
          aria-label="목록 보기"
        >
          <Icon name="list" size={18} />
        </button>
      </div>
    </div>
  );

  const renderHome = (): React.ReactNode => {
    const recent: IChatSummary[] = sortChats(filterChats(selectedChats, query), prefs.sort);
    return (
      <>
        <div className={styles.topbar}>
          <div>
            <h1 className={styles.greetingTitle}>
              안녕하세요, {firstName}님 <span>👋</span>
            </h1>
            <p className={styles.greetingSubtitle}>오늘의 그룹 대화와 활동을 한눈에 확인하세요.</p>
          </div>
          <div className={styles.headerActions}>
            <button type="button" className={styles.iconBtn} onClick={() => setNav('alerts')} aria-label="알림">
              <Icon name="bell" size={20} />
              {alertCount > 0 && <span className={styles.iconBtnBadge}>{alertCount}</span>}
            </button>
            <button type="button" className={styles.iconBtn} aria-label="도움말">
              <Icon name="help" size={20} />
            </button>
          </div>
        </div>

        {renderSearchRow(true)}

        {usingMock && (
          <div className={styles.banner}>
            <Icon name="help" size={18} />
            샘플 데이터를 표시하고 있습니다. 실제 Teams 대화는 SharePoint/Teams에 배포하고 관리자 승인을 받은 후 표시됩니다.
          </div>
        )}

        <div className={styles.statRow}>
          <button type="button" className={styles.statCard} onClick={() => setNav('chats')}>
            <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
              <Icon name="group" size={26} />
            </div>
            <div className={styles.statBody}>
              <div className={styles.statLabel}>전체 그룹</div>
              <div className={styles.statValue}>{chats.length}</div>
            </div>
            <span className={styles.statChevron}>
              <Icon name="chevronRight" size={20} />
            </span>
          </button>
          <button type="button" className={styles.statCard} onClick={() => setNav('alerts')}>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
              <Icon name="message" size={24} />
            </div>
            <div className={styles.statBody}>
              <div className={styles.statLabel}>미확인 메시지</div>
              <div className={styles.statValue}>{totalUnread}</div>
            </div>
            <span className={styles.statChevron}>
              <Icon name="chevronRight" size={20} />
            </span>
          </button>
          <button type="button" className={styles.statCard} onClick={() => setNav('activity')}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
              <Icon name="trend" size={24} />
            </div>
            <div className={styles.statBody}>
              <div className={styles.statLabel}>오늘 활동</div>
              <div className={styles.statValue}>{todayCount}</div>
            </div>
            <span className={styles.statChevron}>
              <Icon name="chevronRight" size={20} />
            </span>
          </button>
        </div>

        {favorites.length > 0 && (
          <>
            <div className={styles.sectionHead}>
              <h3 className={styles.sectionTitle}>즐겨찾기</h3>
              <button type="button" className={styles.sectionAction} onClick={() => setNav('favorites')}>
                더보기 <Icon name="chevronRight" size={16} />
              </button>
            </div>
            <div className={styles.favRow}>
              {favorites.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className={styles.favChip}
                  role="button"
                  tabIndex={0}
                  onClick={() => openChat(c)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      openChat(c);
                    }
                  }}
                >
                  <Avatar text={c.avatarText} colorKey={c.colorKey} size={40} />
                  <span className={styles.favName}>{c.title}</span>
                  <span className={styles.favBell}>
                    <Icon name="bell" size={18} />
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>최근 활동</h3>
          {renderRecentControls()}
        </div>
        {renderChatCollection(recent, '대시보드에 표시할 채팅을 설정에서 선택해 보세요.')}
      </>
    );
  };

  const renderListView = (
    title: string,
    subtitle: string,
    list: IChatSummary[],
    emptyText: string
  ): React.ReactNode => (
    <>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.greetingTitle}>{title}</h1>
          <p className={styles.greetingSubtitle}>{subtitle}</p>
        </div>
        <div className={styles.headerActions}>{renderRecentControls()}</div>
      </div>
      {renderSearchRow(false)}
      <div style={{ marginTop: 22 }}>{renderChatCollection(list, emptyText)}</div>
    </>
  );

  const renderSettings = (): React.ReactNode => {
    const all: IChatSummary[] = sortChats(filterChats(chats, query), 'recent');
    const shownCount: number = chats.filter((c) => c.isSelected).length;
    return (
      <>
        <div className={styles.topbar}>
          <div>
            <h1 className={styles.greetingTitle}>설정</h1>
            <p className={styles.settingsIntro}>
              대시보드에 표시할 채팅을 선택하고 즐겨찾기를 지정하세요. 현재 {shownCount}개 표시 중.
            </p>
          </div>
        </div>
        <div className={styles.settingsToolbar}>{renderSearchRow(false)}</div>
        <div className={styles.settingsList}>
          {all.map((c) => (
            <div key={c.id} className={styles.settingsItem}>
              <Avatar text={c.avatarText} colorKey={c.colorKey} size={40} />
              <div className={styles.settingsMain}>
                <div className={styles.settingsTitle}>{c.title}</div>
                <div className={styles.settingsMeta}>
                  {c.memberCount}명 · {chatTypeLabel(c.chatType)}
                  {c.lastMessageAuthor ? ` · ${c.lastMessageAuthor}` : ''}
                </div>
              </div>
              <button
                type="button"
                className={`${styles.starBtn} ${c.isFavorite ? styles.starActive : ''}`}
                onClick={() => toggleFavorite(c.id)}
                aria-label="즐겨찾기"
              >
                <Icon name={c.isFavorite ? 'starFill' : 'star'} size={20} />
              </button>
              <button
                type="button"
                className={`${styles.toggle} ${c.isSelected ? styles.toggleOn : ''}`}
                onClick={() => toggleSelected(c.id)}
                aria-label="대시보드에 표시"
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          ))}
          {all.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>채팅이 없습니다</div>
              검색어와 일치하는 채팅을 찾을 수 없습니다.
            </div>
          )}
        </div>
      </>
    );
  };

  let mainContent: React.ReactNode;
  if (nav === 'home') {
    mainContent = renderHome();
  } else if (nav === 'settings') {
    mainContent = renderSettings();
  } else if (nav === 'favorites') {
    mainContent = renderListView(
      '즐겨찾기',
      '자주 찾는 채팅을 모았습니다.',
      sortChats(filterChats(favorites, query), prefs.sort),
      '즐겨찾기한 채팅이 없습니다.'
    );
  } else if (nav === 'alerts') {
    mainContent = renderListView(
      '알림',
      '미확인 메시지가 있는 채팅입니다.',
      sortChats(filterChats(unreadChats, query), 'unread'),
      '읽지 않은 메시지가 없습니다.'
    );
  } else if (nav === 'activity') {
    mainContent = renderListView(
      '내 활동',
      '최근 대화 활동을 시간순으로 확인하세요.',
      sortChats(filterChats(chats, query), 'recent'),
      '최근 활동이 없습니다.'
    );
  } else {
    mainContent = renderListView(
      '그룹 대화',
      '내가 속한 모든 채팅입니다.',
      sortChats(filterChats(chats, query), prefs.sort),
      '참여 중인 채팅이 없습니다.'
    );
  }

  return (
    <section className={styles.app}>
      <div className={styles.shell}>
        <Sidebar
          active={nav}
          alertCount={alertCount}
          userName={me.displayName}
          onNavigate={(key) => {
            setQuery('');
            setNav(key);
          }}
        />
        <main className={styles.main}>
          <div className={styles.content}>{mainContent}</div>
        </main>
      </div>
    </section>
  );
};

export default Dashboard;
