import * as React from 'react';

export type IconName =
  | 'home'
  | 'chat'
  | 'star'
  | 'starFill'
  | 'bell'
  | 'clock'
  | 'settings'
  | 'search'
  | 'filter'
  | 'add'
  | 'group'
  | 'message'
  | 'trend'
  | 'chevronRight'
  | 'chevronDown'
  | 'grid'
  | 'list'
  | 'members'
  | 'more'
  | 'check'
  | 'help';

export interface IIconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const PATHS: { [key in IconName]: React.ReactNode } = {
  home: <path d="M3 9.6 12 3l9 6.6V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  chat: (
    <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z" />
  ),
  star: <path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" />,
  starFill: (
    <path
      d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"
      fill="currentColor"
      stroke="none"
    />
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  filter: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2.3" />
      <circle cx="9" cy="17" r="2.3" />
    </>
  ),
  add: <path d="M12 5v14M5 12h14" />,
  group: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 20v-1.3A4.5 4.5 0 0 1 7.3 14.2h3.4a4.5 4.5 0 0 1 4.5 4.5V20" />
      <path d="M16.5 5.1a3.2 3.2 0 0 1 0 6.1" />
      <path d="M18 14.4a4.5 4.5 0 0 1 3.2 4.3V20" />
    </>
  ),
  message: (
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5.4A8 8 0 1 1 21 12z" />
  ),
  trend: (
    <>
      <path d="M3 16.5 9.5 10l4 4L21 6.5" />
      <path d="M15.5 6.5H21V12" />
    </>
  ),
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.6" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="4" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  members: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 20v-1.3A4.5 4.5 0 0 1 7.3 14.2h3.4a4.5 4.5 0 0 1 4.5 4.5V20" />
      <path d="M16.5 5.1a3.2 3.2 0 0 1 0 6.1" />
      <path d="M18 14.4a4.5 4.5 0 0 1 3.2 4.3V20" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  check: <path d="m5 12 5 5 9-11" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.2-2.7 4" />
      <circle cx="12" cy="17.4" r="1.05" fill="currentColor" stroke="none" />
    </>
  )
};

export const Icon: React.FC<IIconProps> = (props: IIconProps) => {
  const { name, size = 20, className, strokeWidth = 1.8 } = props;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
};
