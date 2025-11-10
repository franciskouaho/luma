import env from '#start/env'
import { defineConfig } from '@adonisjs/ally'
import { TikTokService } from 'adonis-ally-tiktok'

const allyConfig = defineConfig({
  tiktok: TikTokService({
    clientId: env.get('TIKTOK_CLIENT_ID'),
    clientSecret: env.get('TIKTOK_CLIENT_SECRET'),
    callbackUrl: env.get('TIKTOK_REDIRECT_CALLBACK'),
    scopes: ['user.info.basic', 'video.list', 'video.publish'],
  }),
})
export default allyConfig