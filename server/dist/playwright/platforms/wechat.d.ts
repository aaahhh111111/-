import { Page, BrowserContext } from 'playwright';
import { BasePlatform } from './BasePlatform';
import { ContentData } from '../config';
export declare class WeChatPlatform extends BasePlatform {
    platformId: string;
    platformName: string;
    editorUrl: string;
    getLoginStatus(context: BrowserContext): Promise<boolean>;
    navigateToEditor(page: Page): Promise<void>;
    fillContent(page: Page, content: ContentData): Promise<void>;
}
//# sourceMappingURL=wechat.d.ts.map