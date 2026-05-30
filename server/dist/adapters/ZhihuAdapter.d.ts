import { BaseAdapter } from './BaseAdapter';
import type { ContentInput, PlatformContent } from './types';
export declare class ZhihuAdapter extends BaseAdapter {
    platformId: string;
    platformName: string;
    maxTitleLength: number;
    maxBodyLength: number;
    private sensitiveWords;
    protected transformBody(body: string): string;
    protected addPlatformFeatures(content: ContentInput, adapted: PlatformContent): void;
}
//# sourceMappingURL=ZhihuAdapter.d.ts.map