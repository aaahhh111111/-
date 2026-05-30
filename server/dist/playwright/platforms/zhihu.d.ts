import { Page, BrowserContext } from 'playwright';
import { BasePlatform } from './BasePlatform';
import { ContentData } from '../config';
export declare class ZhihuPlatform extends BasePlatform {
    platformId: string;
    platformName: string;
    editorUrl: string;
    getLoginStatus(context: BrowserContext): Promise<boolean>;
    navigateToEditor(page: Page): Promise<void>;
    fillContent(page: Page, content: ContentData): Promise<void>;
}
//# sourceMappingURL=zhihu.d.ts.map