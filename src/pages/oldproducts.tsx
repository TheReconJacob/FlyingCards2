import { GetServerSidePropsContext } from 'next';
import Header from "components/Header";
import { useProductContext } from "components/context/ProductContext";
import { IProduct } from "../../typings";
import { getSession } from 'next-auth/react';

const OldProducts = () => {

  type Props = {
    products: IProduct[];
  };
    
  const { products, loading, error } = useProductContext();

  // Find the hidden product in the products array
  const hiddenProduct = products.find((product: IProduct) => product.id === 'HIDDENPRODUCT');

  // Manually format the content to resemble the output of a rich text editor
  const formattedDescription = hiddenProduct && hiddenProduct.description
    ? hiddenProduct.description
        .replace(/<h1>/g, '<h1 style="font-size: 2em; margin: 0.67em 0;">')
        .replace(/<h2>/g, '<h2 style="font-size: 1.5em; margin: 0.83em 0;">')
        .replace(/<h3>/g, '<h3 style="font-size: 1.17em; margin: 1em 0;">')
        .replace(/<h4>/g, '<h4 style="margin: 1.33em 0;">')
        .replace(/<h5>/g, '<h5 style="font-size: 0.83em; margin: 1.67em 0;">')
        .replace(/<h6>/g, '<h6 style="font-size: 0.67em; margin: 2.33em 0;">')
        .replace(/<p>/g, '<p style="margin: 1em 0;">')
        .replace(/<ul>/g, '<ul style="list-style-type: disc; margin: 1em 0; padding-left: 40px;">')
        .replace(/<ol>/g, '<ol style="list-style-type: decimal; margin: 1em 0; padding-left: 40px;">')
    : '';


  return (
    <div className="bg-gray-100">
      <Header />
      <main className="max-w-screen-2xl mx-auto">
        <h1 className="text-3xl font-bold mt-4 mb-6 text-center">Old Products</h1>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formattedDescription }} />
      </main>
    </div>
  );
};

export default OldProducts;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  // Get user logged in credentials
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
};