import * as React from 'react';
import styles from './Dashboard.module.scss';
import { avatarColor } from '../utils/format';

export interface IAvatarProps {
  text: string;
  colorKey: number;
  size?: number;
  round?: boolean;
  photoUrl?: string;
}

export const Avatar: React.FC<IAvatarProps> = (props: IAvatarProps) => {
  const { text, colorKey, size = 48, round, photoUrl } = props;
  const color = avatarColor(colorKey);
  const len = (text || '').length;
  const ratio = len >= 4 ? 0.26 : len === 3 ? 0.31 : 0.38;
  const style: React.CSSProperties = {
    width: size,
    height: size,
    background: photoUrl ? '#eef0f5' : color.bg,
    color: color.fg,
    fontSize: Math.max(10, Math.round(size * ratio))
  };
  return (
    <div
      className={`${styles.avatar} ${round ? styles.avatarRound : ''}`}
      style={style}
      title={text}
    >
      {photoUrl ? <img src={photoUrl} alt={text} /> : <span>{text}</span>}
    </div>
  );
};
