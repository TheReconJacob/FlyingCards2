import { useState } from "react";
import { IProduct } from "../../typings";
import Product from "./Product";

type Props = {
  products: IProduct[];
};

const ProductFeed: React.FC<Props> = ({ products }: Props) => {
  // Add a null check for products
  if (!products || products.length === 0) {
    return <p>No Products Found</p>;
  }

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const maxPage = Math.ceil(products.length / productsPerPage);

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="flex flex-wrap justify-center mx-auto">
        {currentProducts.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>
      <p className="text-center">
        Page {currentPage} of {maxPage}
      </p>
      <nav>
        <ul className="pagination">
          {currentPage > 1 && (
            <li className="page-item">
              <a onClick={() => paginate(currentPage - 1)} className="page-link">
                {"<"}
              </a>
            </li>
          )}
          {[...Array(maxPage).keys()].map((x) => (
            <li key={x + 1} className="page-item">
              <a onClick={() => paginate(x + 1)} className="page-link">
                {x + 1}
              </a>
            </li>
          ))}
          {currentPage < maxPage && (
            <li className="page-item">
              <a onClick={() => paginate(currentPage + 1)} className="page-link">
                {">"}
              </a>
            </li>
          )}
        </ul>
      </nav>
      <br />
      <style jsx>{`
        .pagination {
          display: flex;
          list-style: none;
          margin: 0 auto;
          padding: 10px;
          justify-content: center;
          margin-top: 5px;
          max-width: 80%;
        }
        .page-item {
          margin-right: 0.25rem;
        }
        .page-link {
          color: white;
          cursor: pointer;
          background-color: #1d2298;
          border-radius: 5px;
          padding: 5px;
          min-width: 2.5rem;
          min-height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .page-link:hover {
          background-color: #3d4298;
        }
        
        @media (max-width: 600px) {
            .pagination {
                flex-wrap: wrap;
                max-width: none;
            }
            .page-item {
                margin-bottom: 0.25rem;
            }
        }
      `}</style>
    </>
  );
};

export default ProductFeed;