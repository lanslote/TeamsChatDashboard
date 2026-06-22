import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { MSGraphClientV3 } from '@microsoft/sp-http';

import * as strings from 'DashboardWebPartStrings';
import Dashboard from './components/Dashboard';
import { IDashboardProps } from './components/IDashboardProps';

export interface IDashboardWebPartProps {
  description: string;
}

interface IDashboardErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  IDashboardErrorBoundaryState
> {
  public constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  public static getDerivedStateFromError(error: unknown): IDashboardErrorBoundaryState {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }

  public componentDidCatch(error: unknown): void {
    console.error('Teams chat dashboard render failed.', error);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return React.createElement(
        'section',
        {
          style: {
            padding: '32px',
            fontFamily: 'Segoe UI, sans-serif',
            color: '#1d2033'
          }
        },
        React.createElement('h2', null, 'Teams 그룹챗 대시보드를 불러오지 못했습니다.'),
        React.createElement(
          'p',
          null,
          '앱을 새로 고침해 주세요. 문제가 계속되면 아래 오류 메시지를 관리자에게 전달해 주세요.'
        ),
        React.createElement(
          'pre',
          {
            style: {
              whiteSpace: 'pre-wrap',
              background: '#f5f6fa',
              border: '1px solid #edeff5',
              borderRadius: 8,
              padding: 16
            }
          },
          this.state.message || 'Unknown error'
        )
      );
    }

    return this.props.children;
  }
}

export default class DashboardWebPart extends BaseClientSideWebPart<IDashboardWebPartProps> {
  private _graphClient: MSGraphClientV3 | undefined = undefined;

  public render(): void {
    const pageContext = this.context.pageContext;
    const aad = pageContext && pageContext.aadInfo;
    const sdks = this.context.sdks;
    const dashboardElement: React.ReactElement<IDashboardProps> = React.createElement(Dashboard, {
      graphClient: this._graphClient,
      isServedFromLocalhost: this.context.isServedFromLocalhost,
      hasTeamsContext: !!(sdks && sdks.microsoftTeams),
      userDisplayName: pageContext && pageContext.user ? pageContext.user.displayName : '',
      userId: aad && aad.userId ? aad.userId.toString() : ''
    });
    const element: React.ReactElement = React.createElement(
      DashboardErrorBoundary,
      null,
      dashboardElement
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();

    try {
      const factory = this.context.msGraphClientFactory;
      this._graphClient = factory
        ? ((await factory.getClient('3')) as unknown as MSGraphClientV3)
        : undefined;
    } catch (error) {
      console.warn('Teams chat dashboard: Microsoft Graph client is unavailable.', error);
      this._graphClient = undefined;
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
