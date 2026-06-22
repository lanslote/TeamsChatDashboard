import * as React from 'react';
import styles from './Dashboard.module.scss';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { IChatSummary } from '../models/models';
import { formatChatTime, colorKeyFor } from '../utils/format';

export interface IChatCardProps {
  chat: IChatSummary;
  authorPhotoUrl?: string;
  onOpen: (chat: IChatSummary) => void;
}

function authorInitial(name: string): string {
  const cleaned: string = (name || '').replace(/\(.*$/, '').trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() : '?';
}

export const ChatCard: React.FC<IChatCardProps> = (props: IChatCardProps) => {
  const { chat, authorPhotoUrl, onOpen } = props;

  let unread: React.ReactNode = undefined;
  if (chat.unreadCount > 0) {
    unread = (
      <span className={styles.chatUnread}>
        <span className={styles.chatUnreadDot} /> {chat.unreadCount}
      </span>
    );
  } else if (chat.isUnread) {
    unread = (
      <span className={styles.chatUnread}>
        <span className={styles.chatUnreadDot} /> NEW
      </span>
    );
  }

  return (
    <div
      className={styles.chatCard}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(chat)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpen(chat);
        }
      }}
    >
      <div className={styles.chatTop}>
        <Avatar text={chat.avatarText} colorKey={chat.colorKey} size={46} />
        <div className={styles.chatHeadText}>
          <h4 className={styles.chatTitle}>{chat.title}</h4>
        </div>
        <span className={styles.chatTime}>{formatChatTime(chat.lastMessageDate)}</span>
      </div>
      <div className={styles.chatBody}>
        <div className={styles.chatAuthorRow}>
          <Avatar
            text={authorInitial(chat.lastMessageAuthor)}
            colorKey={colorKeyFor(chat.lastMessageAuthor || chat.id)}
            size={22}
            round
            photoUrl={authorPhotoUrl}
          />
          <span className={styles.chatAuthorName}>{chat.lastMessageAuthor || '대화 없음'}</span>
        </div>
        <p className={styles.chatPreview}>{chat.lastMessageText || '아직 메시지가 없습니다.'}</p>
      </div>
      <div className={styles.chatFooter}>
        <span className={styles.chatMembers}>
          <Icon name="members" size={16} /> {chat.memberCount}명
        </span>
        {unread}
      </div>
    </div>
  );
};
