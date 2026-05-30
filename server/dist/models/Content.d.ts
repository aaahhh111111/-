export interface PlatformContent {
    adaptedTitle: string;
    adaptedBody: string;
    warnings: string[];
    characterCount: number;
}
export interface Content {
    id: string;
    user_id: string;
    title: string;
    body: string;
    tags: string[];
    images: string[];
    platforms: string[];
    platform_content: Record<string, PlatformContent>;
    created_at: string;
    updated_at: string;
}
export interface ContentCreateInput {
    user_id: string;
    title: string;
    body?: string;
    tags?: string[];
    images?: string[];
    platforms?: string[];
    platform_content?: Record<string, PlatformContent>;
}
export declare const ContentModel: {
    create: (input: ContentCreateInput) => Content;
    findByUserId: (userId: string) => Content[];
    findById: (id: string) => Content | undefined;
    update: (id: string, updates: Partial<ContentCreateInput>) => Content | undefined;
    delete: (id: string) => boolean;
    mapRowToContent: (row: any) => Content;
};
//# sourceMappingURL=Content.d.ts.map