import { BaseAdapter } from './BaseAdapter';
import type { ContentInput, PlatformContent } from './types';
export declare class WeChatAdapter extends BaseAdapter {
    platformId: string;
    platformName: string;
    maxTitleLength: number;
    maxBodyLength: number;
    protected transformBody(body: string): string;
    protected addPlatformFeatures(content: ContentInput, adapted: PlatformContent): void;
}
//# sourceMappingURL=WeChatAdapter.d.ts.map