import { BaseAdapter } from './BaseAdapter';
import type { ContentInput, PlatformContent } from './types';
export declare class XiaohongshuAdapter extends BaseAdapter {
    platformId: string;
    platformName: string;
    maxTitleLength: number;
    maxBodyLength: number;
    private emojis;
    protected transformBody(body: string): string;
    protected addPlatformFeatures(content: ContentInput, adapted: PlatformContent): void;
}
//# sourceMappingURL=XiaohongshuAdapter.d.ts.map