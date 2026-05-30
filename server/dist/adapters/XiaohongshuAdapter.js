import { BaseAdapter } from './BaseAdapter';
export class XiaohongshuAdapter extends BaseAdapter {
    platformId = 'xiaohongshu';
    platformName = '小红书';
    maxTitleLength = 20;
    maxBodyLength = 1000;
    emojis = {
        title: ['✨', '📌', '🔥', '💫', '⭐', '🌟', '💥'],
        section: ['📍', '💡', '📝', '✅', '🎯', '📖'],
        end: ['💕', '👍', '❤️', '🔖', '📌'],
    };
    transformBody(body) {
        let text = body;
        text = text.replace(/<[^>]+>/g, '');
        text = text.replace(/\*\*(.*?)\*\*/g, '**$1**');
        text = text.replace(/<br\s*\/?>/gi, '\n');
        const lines = text.split('\n').filter((line) => line.trim());
        const formattedLines = lines.map((line, index) => {
            const emoji = this.emojis.section[index % this.emojis.section.length];
            if (line.startsWith('- ') || line.startsWith('* ')) {
                return `${emoji} ${line.substring(2)}`;
            }
            return `${emoji} ${line}`;
        });
        return formattedLines.join('\n');
    }
    addPlatformFeatures(content, adapted) {
        const randomTitleEmoji = this.emojis.title[Math.floor(Math.random() * this.emojis.title.length)];
        adapted.adaptedTitle = `${randomTitleEmoji} ${adapted.adaptedTitle} ${randomTitleEmoji}`;
        const randomEndEmoji = this.emojis.end[Math.floor(Math.random() * this.emojis.end.length)];
        adapted.adaptedBody += `\n\n${randomEndEmoji} 喜欢的话记得收藏+关注哦~`;
        if (adapted.characterCount < 100) {
            adapted.warnings.push('内容较短，建议增加更多细节以获得更好的曝光');
        }
        if (content.tags.length > 0) {
            const xhsTags = content.tags.slice(0, 5).map((tag) => `#${tag}`).join(' ');
            adapted.adaptedBody += `\n\n${xhsTags}`;
        }
    }
}
//# sourceMappingURL=XiaohongshuAdapter.js.map