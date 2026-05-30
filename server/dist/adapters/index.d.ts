import { PlatformAdapter } from './types';
export { PlatformAdapter, PlatformContent, ContentInput, PublishResult } from './types';
export declare class PlatformAdapterFactory {
    private adapters;
    getAdapter(platformId: string): PlatformAdapter | undefined;
    getAllAdapters(): PlatformAdapter[];
    getPlatformInfo(): Array<{
        id: string;
        name: string;
    }>;
    registerAdapter(adapter: PlatformAdapter): void;
}
//# sourceMappingURL=index.d.ts.map