import { collection, doc, getDocs, orderBy, query } from "firebase/firestore";
import moment from "moment";
import { GetServerSidePropsContext } from "next";
import { getSession, useSession } from "next-auth/react";
import db from "../../firebase";
import { IOrder, ISession } from "../../typings";
import Header from "../components/Header";
import Order from "../components/Order";
import { useOrderContext } from '../components/context/OrderContext';
import { useFetchOrders } from '../hooks/UseFetchOrders';

type Props = {};

const Orders = ({}: Props) => {
  const { data: session } = useSession();
  console.log('Session:', session);
  useFetchOrders(session);
  const { orders, loading, error } = useOrderContext();

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <Header />
      <main className="max-w-screen-l max-auto p-10">
        <h1 className="text-3xl border-b mb-2 pb-1 border-[fast_blue]">
          Your Orders
        </h1>
        {session ? (
          <h2>{orders.length} Orders</h2>
        ) : (
          <h2>Please sign in to see your orders</h2>
        )}
        <p>
          If you have an issue inquiry, please email me at{" "}
          <a href="mailto:flyingcards@gmail.com">flyingcards@gmail.com</a>. Please include your Order ID if it's related to your order.
        </p>
        <div className="mt-5 space-y-4">
          {orders?.map((order) => (
            <Order key={order.id} order={order} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Orders;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  // Get user logged in credentials
  const session: ISession | null = await getSession(context);
  console.log('Session before:', session);

  return {
    props: {
      session,
    },
  };
};