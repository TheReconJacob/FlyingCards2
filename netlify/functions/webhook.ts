import type Stripe from 'stripe';
import paypal from "@paypal/checkout-server-sdk";
import type { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';

const environment = new paypal.core.LiveEnvironment(
  process.env.PAYPAL_CLIENT_ID as string,
  process.env.PAYPAL_CLIENT_SECRET as string
);
const client = new paypal.core.PayPalHttpClient(environment);

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

  let paymentId: string | undefined;
  let amount: number | undefined;
  let amount_shipping: number | undefined;
  let images: string[] | undefined;
  let title: string[] | undefined;
  let email: string | undefined;

  const stripe = await stripePromise;
  console.log("WORK YOU IDIOT!");
  if (session.payment_method_types && session.payment_method_types.includes("card")) {
    // Get the id of the Stripe Payment object
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

    if (
      paymentIntent.charges &&
      paymentIntent.charges.data.length > 0 &&
      paymentIntent.charges.data[0].payment_method
    ) {
      paymentId = paymentIntent.charges.data[0].payment_method as string;
    }
    amount = session.amount_total / 100;
    amount_shipping = session.total_details.amount_shipping / 100;
    images = JSON.parse(session.metadata.images);
    title = JSON.parse(session.metadata.title);
    email = session.metadata.email;
  } else if (session.resource && session.resource.purchase_units && JSON.parse(session.resource.purchase_units[0].custom_id).itemIds) {
    const orderId = session.resource.id;

    // Create an instance of the OrdersCaptureRequest class
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);

    // Call the capture method to capture the payment
    let captureResponse;
    try {
      captureResponse = await client.execute(captureRequest);
      console.log('Capture:', captureResponse.result);
    } catch (err) {
      console.error(err);
    }
    // Get the id of the PayPal Payment object
    const customData = JSON.parse(session.resource.purchase_units[0].custom_id);
    paymentId = session.resource.id;
    amount = parseFloat(session.resource.purchase_units[0].amount.value);
    amount_shipping = parseFloat(session.resource.purchase_units[0].amount.breakdown.shipping.value);
    images = ['https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/832px-No-Image-Placeholder.svg.png'];
    title = [];
    for (let item of session.resource.purchase_units[0].items) {
        title.push(item.name);
    }
    email = customData.email;
  }
  
  console.log("session data is " + JSON.stringify(session, null, 2));
  console.log("information is: ", "payment id: ", paymentId, "amount: ", amount, "amount shipping: ", amount_shipping, "images: ", images, "title: ", title, "email: ", email);
  if (paymentId) {
    await app
      .firestore()
      .collection("users")
      .doc(email as string)
      .collection("orders")
      .doc(session.id)
      .set({
        amount,
        amount_shipping,
        images,
        title,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        id: paymentId,
      });

    console.log("11");
    // Update the last updated timestamp for the user's orders
    const lastUpdatedRef = app.firestore().collection('lastUpdated');
    console.log("22");
    const lastUpdatedQuery = lastUpdatedRef
      .where('type', '==', 'orders')
      .where('email', '==', email);
    console.log("33");
    const lastUpdatedSnapshot = await lastUpdatedQuery.get();
    console.log("44");
    const lastUpdatedDoc = lastUpdatedSnapshot.docs[0];
    console.log("55");
    if (lastUpdatedDoc) {
      console.log("66");
      await lastUpdatedDoc.ref.update({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("77");
      console.log(`SUCCESS: Order ${session.id} has been added to the DB`);
    } else {
      console.log("88");
      // Timestamp does not exist, create it
      await lastUpdatedRef.add({
        type: 'orders',
        email,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`SUCCESS: Order ${session.id} has been added to the DB`);
    }
  }

  // Parse item IDs and quantities from checkout session metadata
  let itemIds: string[] = [];
  let quantities: number[] = [];
  console.log("1111");
  console.log(session.resource.purchase_units[0]);
  if (session.metadata && session.metadata.itemIds && session.metadata.quantities) {
    itemIds = JSON.parse(session.metadata.itemIds);
    quantities = JSON.parse(session.metadata.quantities);
  } else {
    for (const item of session.resource.purchase_units[0].items) {
      quantities.push(parseInt(item.quantity));
    }
    const customData = JSON.parse(session.resource.purchase_units[0].custom_id)
    console.log(customData.itemIds);
    itemIds = customData.itemIds;
  }

  // Update quantity value of each item in Firebase
  for (const [index, itemId] of (itemIds as string[]).entries()) {
    // Query products collection by id field
    const itemQuery = admin
      .firestore()
      .collection("products")
      .where("id", "==", itemId);
    const itemQuerySnapshot = await itemQuery.get();
    const itemDoc = itemQuerySnapshot.docs[0];

    // Find the corresponding quantity in the quantities array
    const quantity = (quantities as number[])[index];

    // Check if quantity is defined and not null
    if (quantity !== null) {
      // Decrement item quantity by purchased quantity
      await itemDoc.ref.update({
        quantity: admin.firestore.FieldValue.increment(-quantity),
      });
    
      // Update the last updated timestamp for the products collection
      const lastUpdatedRef = app.firestore().collection('lastUpdated');
      const lastUpdatedQuery = lastUpdatedRef.where('type', '==', 'products');
      const lastUpdatedSnapshot = await lastUpdatedQuery.get();
      const lastUpdatedDoc = lastUpdatedSnapshot.docs[0];
      if (lastUpdatedDoc) {
        await lastUpdatedDoc.ref.update({
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // Timestamp does not exist, create it
        await lastUpdatedRef.add({
          type: 'products',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }      
  }

  console.log(`SUCCESS: Quantity has been updated`);
};

exports.handler = async (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
  if (event.httpMethod === "POST") {
    const payload = event.body;

    let checkoutEvent;
    let sig;

    // Check if the event is from Stripe or PayPal
    if (event.headers["stripe-signature"]) {
      sig = event.headers["stripe-signature"];
    } else if (event.headers["paypal-auth-algo"]) {
      checkoutEvent = {
        type: "checkout.order.approved",
        data: {
          object: JSON.parse(payload as string),
        },
      };
    }

    // Verify that the Event posted came from Stripe
    if (sig) {
      try {
        if (payload === null) {
          throw new Error('Missing request body');
        }
        const stripe = await stripePromise;
        checkoutEvent = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
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
    }

    // Handle the checkout.session.completed or checkout.order.approved event
    if (
      checkoutEvent &&
      (checkoutEvent.type === "checkout.session.completed" ||
        checkoutEvent.type === "checkout.order.approved")
    ) {
      const session = checkoutEvent.data.object;

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