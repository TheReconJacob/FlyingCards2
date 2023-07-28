import { IProduct } from '../../typings';

const adminPromise = import("firebase-admin").then((adminModule) => {
  const admin = adminModule.default;
  return { admin };
});

// Secure a connection to Firebase from backend
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/gm, "\n")
    : undefined,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

const appPromise = adminPromise.then(({ admin }) => {
  return !admin.apps.length
    ? admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    : admin.app();
});

exports.handler = async () => {
  const app = await appPromise;
  const db = app.firestore();
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  const categories = snapshot.docs.map(doc => (doc.data() as IProduct).category);
  return {
    statusCode: 200,
    body: JSON.stringify([...new Set(categories)])
  };
}