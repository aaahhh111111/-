import { BaseAdapter } from './BaseAdapter';
export class BilibiliAdapter extends BaseAdapter {
    platformId = 'bilibili';
    platformName = 'B站';
    maxTitleLength = 30;
    maxBodyLength = 5000;
    transformBody(body) {
        let text = body;
        text = text.replace(/<[^>]+>/g, '');
        text = text.replace(/\*\*(.*?)\*\*/g, '$1');
        text = text.replace(/\*(.*?)\*/g, '$1');
        text = text.replace(/<br\s*\/?>/gi, '\n');
        const lines = text.split('\n').filter((line) => line.trim());
        const simplifiedLines = lines.map((line) => {
            if (line.length > 100) {
                return line.substring(0, 97) + '...';
            }
            return line;
        });
        return simplifiedLines.join('\n\n');
    }
    addPlatformFeatures(content, adapted) {
        const hashtags = ['#创作打卡挑战赛#', '#干货#', '#知识分享#'];
        if (content.tags.length > 0) {
            const relevantHashtags = content.tags
                .slice(0, 2)
                .map((tag) => `#${tag}`)
                .join(' ');
            adapted.adaptedBody += `\n\n${relevantHashtags} ${hashtags[0]}`;
        }
        else {
            adapted.adaptedBody += `\n\n${hashtags[0]} ${hashtags[1]}`;
        }
        if (adapted.adaptedTitle.length > 20) {
            adapted.warnings.push('标题较长，建议精简以提高点击率');
        }
        adapted.adaptedBody += '\n\n-------------------------\n' + '往期推荐 | B站@创作者';
    }
}
//# sourceMappingURL=BilibiliAdapter.js.map