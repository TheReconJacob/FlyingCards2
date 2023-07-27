import moment from "moment";
import numeral from "numeral";
import { IOrder } from "../../typings";

type Props = {
  order: IOrder;
};

const Order = ({ order }: Props) => {
  return (
    <div className="relative border rounded-md">
      <div className="p-5 bg-gray-100 text-sm text-gray-600">
        <p>
          If you have an issue inquiry, please email me at{" "}
          <a href="mailto:flyingcards@gmail.com">flyingcards@gmail.com</a>. Please include your Order ID if it's related to your order.
        </p>
      </div>
      <div className="flex items-center space-x-10 p-5 bg-gray-100 text-sm text-gray-600">
        <div>
          <p className="font-bold text-xs">ORDER PLACED</p>
          <p className="font-bold text-xs">
            {moment.unix(order.timestamp).format("DD MMM YYYY")}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold">TOTAL</p>
          <p>
            £{numeral(order.amount).format('£0,0.00')}
          </p>
        </div>

        <p className="text-sm whitespace-nowrap sm:text-lg self-end flex-1 text-right text-fast_blue-light">
          {order.items.length-1} item(s)
        </p>
        <p className="absolute top-2 right-2 w-40 lg:w-72 truncate text-xs whitespace-nowrap">
          ORDER ID: {order.id}
        </p>
      </div>

      <div className="p-5 sm:p-10">
        <div className="flex space-x-6 overflow-x-auto">
          {order.images.map((image, i) => (
            <img
              className="object-contain w-40 h-40"
              key={i}
              src={image}
              alt="image"
              width={128}
              height={80}
            />
          ))}
          <p>
          {order.title}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Order;