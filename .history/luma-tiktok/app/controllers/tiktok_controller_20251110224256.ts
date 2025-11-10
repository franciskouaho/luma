import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuid } from 'uuid'
import env from '#start/env'
import { getAuth, getFirestore } from '#services/firebase_admin'
import admin from 'firebase-admin'
import type { TikTokDriver } from 'adonis-ally-tiktok'

type TikTokSession = {
  sessionToken: string
  expiresAt: number
  tiktok: {
    accessToken: string
    refreshToken: string
    tokenExpiry: number
    openId: string
    scope?: string
    userInfo?: Record<string, unknown>
  }
}

const SESSION_TTL_MS = 5 * 60 * 1000

export default class TikTokController {
  public async redirect({ ally }: HttpContext) {
    const tiktok = ally.use('tiktok') as TikTokDriver
    return tiktok.stateless().redirect()
  }

  public async callback({ response, ally }: HttpContext) {
    const tiktok = ally.use('tiktok') as TikTokDriver
    tiktok.stateless()

    if (tiktok.accessDenied()) {
      return this.redirectToApp(response, null, 'Accès refusé par l’utilisateur')
    }

    if (tiktok.stateMisMatch()) {
      return this.redirectToApp(response, null, 'State invalide')
    }

    if (tiktok.hasError()) {
      const errorMessage = tiktok.getError() || 'Erreur lors de la connexion TikTok'
      return this.redirectToApp(response, null, errorMessage)
    }

    const user = await tiktok.user()
    const tokens = user.token

    if (!tokens?.token) {
      return this.redirectToApp(response, null, 'Token TikTok manquant')
    }

    let scopeValue: string | undefined
    if (Array.isArray(tokens.scope) && tokens.scope.length > 0) {
      scopeValue = tokens.scope.join(',')
    } else if (typeof tokens.scope === 'string') {
      scopeValue = tokens.scope
    }

    const sessionToken = uuid()
    const session: TikTokSession = {
      sessionToken,
      expiresAt: Date.now() + SESSION_TTL_MS,
      tiktok: {
        accessToken: tokens.token,
        refreshToken: tokens.refreshToken ?? '',
        tokenExpiry: Date.now() + (tokens.expiresIn ?? 0) * 1000,
        openId: user.id ?? '',
        scope: scopeValue,
        userInfo: {
          nickName: user.nickName,
          avatarUrl: user.avatarUrl,
          email: user.email,
          original: user.original,
        },
      },
    }

    await saveSession(session)

    const deepLinkBase = env.get('TIKTOK_DEEP_LINK_URL')
    const deepLink = `${deepLinkBase}?session=${sessionToken}`
    return this.renderRedirect(response, deepLink)
  }

  public async consumeSession({ request, response }: HttpContext) {
    const { sessionToken, firebaseToken: firebaseTokenFromBody } = request.only([
      'sessionToken',
      'firebaseToken',
    ])
    const firebaseToken =
      firebaseTokenFromBody ?? request.header('authorization') ?? request.header('Authorization')

    if (!sessionToken) {
      return response.badRequest({ success: false, error: 'Session token manquant' })
    }

    if (!firebaseToken) {
      return response.unauthorized({ success: false, error: 'Firebase token manquant' })
    }

    const session = await getSession(sessionToken)

    if (!session) {
      return response.notFound({ success: false, error: 'Session introuvable ou expirée' })
    }

    try {
      const firebaseUser = await verifyFirebaseToken(firebaseToken)

      await persistTikTokConnection(firebaseUser.uid, session.tiktok)
      await deleteSession(sessionToken)

      return response.ok({
        success: true,
        userInfo: session.tiktok.userInfo,
      })
    } catch (error) {
      console.error('[consumeSession] Token Firebase invalide', error)
      return response.unauthorized({ success: false, error: 'Token Firebase invalide' })
    }
  }

  private redirectToApp(response: HttpContext['response'], token: string | null, error?: string) {
    const base = env.get('TIKTOK_DEEP_LINK_URL')
    const url = new URL(base)

    if (token) {
      url.searchParams.set('session', token)
    } else if (error) {
      url.searchParams.set('error', error)
    }

    return this.renderRedirect(response, url.toString())
  }

  private renderRedirect(response: HttpContext['response'], deepLink: string) {
    return response.status(200).type('text/html').send(renderRedirectHtml(deepLink))
  }
}

async function saveSession(_session: TikTokSession) {
  const firestore = getFirestore()
  const docRef = firestore.collection('tiktok_sessions').doc(_session.sessionToken)

  await docRef.set({
    ..._session,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })
}

async function getSession(_token: string): Promise<TikTokSession | null> {
  const firestore = getFirestore()
  const doc = await firestore.collection('tiktok_sessions').doc(_token).get()

  if (!doc.exists) {
    return null
  }

  const data = doc.data() as TikTokSession

  if (!data) {
    return null
  }

  if (data.expiresAt < Date.now()) {
    await doc.ref.delete()
    return null
  }

  return data
}

async function deleteSession(_token: string) {
  const firestore = getFirestore()
  await firestore.collection('tiktok_sessions').doc(_token).delete()
}

async function verifyFirebaseToken(_token: string): Promise<{ uid: string }> {
  const auth = getAuth()
  const cleaned = _token.trim()
  const token = cleaned.startsWith('Bearer ') ? cleaned.slice(7) : cleaned
  const decoded = await auth.verifyIdToken(token)
  return { uid: decoded.uid }
}

async function persistTikTokConnection(_uid: string, _data: TikTokSession['tiktok']) {
  const firestore = getFirestore()
  await firestore
    .collection('users')
    .doc(_uid)
    .set(
      {
        tiktok: {
          ..._data,
          connectedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    )
}

function renderRedirectHtml(url: string) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Connexion TikTok | Luma</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        background: #111;
        color: #fff;
        padding: 20px;
        text-align: center;
      }
      a {
        color: #FC2652;
      }
      .container {
        max-width: 420px;
      }
      .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid rgba(255, 255, 255, 0.2);
        border-top-color: #FC2652;
        border-radius: 50%;
        margin: 30px auto;
        animation: spin 0.9s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Connexion TikTok</h1>
      <p>Redirection vers l’application…</p>
      <div class="spinner"></div>
      <p>
        Si rien ne se passe, <a id="manualLink" href="${url}">clique ici</a>.
      </p>
    </div>
    <script>
      setTimeout(function () {
        window.location.href = "${url}";
      }, 500);
    </script>
  </body>
</html>`
}
