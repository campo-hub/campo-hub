import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let credential;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const googleCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const loadServiceAccount = (filePath) => {
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Firebase Admin service account file not found at ${resolvedPath}.`);
  }
  const raw = fs.readFileSync(resolvedPath, 'utf8');
  return JSON.parse(raw);
};

if (serviceAccountPath) {
  const serviceAccount = loadServiceAccount(serviceAccountPath);
  credential = admin.credential.cert(serviceAccount);
} else if (projectId && clientEmail && privateKey) {
  credential = admin.credential.cert({
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  });
} else if (googleCredentialsPath) {
  if (!fs.existsSync(googleCredentialsPath)) {
    throw new Error(
      `GOOGLE_APPLICATION_CREDENTIALS is set to ${googleCredentialsPath}, but that file does not exist.`
    );
  }
  credential = admin.credential.applicationDefault();
} else {
  throw new Error(
    'Firebase Admin SDK configuration is required. Provide either FIREBASE_SERVICE_ACCOUNT_PATH to a valid JSON file, or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY, or set GOOGLE_APPLICATION_CREDENTIALS to a valid credentials file.'
  );
}

admin.initializeApp({
  credential,
});

export async function authenticateFirebase(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or malformed' });
  }

  const idToken = header.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid Firebase ID token' });
  }
}

export { admin };
