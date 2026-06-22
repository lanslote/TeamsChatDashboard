export type ChatType = 'oneOnOne' | 'group' | 'meeting' | 'unknownFutureValue';
export type SortKey = 'recent' | 'name' | 'unread';
export type ViewMode = 'grid' | 'list';
export type NavKey = 'home' | 'chats' | 'favorites' | 'alerts' | 'activity' | 'settings';

export interface IMe {
  id: string;
  displayName: string;
  givenName: string;
}

export interface IChatMember {
  id: string;
  userId: string;
  displayName: string;
  email: string;
}

export interface IChatSummary {
  id: string;
  title: string;
  chatType: ChatType;
  memberCount: number;
  members: IChatMember[];
  lastMessageText: string;
  lastMessageAuthor: string;
  lastMessageFromUserId: string;
  lastMessageDate?: string;
  isFromMe: boolean;
  avatarText: string;
  colorKey: number;
  isSelected: boolean;
  isFavorite: boolean;
  isUnread: boolean;
  unreadCount: number;
}

export interface IUserPrefs {
  selectedChatIds: string[];
  favoriteChatIds: string[];
  lastViewedAt: Record<string, string>;
  sort: SortKey;
  viewMode: ViewMode;
}

export const PREFS_EXTENSION_NAME: string = 'com.scout.teamchatdashboard.prefs';

export const DEFAULT_PREFS: IUserPrefs = {
  selectedChatIds: [],
  favoriteChatIds: [],
  lastViewedAt: {},
  sort: 'recent',
  viewMode: 'grid'
};
