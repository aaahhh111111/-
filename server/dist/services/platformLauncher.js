import { chromium } from 'playwright';
import { platformConfigs } from '../playwright/config';
import { WeChatPlatform, ZhihuPlatform, XiaohongshuPlatform, BilibiliPlatform, } from '../playwright/platforms';
import fs from 'fs';
const platforms = {
    wechat: new WeChatPlatform(),
    zhihu: new ZhihuPlatform(),
    xiaohongshu: new XiaohongshuPlatform(),
    bilibili: new BilibiliPlatform(),
};
function createBrowser() {
    return chromium.launch({
        headless: false,
        args: ['--start-maximized'],
        channel: 'msedge',
    });
}
function createBrowserForAuth() {
    return chromium.launch({
        headless: false,
        channel: 'msedge',
    });
}
function createBrowserForStatus() {
    return chromium.launch({ headless: false, channel: 'msedge' });
}
export async function getAuthStatus() {
    const results = [];
    try {
        const browser = await createBrowserForStatus();
        const context = await browser.newContext();
        for (const [platformId, platform] of Object.entries(platforms)) {
            const config = platformConfigs[platformId];
            let isAuthenticated = false;
            let needsLogin = true;
            if (fs.existsSync(config.storageFile)) {
                try {
                    await context.close();
                    const savedContext = await browser.newContext({
                        storageState: config.storageFile,
                    });
                    const testPage = await savedContext.newPage();
                    await testPage.goto(`https://www.${getDomain(platformId)}.com/`, { timeout: 10000 });
                    await testPage.waitForTimeout(2000);
                    isAuthenticated = await platform.getLoginStatus(savedContext);
                    needsLogin = !isAuthenticated;
                    await testPage.close();
                    await savedContext.close();
                }
                catch {
                    needsLogin = true;
                }
            }
            else {
                needsLogin = true;
            }
            results.push({
                platform: platformId,
                name: config.name,
                isAuthenticated,
                needsLogin,
            });
        }
        await context.close();
        await browser.close();
    }
    catch (error) {
        console.error('Failed to check auth status:', error);
    }
    return results;
}
export async function launchPlatforms(content, platformIds) {
    const results = [];
    let browser = null;
    try {
        browser = await createBrowser();
        for (const platformId of platformIds) {
            const platform = platforms[platformId];
            const config = platformConfigs[platformId];
            if (!platform || !config) {
                results.push({
                    success: false,
                    platform: platformId,
                    url: '',
                    error: '平台未配置',
                });
                continue;
            }
            try {
                let context;
                if (fs.existsSync(config.storageFile)) {
                    context = await browser.newContext({
                        storageState: config.storageFile,
                    });
                }
                else {
                    context = await browser.newContext();
                }
                const page = await context.newPage();
                await page.setViewportSize({ width: 1400, height: 900 });
                await platform.navigateToEditor(page);
                await platform.fillContent(page, content);
                const currentUrl = page.url();
                results.push({
                    success: true,
                    platform: platformId,
                    url: currentUrl,
                });
                if (!fs.existsSync(config.storageFile)) {
                    await context.storageState({ path: config.storageFile });
                    console.log(`已保存 ${config.name} 登录状态到 ${config.storageFile}`);
                }
            }
            catch (error) {
                results.push({
                    success: false,
                    platform: platformId,
                    url: '',
                    error: error.message || '未知错误',
                });
            }
        }
    }
    catch (error) {
        console.error('Browser launch error:', error);
        results.push({
            success: false,
            platform: 'all',
            url: '',
            error: error.message || '浏览器启动失败',
        });
    }
    finally {
        if (browser) {
            await browser.close();
        }
    }
    return results;
}
export async function authenticatePlatform(platformId) {
    const platform = platforms[platformId];
    const config = platformConfigs[platformId];
    if (!platform || !config) {
        return { success: false, error: '平台未配置' };
    }
    let browser = null;
    try {
        browser = await createBrowserForAuth();
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.setViewportSize({ width: 1400, height: 900 });
        await page.goto(config.editorUrl, { waitUntil: 'networkidle' });
        console.log(`请在打开的浏览器窗口中登录 ${config.name}`);
        console.log('登录完成后，按回车键继续...');
        await new Promise((resolve) => {
            process.stdin.once('data', () => resolve());
        });
        await context.storageState({ path: config.storageFile });
        await browser.close();
        return { success: true };
    }
    catch (error) {
        if (browser) {
            await browser.close();
        }
        return { success: false, error: error.message };
    }
}
function getDomain(platformId) {
    const domains = {
        wechat: 'weixin.qq.com',
        zhihu: 'zhihu.com',
        xiaohongshu: 'xiaohongshu.com',
        bilibili: 'bilibili.com',
    };
    return domains[platformId] || 'example.com';
}
//# sourceMappingURL=platformLauncher.js.map