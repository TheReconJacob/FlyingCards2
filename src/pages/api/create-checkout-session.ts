import { NextApiRequest, NextApiResponse } from "next";
import { IProduct } from "../../../typings";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("create-checkout-session called with req.body:", req.body);
  const { items, email } = req.body;

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
    res.status(200).json({ id: session.id });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating checkout session:", error.message);
    } else {
      console.error("Error creating checkout session:", error);
    }
  }
};