export interface PlatformConfig {
    id: string;
    name: string;
    editorUrl: string;
    storageFile: string;
}
export interface ContentData {
    title: string;
    body: string;
    tags: string[];
    images?: string[];
}
export interface LaunchResult {
    success: boolean;
    platform: string;
    url: string;
    error?: string;
}
export declare const STORAGE_DIR: string;
export declare const platformConfigs: Record<string, PlatformConfig>;
//# sourceMappingURL=config.d.ts.map