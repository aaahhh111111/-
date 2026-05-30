import { PlatformAdapter } from './types'
import { WeChatAdapter } from './WeChatAdapter'
import { ZhihuAdapter } from './ZhihuAdapter'
import { BilibiliAdapter } from './BilibiliAdapter'
import { XiaohongshuAdapter } from './XiaohongshuAdapter'

export { PlatformAdapter, PlatformContent, ContentInput, PublishResult } from './types'

const adapters: Map<string, PlatformAdapter> = new Map()

const weChatAdapter = new WeChatAdapter()
const zhihuAdapter = new ZhihuAdapter()
const bilibiliAdapter = new BilibiliAdapter()
const xiaohongshuAdapter = new XiaohongshuAdapter()

adapters.set(weChatAdapter.platformId, weChatAdapter)
adapters.set(zhihuAdapter.platformId, zhihuAdapter)
adapters.set(bilibiliAdapter.platformId, bilibiliAdapter)
adapters.set(xiaohongshuAdapter.platformId, xiaohongshuAdapter)

export class PlatformAdapterFactory {
  private adapters = adapters

  getAdapter(platformId: string): PlatformAdapter | undefined {
    return this.adapters.get(platformId)
  }

  getAllAdapters(): PlatformAdapter[] {
    return Array.from(this.adapters.values())
  }

  getPlatformInfo(): Array<{ id: string; name: string }> {
    return this.getAllAdapters().map((adapter) => ({
      id: adapter.platformId,
      name: adapter.platformName,
    }))
  }

  registerAdapter(adapter: PlatformAdapter): void {
    this.adapters.set(adapter.platformId, adapter)
  }
}
