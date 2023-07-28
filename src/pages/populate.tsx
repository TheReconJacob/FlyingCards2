import { useState } from "react";
import { GetServerSidePropsContext } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import { IProduct, ISession } from "../../typings";
import Header from "../components/Header";
import admin from '../../firebaseAdmin';

type Props = {
  products: IProduct[];
};

const Populate = ({ products }: Props) => {
  const { data: session } = useSession();

  // State to keep track of the edited product fields
  const [editedProducts, setEditedProducts] = useState<IProduct[]>(products);

  // Function to handle updating a product field
  const handleUpdateProductField = (index: number, field: keyof IProduct, value: string | number) => {
    setEditedProducts(prevState => {
      const newProducts = [...prevState];
      (newProducts[index] as any)[field] = value;
      return newProducts;
    });
  }

  // Function to handle submitting the changes
  const handleSubmitChanges = async () => {
    // Call Firebase API to update the products with the new information
    // ...
  }

  return (
    <div className="bg-gray-100">
      <Head>
        <title>Populate Products</title>
        <link rel="icon" href="/fcicon.ico" />
      </Head>
      {/* Header */}
      <Header />
      <main className="max-w-screen-2xl mx-auto">
        {/* Product editor */}
        <div className="grid grid-flow-row-dense md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {editedProducts.map((product, index) => (
            <div key={product.id} className="relative flex flex-col m-5 bg-white z-30 p-10">
              {/* Render input fields for each product field */}
              <label>ID:</label>
              <input
                type="text"
                value={product.id}
                onChange={e => handleUpdateProductField(index, 'id', e.target.value)}
                className="border border-gray-300 rounded-md p-1"
              />
              <br />
              <label>Title:</label>
              <input
                type="text"
                value={product.title}
                onChange={e => handleUpdateProductField(index, 'title', e.target.value)}
                className="border border-gray-300 rounded-md p-1"
              />
              <br />
              <label>Price:</label>
              <input
                type="number"
                value={product.price}
                onChange={e => handleUpdateProductField(index, 'price', parseFloat(e.target.value))}
                className="border border-gray-300 rounded-md p-1"
              />
              <br />
              <label>Description:</label>
              <input
                type="text"
                value={product.description}
                onChange={e => handleUpdateProductField(index, 'description', e.target.value)}
                className="border border-gray-300 rounded-md p-1"
              />
              <br />
              <label>Category:</label>
              <input
                type="text"
                value={product.category}
                onChange={e => handleUpdateProductField(index, 'category', e.target.value)}
                className="border border-gray-300 rounded-md p-1"
              />
              <br />
              <label>Image:</label>
              <img src={product.image} alt={product.title} className="object-contain w-252 h-350 mx-auto" />
              <input
                type="text"
                value={product.image}
                onChange={e => handleUpdateProductField(index, 'image', e.target.value)}
                className="border border-gray-300 rounded-md p-1"
              />
              <br />
              <label>Quantity:</label>
              <input
                type="number"
                value={product.quantity}
                onChange={e => handleUpdateProductField(index, 'quantity', parseInt(e.target.value))}
                className="border border-gray-300 rounded-md p-1"
              />
            </div>
          ))}
        </div>
        {/* Submit button */}
        <button onClick={handleSubmitChanges} className="mt-auto button mx-auto mb-10">
          Submit Changes
        </button>
      </main>
    </div>
  );
};

export default Populate;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const db = admin.firestore();
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  const products = snapshot.docs.map(doc => doc.data());

  // Get user logged in credentials
  const session: ISession | null = await getSession(context);
  if (!session) {
    return {
      props: {
        products,
      },
    };
  }

  return {
    props: {
      products,
      session,
    },
  };
};