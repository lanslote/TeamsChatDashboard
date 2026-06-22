import { IChatSummary, IMe, ChatType } from '../models/models';
import { avatarText, colorKeyFor } from '../utils/format';

function todayAt(h: number, m: number): string {
  const d: Date = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number, h: number, m: number): string {
  const d: Date = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

interface ISeed {
  id: string;
  title: string;
  chatType?: ChatType;
  memberCount: number;
  author: string;
  text: string;
  date: string;
  isFromMe?: boolean;
  favorite?: boolean;
  unread?: number;
}

function build(seed: ISeed): IChatSummary {
  return {
    id: seed.id,
    title: seed.title,
    chatType: seed.chatType || 'group',
    memberCount: seed.memberCount,
    members: [],
    lastMessageText: seed.text,
    lastMessageAuthor: seed.author,
    lastMessageFromUserId: seed.isFromMe ? 'me' : seed.id + '-u',
    lastMessageDate: seed.date,
    isFromMe: !!seed.isFromMe,
    avatarText: avatarText(seed.title),
    colorKey: colorKeyFor(seed.id),
    isSelected: true,
    isFavorite: !!seed.favorite,
    isUnread: (seed.unread || 0) > 0,
    unreadCount: seed.unread || 0
  };
}

export function getMockMe(): IMe {
  return { id: 'me', displayName: 'Jeongwoo Choi', givenName: 'Jeongwoo' };
}

export function getMockChats(): IChatSummary[] {
  const seeds: ISeed[] = [
    {
      id: 'it',
      title: 'IT지원팀',
      memberCount: 23,
      author: '강병호(KANG, BYUNGHO)',
      text: 'IT지원팀 책임입니다. 점검 일정 관련 공유드립니다.',
      date: todayAt(11, 1),
      favorite: true,
      unread: 12
    },
    {
      id: 'infra',
      title: '인프라파트',
      memberCount: 15,
      author: '김철수(KIM, CHEOLSU)',
      text: '서버 교체 작업이 완료되었습니다. 확인 부탁드립니다.',
      date: todayAt(10, 40),
      favorite: true,
      unread: 3
    },
    {
      id: 'part',
      title: '파트',
      memberCount: 9,
      author: 'LAURA TILEUTAY(라우라)',
      text: '정기 회의 일정 변경 안내드립니다.',
      date: daysAgo(4, 14, 20)
    },
    {
      id: 'mcp',
      title: 'MCP Pioneers',
      memberCount: 48,
      author: '나',
      text: '가능합니다. 감사합니다!',
      date: daysAgo(40, 9, 12),
      isFromMe: true,
      favorite: true
    },
    {
      id: 'adpwd',
      title: 'adPWDManager 솔루션 업그레이드',
      memberCount: 8,
      author: '이광연(LEE KWANG YEON)',
      text: '업그레이드 일정 및 진행 상황 공유드립니다.',
      date: daysAgo(55, 16, 5)
    },
    {
      id: 'm365',
      title: 'M365 문서보안PJT',
      memberCount: 12,
      author: '이광연(LEE KWANG YEON)',
      text: '테스트 결과 공유드립니다.',
      date: daysAgo(82, 13, 30),
      favorite: true,
      unread: 5
    },
    {
      id: 'design',
      title: '디자인 시스템 TF',
      memberCount: 6,
      author: '박지민(PARK, JIMIN)',
      text: '컴포넌트 토큰 정리본 업로드했습니다.',
      date: todayAt(9, 15),
      unread: 2
    },
    {
      id: 'helpdesk',
      title: '김영희(KIM, YOUNGHEE)',
      chatType: 'oneOnOne',
      memberCount: 2,
      author: '김영희(KIM, YOUNGHEE)',
      text: '네, 내일 오전에 회신드리겠습니다.',
      date: daysAgo(1, 17, 45)
    }
  ];
  return seeds.map(build);
}
