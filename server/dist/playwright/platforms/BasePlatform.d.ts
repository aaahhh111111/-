import { Page, BrowserContext } from 'playwright';
import { ContentData } from '../config';
export interface PlatformAutomation {
    platformId: string;
    platformName: string;
    getLoginStatus(context: BrowserContext): Promise<boolean>;
    navigateToEditor(page: Page): Promise<void>;
    fillContent(page: Page, content: ContentData): Promise<void>;
    getCurrentUrl(page: Page): string;
}
export declare abstract class BasePlatform implements PlatformAutomation {
    abstract platformId: string;
    abstract platformName: string;
    abstract editorUrl: string;
    abstract getLoginStatus(context: BrowserContext): Promise<boolean>;
    abstract navigateToEditor(page: Page): Promise<void>;
    abstract fillContent(page: Page, content: ContentData): Promise<void>;
    getCurrentUrl(page: Page): string;
    protected stripHtml(html: string): string;
    protected delay(ms: number): Promise<void>;
}
//# sourceMappingURL=BasePlatform.d.ts.map