import { BasePlatform } from './BasePlatform';
import { platformConfigs } from '../config';
export class XiaohongshuPlatform extends BasePlatform {
    platformId = 'xiaohongshu';
    platformName = '小红书';
    editorUrl = platformConfigs.xiaohongshu.editorUrl;
    async getLoginStatus(context) {
        try {
            const page = await context.newPage();
            await page.goto('https://www.xiaohongshu.com/', { waitUntil: 'domcontentloaded' });
            await this.delay(2000);
            const url = page.url();
            const isLoggedIn = !url.includes('login') && !url.includes('login/xltapp');
            await page.close();
            return isLoggedIn;
        }
        catch {
            return false;
        }
    }
    async navigateToEditor(page) {
        console.log('正在跳转到小红书创作者中心...');
        await page.goto(this.editorUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await this.delay(3000);
        console.log('当前URL:', page.url());
    }
    async fillContent(page, content) {
        console.log('开始填写小红书内容...');
        const titleSelectors = [
            'input[placeholder*="标题"]',
            'input.title-input',
            'input[class*="title"]',
            'input[name="title"]',
        ];
        for (const selector of titleSelectors) {
            const input = page.locator(selector).first();
            if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
                console.log(`找到标题输入框: ${selector}`);
                await input.fill(content.title.substring(0, 20));
                await this.delay(500);
                break;
            }
        }
        const plainText = this.stripHtml(content.body).substring(0, 1000);
        console.log('正文长度:', plainText.length);
        const descSelectors = [
            'textarea[name="desc"]',
            '.desc-textarea',
            'textarea[placeholder*="描述"]',
            'textarea[class*="desc"]',
        ];
        for (const selector of descSelectors) {
            const descInput = page.locator(selector).first();
            if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                console.log(`找到描述输入框: ${selector}`);
                await descInput.fill(plainText);
                await this.delay(500);
                break;
            }
        }
        if (content.tags.length > 0) {
            const tagSelectors = [
                'input[placeholder*="标签"]',
                'input.tag-input',
                '.tag-input input',
                'input[placeholder*="话题"]',
            ];
            for (const selector of tagSelectors) {
                const tagInput = page.locator(selector).first();
                if (await tagInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                    console.log(`找到标签输入框: ${selector}`);
                    for (const tag of content.tags.slice(0, 5)) {
                        await tagInput.fill(`#${tag}`);
                        await this.delay(500);
                        const suggestion = page.locator('.suggestion-item, .tag-item').first();
                        if (await suggestion.isVisible({ timeout: 2000 }).catch(() => false)) {
                            await suggestion.click();
                        }
                        await this.delay(300);
                    }
                    break;
                }
            }
        }
        const uploadNotice = page.locator('text=请上传封面图, text=封面').first();
        if (await uploadNotice.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log('小红书需要手动上传封面图和图片');
        }
        console.log('小红书内容填写完成');
    }
}
//# sourceMappingURL=xiaohongshu.js.map