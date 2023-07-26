import { IProduct } from "../../typings";

type NextApiRequest = {
  body: any;
  cookies: { [key: string]: string };
  query: { [key: string]: string | string[] };
  headers: { [key: string]: string | string[] };
};

type NextApiResponse = {
  statusCode: number;
};

const stripePromise = import("stripe").then((stripeModule) => {
  const Stripe = stripeModule.default as typeof import("stripe").default;
  return new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2022-08-01",
  });
});

exports.handler = async (
  event: NextApiRequest,
  context: NextApiResponse,
  callback: Function
) => {
  const stripe = await stripePromise;

  const { items, email, shippingCountry } = JSON.parse(event.body);

  // Calculate shipping cost based on selected shipping country
  let shippingCost = calculate_shipping(items.length, shippingCountry);

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

  // Add a line item for the shipping cost
  transformedItems.push({
    price_data: {
      currency: "gbp",
      product_data: {
        name: "Shipping",
      },
      unit_amount: shippingCost * 100,
    },
    quantity: 1,
  });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      // Restrict allowed shipping countries to only include the selected shipping country
      shipping_address_collection: {
        allowed_countries: [shippingCountry],
      },
      line_items: transformedItems,
      mode: "payment",
      success_url: `${process.env.HOST}/success`,
      cancel_url: `${process.env.HOST}/checkout`,
      metadata: {
        email,
        // Only include unique image URLs in the `images` field
        images: JSON.stringify(
          Array.from(new Set(items.map((item: IProduct) => item.image)))
        ),
      },
    });

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating checkout session:", error.message);
    } else {
      console.error("Error creating checkout session:", error);
    }

    callback(null, {
      statusCode: 500,
      body: JSON.stringify({ error }),
    });
  }
};

function calculate_shipping(quantity:number, country:string) : number{
// Calculate shipping cost based on quantity and country
let shipping_cost = 0;
if (country === 'GB') {
if(quantity <= 21)
{
shipping_cost = 1.00;
}
else if (quantity >= 22 && quantity <= 55) {
shipping_cost = 2.10;
}
else if(quantity > 55 && quantity <= 108)
{
shipping_cost = 2.65;
}
else if(quantity >108 && quantity <=159)
{
shipping_cost =2.95;
}
else{
shipping_cost=3.75;
}
} else {
if(quantity <=21)
{
shipping_cost=5.00;
}
else if (quantity >=22 && quantity <=55){
shipping_cost=7.00;
}
else if(quantity >55 && quantity <=108)
{
shipping_cost=9.00;
}
else if(quantity >108 && quantity <=159)
{
shipping_cost=11.00;
}
else{
shipping_cost=13.00;
}
}
return shipping_cost;
}