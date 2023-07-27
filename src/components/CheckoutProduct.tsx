import { StarIcon } from "@heroicons/react/24/solid";
import numeral from "numeral";
import { useDispatch, useSelector } from "react-redux";
import { IProduct } from "../../typings";
import { addToBasket, removeFromBasket, selectItems } from "../slices/basketSlice";

type Props = {
  product: IProduct;
};

const CheckoutProduct = ({ product }: Props) => {
  const { id, title, price, description, category, image, rating, hasFast, quantity } = product;
  const { rate } = rating;
  const dispatch = useDispatch();
  
  // Call useSelector at the top level of the component
  const basketItems = useSelector(selectItems);

  const addItemToBasket = () => {
    const product = {
      id,
      title,
      price,
      description,
      category,
      image,
      rating,
      hasFast,
      quantity,
    };
    
    // Check if there are enough items available before adding to basket
    const itemCount = basketItems.filter(item => item.id === id).length;
    
    if (itemCount < quantity) {
      // Send product id to Redux Store to remove from basket
      dispatch(addToBasket(product));
    } else {
      console.warn(`Can't add more than ${quantity} of product (id: ${id}) to basket`);
    }
  };
  
  const removeItemFromBasket = () => {
    // Send product to Redux Store as a basket slice action
    dispatch(removeFromBasket({id}));
  };

  return (
    <div className="grid grid-cols-5">
      <img
        className="object-contain"
        src={image}
        width={200}
        height={200}
        alt={title}
      />
      {/* middle */}
      <div className="col-span-3 mx-5">
        <p>{title}</p>
        <p className="text-xs my-2 line-clamp-3">{description}</p>
        £{numeral(price).format('£0,0.00')}
      </div>
      {/* Right */}
      <div className="flex flex-col space-y-2 my-auto justify-self-end">
        <button onClick={addItemToBasket} className="button mt-auto">Add to Basket</button>
        <button onClick={removeItemFromBasket} className="button mt-auto">Remove from Basket</button>
      </div>
    </div>
  );
};

export default CheckoutProduct;