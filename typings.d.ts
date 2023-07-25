export interface IProduct {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
  hasFast?: boolean;
  quantity: number;
}

export interface IOrder {
  id: number;
  amount: number;
  amount_shipping: number;
  items: { [key: string]: any };
  timestamp: number;
  images: string[];
}

export interface ISession {
  user: {
    name: string;
    email: string;
    image: string;
    address: string;
  } & DefaultSession["user"];
  expires: string;
}
