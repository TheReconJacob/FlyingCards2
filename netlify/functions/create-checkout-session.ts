import { IProduct } from "../../typings";

type NextApiRequest = {
  body: any;
  cookies: { [key: string]: string };
  query: { [key: string]: string | string[] };
  headers: { [key: string]: string | string[] };
};

type NextApiResponse = {
  statusCode: number;
  send: (data?: any) => void;
};

const stripePromise = import("stripe").then((stripeModule) => {
  const Stripe = stripeModule.default as typeof import("stripe").default;
  return new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2022-08-01",
  });
});

exports.handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("typeof req.body:", typeof req.body);
  console.log("req.body:", req.body);
  console.log("Object.keys(req):", Object.keys(req));
  console.log("Object.keys(res):", Object.keys(res));
  
  const stripe = await stripePromise;
  console.log("create-checkout-session called with req.body:", req.body);
  
  const { items, email } = JSON.parse(req.body);
  console.log("create-checkout-session items:", items);

  const transformedItems = items.map((item: IProduct) => ({
    price_data: {
      currency: "gbp",
      unit_amount: item.price * 100,
      product_data: {
        name: item.title,
        description: item.description,
        images: [item.image],
      },
    },
    quantity: 1,
  }));
  
  console.log("transformedItems:", transformedItems);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["CA", "US", "GB"],
      },
      line_items: transformedItems,
      mode: "payment",
      success_url: `${process.env.HOST}/success`,
      cancel_url: `${process.env.HOST}/checkout`,
      metadata: {
        email,
        images: JSON.stringify(items.map((item: IProduct) => item.image)),
      },
    });
    
    console.log("session created:", session);
    res.statusCode = 200;
    res.send({ id: session.id });
    
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating checkout session:", error.message);
    } else {
      console.error("Error creating checkout session:", error);
    }
    
    res.statusCode = 500;
    res.send({ error });
  }
};