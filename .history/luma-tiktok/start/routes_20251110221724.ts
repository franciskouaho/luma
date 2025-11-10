/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const TikTokController = () => import('#controllers/tiktok_controller')

router.get('/', async () => {
  return {
    status: 'ok',
  }
})

router.get('/auth/tiktok/redirect', [TikTokController, 'redirect'])
router.get('/auth/tiktok/callback', [TikTokController, 'callback'])
router.post('/auth/tiktok/session', [TikTokController, 'consumeSession'])

router.get('/api/auth/tiktok/redirect', [TikTokController, 'redirect'])
router.get('/api/auth/tiktok/callback', [TikTokController, 'callback'])
router.post('/api/auth/tiktok/session', [TikTokController, 'consumeSession'])
