import * as React from 'react';
import styles from './Dashboard.module.scss';
import { Icon, IconName } from './Icon';
import { NavKey } from '../models/models';

interface INavEntry {
  key: NavKey;
  label: string;
  icon: IconName;
}

const ENTRIES: INavEntry[] = [
  { key: 'home', label: '홈', icon: 'home' },
  { key: 'chats', label: '그룹 대화', icon: 'chat' },
  { key: 'favorites', label: '즐겨찾기', icon: 'star' },
  { key: 'alerts', label: '알림', icon: 'bell' },
  { key: 'activity', label: '내 활동', icon: 'clock' },
  { key: 'settings', label: '설정', icon: 'settings' }
];

export interface ISidebarProps {
  active: NavKey;
  alertCount: number;
  userName: string;
  onNavigate: (key: NavKey) => void;
}

export const Sidebar: React.FC<ISidebarProps> = (props: ISidebarProps) => {
  const { active, alertCount, userName, onNavigate } = props;
  const initial: string = (userName || '?').trim().charAt(0).toUpperCase();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandLogo}>K</div>
      </div>
      <nav className={styles.nav}>
        {ENTRIES.map((e) => {
          const isActive: boolean = active === e.key;
          const iconName: IconName = isActive && e.icon === 'star' ? 'starFill' : e.icon;
          return (
            <button
              key={e.key}
              type="button"
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              onClick={() => onNavigate(e.key)}
            >
              <span className={styles.navIcon}>
                <Icon name={iconName} />
              </span>
              <span className={styles.navLabel}>{e.label}</span>
              {e.key === 'alerts' && alertCount > 0 && (
                <span className={styles.navBadge}>{alertCount}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className={styles.sidebarFooter}>
        <div className={styles.userChip}>
          <div className={styles.userAvatar}>
            {initial}
            <span className={styles.userPresence} />
          </div>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.userMore}>···</span>
        </div>
      </div>
    </aside>
  );
};
