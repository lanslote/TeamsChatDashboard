import type { MSGraphClientV3 } from '@microsoft/sp-http';

export interface IDashboardProps {
  graphClient?: MSGraphClientV3;
  isServedFromLocalhost: boolean;
  hasTeamsContext: boolean;
  userDisplayName: string;
  userId: string;
}
