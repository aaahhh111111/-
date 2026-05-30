import { BaseAdapter } from './BaseAdapter';
import type { ContentInput, PlatformContent } from './types';
export declare class BilibiliAdapter extends BaseAdapter {
    platformId: string;
    platformName: string;
    maxTitleLength: number;
    maxBodyLength: number;
    protected transformBody(body: string): string;
    protected addPlatformFeatures(content: ContentInput, adapted: PlatformContent): void;
}
//# sourceMappingURL=BilibiliAdapter.d.ts.map