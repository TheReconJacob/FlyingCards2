import { useState } from "react";
import { IProduct } from "../../typings";
import Product from "./Product";

type Props = {
  products: IProduct[];
};

const ProductFeed: React.FC<Props> = ({ products }: Props) => {
  // Add a null check for products
  if (!products || products.length === 0) {
    // Return a loading indicator or null if products is undefined, null, or empty
    // You can customize the loading indicator here
    return <p>Loading...</p>;
  }

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="flex flex-wrap justify-center -mt-10 md:-mt-52 lg:-mt-75 xl:-mt-80 mx-auto">
        {currentProducts.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>
      <p className="text-center">
        Page {currentPage} of {Math.ceil(products.length / productsPerPage)}
      </p>
      <nav>
        <ul className="pagination">
          {[...Array(Math.ceil(products.length / productsPerPage)).keys()].map((x, i, arr) => (
            <li key={x + 1} className="page-item">
              <a onClick={() => paginate(x + 1)} className="page-link">
                {x + 1}
              </a>
              {i !== arr.length - 1 && ", "}
            </li>
          ))}
        </ul>
      </nav>
      <style jsx>{`
        .pagination {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          justify-content: center;
        }
        .page-item {
          margin-right: 0.25rem;
        }
        .page-link {
          color: blue;
          cursor: pointer;
        }
        .page-link:visited {
          color: purple;
        }
      `}</style>
    </>
  );
};

export default ProductFeed;