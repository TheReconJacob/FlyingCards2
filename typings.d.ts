export interface IProduct {
  id: string;
  title: string;
  price: number;
  description?: string;
  category: string;
  subcategory?: string;
  subsubcategory?: string;
  image: string;
  quantity: number;
}

export interface IOrder {
  id: number;
  title: string;
  amount: number;
  amount_shipping: number;
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
