import { BilibiliArticlePlatform } from './BilibiliArticle'
import { BilibiliVideoPlatform } from './BilibiliVideo'
import { BilibiliDynamicPlatform } from './BilibiliDynamic'

export {
  BilibiliArticlePlatform,
  BilibiliVideoPlatform,
  BilibiliDynamicPlatform,
}

export function getBilibiliPlatform(submissionType: string): BilibiliArticlePlatform | BilibiliVideoPlatform | BilibiliDynamicPlatform {
  switch (submissionType) {
    case 'video':
      return new BilibiliVideoPlatform()
    case 'dynamic':
      return new BilibiliDynamicPlatform()
    case 'article':
    default:
      return new BilibiliArticlePlatform()
  }
}
