import type { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  IUserPrefs,
  DEFAULT_PREFS,
  PREFS_EXTENSION_NAME,
  SortKey,
  ViewMode
} from '../models/models';

interface IPrefsExtension {
  selectedChatIds?: string[];
  favoriteChatIds?: string[];
  lastViewedAt?: Record<string, string>;
  sort?: SortKey;
  viewMode?: ViewMode;
}

export class PreferencesService {
  public constructor(private readonly client: MSGraphClientV3) {}

  public async load(): Promise<IUserPrefs> {
    try {
      const res: IPrefsExtension = (await this.client
        .api(`/me/extensions/${PREFS_EXTENSION_NAME}`)
        .get()) as IPrefsExtension;
      return this.normalize(res);
    } catch {
      return { ...DEFAULT_PREFS, lastViewedAt: {} };
    }
  }

  public async save(prefs: IUserPrefs): Promise<void> {
    const payload: Record<string, unknown> = {
      '@odata.type': 'microsoft.graph.openTypeExtension',
      extensionName: PREFS_EXTENSION_NAME,
      selectedChatIds: prefs.selectedChatIds,
      favoriteChatIds: prefs.favoriteChatIds,
      lastViewedAt: prefs.lastViewedAt,
      sort: prefs.sort,
      viewMode: prefs.viewMode
    };
    try {
      await this.client.api(`/me/extensions/${PREFS_EXTENSION_NAME}`).update(payload);
    } catch {
      await this.client.api('/me/extensions').post(payload);
    }
  }

  private normalize(res: IPrefsExtension): IUserPrefs {
    return {
      selectedChatIds: Array.isArray(res.selectedChatIds) ? res.selectedChatIds : [],
      favoriteChatIds: Array.isArray(res.favoriteChatIds) ? res.favoriteChatIds : [],
      lastViewedAt:
        res.lastViewedAt && typeof res.lastViewedAt === 'object' ? res.lastViewedAt : {},
      sort: res.sort || 'recent',
      viewMode: res.viewMode || 'grid'
    };
  }
}
