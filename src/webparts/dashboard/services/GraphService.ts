import type { MSGraphClientV3 } from '@microsoft/sp-http';
import type { Chat, AadUserConversationMember } from '@microsoft/microsoft-graph-types';
import { IChatSummary, IChatMember, IMe, ChatType } from '../models/models';
import { stripHtml, avatarText, colorKeyFor } from '../utils/format';

interface IGraphCollection<T> {
  value: T[];
}

export class GraphService {
  private meId: string = '';

  public constructor(private readonly client: MSGraphClientV3) {}

  public setMeId(id: string): void {
    this.meId = id;
  }

  public async getMe(): Promise<IMe> {
    const res: IMe = (await this.client
      .api('/me')
      .select('id,displayName,givenName')
      .get()) as IMe;
    this.meId = res.id;
    return res;
  }

  public async getChats(top: number = 50): Promise<IChatSummary[]> {
    const res: IGraphCollection<Chat> = (await this.client
      .api('/me/chats')
      .expand('members,lastMessagePreview')
      .top(top)
      .get()) as IGraphCollection<Chat>;
    const chats: Chat[] = res.value || [];
    return chats
      .map((c) => this.toSummary(c))
      .sort((a, b) => this.compareByDateDesc(a.lastMessageDate, b.lastMessageDate));
  }

  public async getUserPhotoUrl(userId: string): Promise<string> {
    if (!userId) {
      return '';
    }
    try {
      const api: { responseType(t: string): { get(): Promise<Blob> } } = this.client.api(
        `/users/${userId}/photo/$value`
      ) as unknown as { responseType(t: string): { get(): Promise<Blob> } };
      const blob: Blob = await api.responseType('blob').get();
      return URL.createObjectURL(blob);
    } catch {
      return '';
    }
  }

  private compareByDateDesc(a?: string, b?: string): number {
    const ta: number = a ? new Date(a).getTime() : 0;
    const tb: number = b ? new Date(b).getTime() : 0;
    return tb - ta;
  }

  private toSummary(c: Chat): IChatSummary {
    const rawMembers: AadUserConversationMember[] = (c.members || []) as AadUserConversationMember[];
    const members: IChatMember[] = rawMembers.map((m) => ({
      id: m.id || '',
      userId: m.userId || '',
      displayName: m.displayName || m.email || '알 수 없는 사용자',
      email: m.email || ''
    }));
    const others: IChatMember[] = members.filter((m) => m.userId && m.userId !== this.meId);

    let title: string = (c.topic || '').trim();
    if (!title) {
      if (c.chatType === 'oneOnOne') {
        title = (others[0] || members[0]) ? (others[0] || members[0]).displayName : '대화';
      } else {
        const names: string = others.map((o) => o.displayName).slice(0, 3).join(', ');
        title = names || '그룹 채팅';
      }
    }

    const preview = c.lastMessagePreview;
    const fromUser = preview && preview.from ? preview.from.user : undefined;
    const lastMessageFromUserId: string = (fromUser && fromUser.id) || '';
    const isFromMe: boolean = !!lastMessageFromUserId && lastMessageFromUserId === this.meId;

    let author: string = (fromUser && fromUser.displayName) || '';
    if (isFromMe) {
      author = '나';
    } else if (preview && !preview.from) {
      author = '시스템';
    }

    const body = preview ? preview.body : undefined;
    const content: string = (body && body.content) || '';
    const text: string = body && body.contentType === 'html' ? stripHtml(content) : content.trim();

    return {
      id: c.id || '',
      title,
      chatType: (c.chatType as ChatType) || 'group',
      memberCount: members.length,
      members,
      lastMessageText: text,
      lastMessageAuthor: author,
      lastMessageFromUserId,
      lastMessageDate: (preview && preview.createdDateTime) || c.lastUpdatedDateTime || undefined,
      isFromMe,
      avatarText: avatarText(title),
      colorKey: colorKeyFor(c.id || title),
      isSelected: false,
      isFavorite: false,
      isUnread: false,
      unreadCount: 0
    };
  }
}
