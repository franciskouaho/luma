import admin from 'firebase-admin'
import env from '#start/env'

let app: admin.app.App | null = null

function initializeApp() {
  if (app) {
    return app
  }

  const projectId = env.get('FIREBASE_PROJECT_ID')
  const databaseURL = env.get('FIREBASE_DATABASE_URL', undefined)
  const serviceAccount = env.get('FIREBASE_SERVICE_ACCOUNT', undefined)

  const options: admin.AppOptions = {
    projectId,
  }

  if (databaseURL) {
    options.databaseURL = databaseURL
  }

  if (serviceAccount) {
    try {
      const parsed = JSON.parse(serviceAccount)
      options.credential = admin.credential.cert(parsed)
    } catch (error) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT doit être un JSON valide')
    }
  } else {
    options.credential = admin.credential.applicationDefault()
  }

  app = admin.apps.length ? admin.app() : admin.initializeApp(options)
  return app
}

export function getFirestore() {
  return initializeApp().firestore()
}

export function getAuth() {
  return initializeApp().auth()
}

