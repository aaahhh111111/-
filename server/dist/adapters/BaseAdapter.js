export class BaseAdapter {
    async transform(content) {
        const warnings = [];
        let adaptedTitle = content.title;
        let adaptedBody = this.transformBody(content.body);
        if (adaptedTitle.length > this.maxTitleLength) {
            warnings.push(`标题超过${this.maxTitleLength}字符，已自动截断`);
            adaptedTitle = adaptedTitle.substring(0, this.maxTitleLength);
        }
        if (adaptedBody.length > this.maxBodyLength) {
            warnings.push(`正文超过${this.maxBodyLength}字符，建议精简`);
        }
        const platformContent = {
            adaptedTitle,
            adaptedBody,
            warnings,
            characterCount: adaptedBody.length,
        };
        this.addPlatformFeatures(content, platformContent);
        return platformContent;
    }
    async simulatePublish(content) {
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
        return {
            status: 'simulated',
            message: `已成功模拟发布到${this.platformName}`,
            publishedAt: new Date().toISOString(),
        };
    }
}
//# sourceMappingURL=BaseAdapter.js.map