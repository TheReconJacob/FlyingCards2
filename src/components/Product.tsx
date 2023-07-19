import { StarIcon } from "@heroicons/react/24/solid";
import numeral from "numeral";
import { useDispatch } from "react-redux";
import { IProduct } from "../../typings";
import { addToBasket } from "../slices/basketSlice";

type Props = {
  product: IProduct;
};

const Product: React.FC<Props> = ({ product }: Props) => {
  const { id, title, price, description, category, image, rating } = product;
  const { rate } = rating;
  const hasFast = rate > 4 ? true : false;
  const dispatch = useDispatch();

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
    };
    // Send product to Redux Store as a basket slice action
    dispatch(addToBasket({...product, hasFast}));
  };

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
        <div className="flex">
          {Array(Math.round(rate))
            .fill(0)
            .map((_, i) => (
              <StarIcon key={i.toString()} className="h-5 text-yellow-500" />
            ))}
        </div>
        <p className="text-xs my-2 line-clamp-2">{description}</p>
        <div className="mb-5">
          {numeral(price).format('£0,0.00')}
        </div>
        {hasFast && (
          <div className="flex items-center space-x-2 -mt-5">
            <img
              className="pt-1 w-12 h-12"
              src="/fastblacklogo.svg"
              width={252}
              height={350}
              alt="fast"
            />
            <p className="text-xs text-gray-500">FREE One-Day Delivery</p>
          </div>
        )}
        <button onClick={addItemToBasket} className="mt-auto button">
          Add to Basket
        </button>
      </div>
    </>
  );
};

export default Product;