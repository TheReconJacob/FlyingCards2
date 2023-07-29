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

  // Cut off shippingCost to 2 decimal places
  shippingCost = Math.floor(shippingCost * 100) / 100;

  const transformedItems = items.map((item: IProduct) => {
    let product_data: { name: string; images: string[]; description?: string } = {
      name: item.title,
      images: [item.image],
    };
    if (item.description) {
      product_data.description = item.description;
    }
    
    // Cut off item.price to 2 decimal places
    let price = Math.floor(item.price * 100) / 100;
    
    return {
      price_data: {
        currency: "gbp",
        unit_amount: Math.trunc(price * 100),
        product_data,
      },
      quantity: 1,
    };
  });

  // Add a line item for the shipping cost
  transformedItems.push({
    price_data: {
      currency: "gbp",
      product_data: {
        name: "Shipping",
      },
      unit_amount: Math.trunc(shippingCost * 100),
    },
    quantity: 1,
  });

  try {
    // Get unique image URLs
    let uniqueImageUrls = Array.from(
      new Set(items.map((item: IProduct) => item.image))
    );

    // Remove image URLs until the `images` field is under the 500 character limit
    let imagesField = JSON.stringify(uniqueImageUrls);
    while (imagesField.length > 500 && uniqueImageUrls.length > 0) {
      uniqueImageUrls.pop();
      imagesField = JSON.stringify(uniqueImageUrls);
    }
    
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
        images: imagesField,
        title: JSON.stringify(
          items
              .map((item: IProduct) => item.title)
              .join(", ")
              .slice(0, 400) + (items.length > 1 ? "..." : "")
        ),
        itemIds: JSON.stringify(
          items
              .map((item: IProduct) => item.id)
              .join(", ")
              .slice(0, 400) + (items.length > 1 ? "..." : "")
        ),
        quantities: JSON.stringify(
            transformedItems
                .map((item: IProduct) => item.quantity)
                .join(", ")
                .slice(0, 400) + (transformedItems.length > 1 ? "..." : "")
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
shipping_cost=3.20;
}
else if (quantity >=22 && quantity <=55){
shipping_cost=12.00;
}
else if(quantity >55 && quantity <=108)
{
shipping_cost=12.00;
}
else if(quantity >108 && quantity <=159)
{
shipping_cost=12.00;
}
else{
shipping_cost=12.00;
}
}
return shipping_cost;
}