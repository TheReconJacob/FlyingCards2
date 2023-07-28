import { StarIcon } from "@heroicons/react/24/solid";
import numeral from "numeral";
import { useDispatch, useSelector } from "react-redux";
import { IProduct } from "../../typings";
import { addToBasket, selectItems } from "../slices/basketSlice";

type Props = {
  product: IProduct;
};

const Product: React.FC<Props> = ({ product }: Props) => {
  const { id, title, price, description, category, image, rating, quantity } = product;
  const { rate } = rating;
  const hasFast = rate > 4 ? true : false;
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
      // Send product to Redux Store as a basket slice action
      dispatch(addToBasket({...product, hasFast}));
    } else {
      console.warn(`Can't add more than ${quantity} of product (id: ${id}) to basket`);
    }
  };

  if (quantity === 0) return null;

  return (
    <>
      <div className="relative flex flex-col m-5 bg-white z-30 p-10">
        <p className="absolute top-2 right-2 text-xs italic text-gray-400">
          {category}
        </p>
        <img
          className="object-contain w-252 h-350 mx-auto"
          src={image}
          alt={title}
        />
        <h4 className="my-3">{title}</h4>
        <p className="text-xs my-2 line-clamp-2">{description}</p>
        <div className="mb-5">
          £{numeral(price).format('£0,0.00')}
        </div>
        <p className="text-sm my-2">Available Quantity: {quantity}</p>
        <button onClick={addItemToBasket} className="mt-auto button">
          Add to Basket
        </button>
      </div>
    </>
  );
};

export default Product;