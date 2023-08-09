import { IProduct } from "../../typings";
import Big from "big.js";

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

  // Round shippingCost to 2 decimal places using big.js
  shippingCost = new Big(shippingCost).round(2);

  const transformedItems = items.map((item: IProduct) => {
    let product_data: { name: string; images: string[]; description?: string } = {
      name: item.title,
      images: [item.image],
    };
    if (item.description) {
      product_data.description = item.description;
    }
    
    // Round item.price to 2 decimal places using big.js
    let price = new Big(item.price).round(2);
    
    return {
      price_data: {
        currency: "gbp",
        unit_amount: price.times(100).toFixed(0),
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
      unit_amount: shippingCost.times(100).toFixed(0),
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
    
    const itemIds = items.map((item: IProduct) => item.id);
    const quantities = transformedItems.map((item: IProduct) => item.quantity);

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
        itemIds: JSON.stringify(itemIds),
        quantities: JSON.stringify(quantities),  
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

function calculate_shipping(quantity: number, country: string): Big {
  // Calculate shipping cost based on quantity and country
  let shipping_cost = new Big(0);
  if (country === "GB") {
    if (quantity <= Number(process.env.GB_QTY_1)) {
      shipping_cost = process.env.GB_COST_1 ? new Big(process.env.GB_COST_1) : new Big(0);
    } else if (quantity <= Number(process.env.GB_QTY_2)) {
      shipping_cost = process.env.GB_COST_2 ? new Big(process.env.GB_COST_2) : new Big(0);
    } else if (quantity <= Number(process.env.GB_QTY_3)) {
      shipping_cost = process.env.GB_COST_3 ? new Big(process.env.GB_COST_3) : new Big(0);
    } else if (quantity <= Number(process.env.GB_QTY_4)) {
      shipping_cost = process.env.GB_COST_4 ? new Big(process.env.GB_COST_4) : new Big(0);
    } else {
      shipping_cost = process.env.GB_COST_5 ? new Big(process.env.GB_COST_5) : new Big(0);
    }
  } else if (country === "US") {
    if (quantity <= Number(process.env.US_QTY_1)) {
      shipping_cost = process.env.US_COST_1 ? new Big(process.env.US_COST_1) : new Big(0);
    } else if (quantity <= Number(process.env.US_QTY_2)) {
      shipping_cost = process.env.US_COST_2 ? new Big(process.env.US_COST_2) : new Big(0);
    } else if (quantity <= Number(process.env.US_QTY_3)) {
      shipping_cost = process.env.US_COST_3 ? new Big(process.env.US_COST_3) : new Big(0);
    } else if (quantity <= Number(process.env.US_QTY_4)) {
      shipping_cost = process.env.US_COST_4 ? new Big(process.env.US_COST_4) : new Big(0);
    } else {
      shipping_cost = process.env.US_COST_5 ? new Big(process.env.US_COST_5) : new Big(0);
    }
  } else {
    if (quantity <= Number(process.env.OTHER_QTY_1)) {
      shipping_cost = process.env.OTHER_COST_1 ? new Big(process.env.OTHER_COST_1) : new Big(0);
    } else if (quantity <= Number(process.env.OTHER_QTY_2)) {
      shipping_cost = process.env.OTHER_COST_2 ? new Big(process.env.OTHER_COST_2) : new Big(0);
    } else if (quantity <= Number(process.env.OTHER_QTY_3)) {
      shipping_cost = process.env.OTHER_COST_3 ? new Big(process.env.OTHER_COST_3) : new Big(0);
    } else if (quantity <= Number(process.env.OTHER_QTY_4)) {
      shipping_cost = process.env.OTHER_COST_4 ? new Big(process.env.OTHER_COST_4) : new Big(0);
    } else {
      shipping_cost = process.env.OTHER_COST_5 ? new Big(process.env.OTHER_COST_5) : new Big(0);
    }
  }
  return shipping_cost;
}