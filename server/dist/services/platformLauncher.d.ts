import { ContentData, LaunchResult } from '../playwright/config';
export interface PlatformAuthStatus {
    platform: string;
    name: string;
    isAuthenticated: boolean;
    needsLogin: boolean;
}
export declare function getAuthStatus(): Promise<PlatformAuthStatus[]>;
export declare function launchPlatforms(content: ContentData, platformIds: string[]): Promise<LaunchResult[]>;
export declare function authenticatePlatform(platformId: string): Promise<{
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=platformLauncher.d.ts.map