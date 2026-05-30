import type { ContentInput, PlatformContent, PublishResult, PlatformAdapter } from './types';
export declare abstract class BaseAdapter implements PlatformAdapter {
    abstract platformId: string;
    abstract platformName: string;
    abstract maxTitleLength: number;
    abstract maxBodyLength: number;
    protected abstract transformBody(body: string): string;
    protected abstract addPlatformFeatures(content: ContentInput, adapted: PlatformContent): void;
    transform(content: ContentInput): Promise<PlatformContent>;
    simulatePublish(content: ContentInput): Promise<PublishResult>;
}
//# sourceMappingURL=BaseAdapter.d.ts.map