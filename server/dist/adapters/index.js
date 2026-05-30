import { WeChatAdapter } from './WeChatAdapter';
import { ZhihuAdapter } from './ZhihuAdapter';
import { BilibiliAdapter } from './BilibiliAdapter';
import { XiaohongshuAdapter } from './XiaohongshuAdapter';
const adapters = new Map();
const weChatAdapter = new WeChatAdapter();
const zhihuAdapter = new ZhihuAdapter();
const bilibiliAdapter = new BilibiliAdapter();
const xiaohongshuAdapter = new XiaohongshuAdapter();
adapters.set(weChatAdapter.platformId, weChatAdapter);
adapters.set(zhihuAdapter.platformId, zhihuAdapter);
adapters.set(bilibiliAdapter.platformId, bilibiliAdapter);
adapters.set(xiaohongshuAdapter.platformId, xiaohongshuAdapter);
export class PlatformAdapterFactory {
    adapters = adapters;
    getAdapter(platformId) {
        return this.adapters.get(platformId);
    }
    getAllAdapters() {
        return Array.from(this.adapters.values());
    }
    getPlatformInfo() {
        return this.getAllAdapters().map((adapter) => ({
            id: adapter.platformId,
            name: adapter.platformName,
        }));
    }
    registerAdapter(adapter) {
        this.adapters.set(adapter.platformId, adapter);
    }
}
//# sourceMappingURL=index.js.map