import paypal from "@paypal/checkout-server-sdk";
import { IProduct } from "../../typings";
import Big from "big.js";
const clm: any = require('country-locale-map');

interface Item {
  name: string;
  unit_amount: {
    currency_code: string;
    value: string;
  };
  quantity: string;
}

type NextApiRequest = {
  body: any;
  cookies: { [key: string]: string };
  query: { [key: string]: string | string[] };
  headers: { [key: string]: string | string[] };
};

type NextApiResponse = {
  statusCode: number;
};

const environment = new paypal.core.LiveEnvironment(
  process.env.PAYPAL_CLIENT_ID as string,
  process.env.PAYPAL_CLIENT_SECRET as string
);
const client = new paypal.core.PayPalHttpClient(environment);

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
  const { items, email, shippingCountry, paymentMethod, streetAddress1, streetAddress2, city, stateProvince, postalCode } = JSON.parse(event.body);

  // Calculate shipping cost based on selected shipping country
  let shippingCost = calculate_shipping(items.length, shippingCountry);

  // Round shippingCost to 2 decimal places using big.js
  shippingCost = new Big(shippingCost).round(2);

  if (paymentMethod === "stripe") {
    const stripe = await stripePromise;

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
          title:
            JSON.stringify(
              items
                .map((item: IProduct) => item.title)
                .join(", ")
                .slice(0, 400)
            ) + (items.length > 1 ? "..." : ""),
          itemIds:
            JSON.stringify(itemIds),
          quantities:
            JSON.stringify(quantities),
        },
      });

      callback(null, {
        statusCode:
          200,
        body:
          JSON.stringify({ id:
            session.id }),
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error creating checkout session:", error.message);
      } else {
        console.error("Error creating checkout session:", error);
      }

      callback(null, {
        statusCode:
          500,
        body:
          JSON.stringify({ error }),
      });
    }
    // Stripe code ends here
  } else if (paymentMethod === "paypal") {
    // PayPal code starts here
    let locale = clm.getLocaleByAlpha2(shippingCountry);
    locale = locale.replace('_', '-');
    
    // Transform items for PayPal order
    const transformedItemsPayPal = items.map((item:IProduct) => ({
      unit_amount: {
        currency_code: "GBP",
        value: new Big(item.price).round(2).toFixed(2),
      },
      quantity: "1",
      name: item.title,
      description: item.description,
    }));

    const totalQuantity = transformedItemsPayPal.reduce(
      (acc: number, curr: { quantity: string }) => acc + Number(curr.quantity),
      0
    );
        
    const newShippingCost = calculate_shipping(totalQuantity, shippingCountry);
    
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "GBP",
            value: transformedItemsPayPal.reduce(
              (acc: Big, curr: Item) =>
                acc.plus(new Big(curr.unit_amount.value).times(curr.quantity)),
              new Big(0)
            ).plus(newShippingCost).toFixed(2),
            breakdown: {
              item_total: {
                currency_code: "GBP",
                value: transformedItemsPayPal.reduce(
                  (acc: Big, curr: Item) =>
                    acc.plus(new Big(curr.unit_amount.value).times(curr.quantity)),
                  new Big(0)
                ).toFixed(2),
              },
              shipping: {
                currency_code: "GBP",
                value: newShippingCost.toFixed(2),
              },
            },
          },
          items: transformedItemsPayPal,
          shipping: {
            address: {
              address_line_1: streetAddress1,
              admin_area_2: city,
              postal_code: postalCode,
              country_code: shippingCountry,
            }
          }
        },
      ],
      application_context: {
        brand_name:
          process.env.PAYPAL_BRAND_NAME,
        landing_page:
          "BILLING",
        user_action:
          "PAY_NOW",
        return_url:
          `${process.env.HOST}/success`,
        cancel_url:
          `${process.env.HOST}/checkout`,
        shipping_preference: "SET_PROVIDED_ADDRESS",
        locale: locale,
      },
    });
    
    // Add streetAddress2 and stateProvince if they are defined
    if (streetAddress2) {
      request.body.purchase_units[0].shipping.address.address_line_2 = streetAddress2;
    }
    if (stateProvince) {
      request.body.purchase_units[0].shipping.address.admin_area_1 = stateProvince;
    }
        
    const response = await client.execute(request);
    
    const approvalUrl = response.result.links.find((link: { rel: string; href: string }) => link.rel === 'approve').href;

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({ id: response.result.id, approvalUrl })
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