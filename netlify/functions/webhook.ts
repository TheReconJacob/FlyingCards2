import type Stripe from 'stripe';
import type { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';

const adminPromise = import("firebase-admin").then((adminModule) => {
  const admin = adminModule.default;
  return { admin };
});

const microPromise = import("micro").then((microModule) => {
  const { buffer } = microModule;
  return { buffer };
});

const stripePromise = import("stripe").then((stripeModule) => {
  const Stripe = stripeModule.default;
  if (typeof process.env.STRIPE_SECRET_KEY === "string") {
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2022-08-01",
    });
  } else {
    throw new Error("STRIPE_SECRET_KEY environment variable is not defined");
  }
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

const endpointSecret = process.env.STRIPE_SIGNING_SECRET;
if (typeof endpointSecret !== 'string') {
  throw new Error('Missing or invalid STRIPE_ENDPOINT_SECRET environment variable');
}

const fulfillOrder = async (session: any) => {
  const { admin } = await adminPromise;
  // Define the app variable
  const app = await appPromise;

  // Get the id of the Stripe Payment object
  const stripe = await stripePromise;
  const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

  if (
    paymentIntent.charges &&
    paymentIntent.charges.data.length > 0 &&
    paymentIntent.charges.data[0].payment_method
  ) {
    const paymentId = paymentIntent.charges.data[0].payment_method as string;

    await app
      .firestore()
      .collection("users")
      .doc(session.metadata.email)
      .collection("orders")
      .doc(session.id)
      .set({
        amount: session.amount_total / 100,
        amount_shipping: session.total_details.amount_shipping / 100,
        images: JSON.parse(session.metadata.images),
        title: JSON.parse(session.metadata.title),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        id: paymentId,
      });
  }

  console.log(`SUCCESS: Order ${session.id} has been added to the DB`);

  // Parse item IDs and quantities from checkout session metadata
  const itemIds = JSON.parse(session.metadata.itemIds);
  const quantities = JSON.parse(session.metadata.quantities);

  // Get purchased items from checkout session
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

  // Update quantity value of each item in Firebase
  for (const [index, itemId] of itemIds.entries()) {
    // Query products collection by id field
    const itemQuery = admin
      .firestore()
      .collection("products")
      .where("id", "==", itemId);
    const itemQuerySnapshot = await itemQuery.get();

    // Check if query returned any documents
    if (!itemQuerySnapshot.empty) {
      // Get first document from query snapshot
      const itemDoc = itemQuerySnapshot.docs[0];

      // Find the corresponding quantity in the quantities array
      const quantity = quantities[index];

      // Check if quantity is defined and not null
      if (quantity !== null) {
        // Decrement item quantity by purchased quantity
        await itemDoc.ref.update({
          quantity: admin.firestore.FieldValue.increment(-quantity),
        });
      }
    }
  }

  console.log(`SUCCESS: Order ${session.id} has been added to the DB`);
};

exports.handler = async (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
  if (event.httpMethod === "POST") {
    const payload = event.body;
    const sig = event.headers["stripe-signature"];

    let stripeEvent;

    // Verify that the Event posted came from Stripe
    try {
      if (payload === null) {
        throw new Error('Missing request body');
      }
      if (sig === undefined) {
        throw new Error('Missing stripe-signature header');
      }
      const stripe = await stripePromise;
      stripeEvent = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      if (err instanceof Error) {
        console.log("ERROR", err.message);
      } else {
        console.log("ERROR", err);
      }
      return callback(null, {
        statusCode: 400,
        body: `Webhook error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }
    // Handle the checkout.session.completed event
    if (stripeEvent.type === "checkout.session.completed") {
      const session = stripeEvent.data.object;

      // Fullfill order
      return fulfillOrder(session)
        .then(() => callback(null, { statusCode: 200 }))
        .catch((err) => {
          callback(null, {
            statusCode: 400,
            body: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          });
        });
    }
  }
};