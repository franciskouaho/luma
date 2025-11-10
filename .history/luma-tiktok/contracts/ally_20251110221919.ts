import type { TikTokConfig, TikTokDriver } from 'adonis-ally-tiktok'

declare module '@adonisjs/ally/types' {
  interface SocialProviders {
    tiktok: {
      implementation: TikTokDriver
      config: TikTokConfig
    }
  }
}
