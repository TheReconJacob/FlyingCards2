import { useEffect, useState } from "react";
import { GetServerSidePropsContext } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import { IProduct, ISession } from "../../typings";
import Header from "../components/Header";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp, doc } from 'firebase/firestore';
import db from '../../firebase';
import { useProductContext } from "components/context/ProductContext";

const Populate = () => {
  const { products, loading, error } = useProductContext();
  const { data: session } = useSession();
  
  if (!process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL) {
    console.error('NEXT_PUBLIC_AUTHORIZED_EMAIL environment variable is not set');
    return null;
  }
  
  const authorizedEmails = process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL.includes(',')
    ? process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL.split(',')
    : [process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL];

  // Check if the logged-in user is authorized
  const isAuthorized = authorizedEmails.includes(session?.user.email as string);

  const [newProduct, setNewProduct] = useState<IProduct>({
    id: '',
    title: '',
    price: 0,
    description: '',
    category: '',
    image: '',
    quantity: 0,
  });

  // State to keep track of the edited product fields
  const [editedProducts, setEditedProducts] = useState<IProduct[]>(products);

  const [removedProducts, setRemovedProducts] = useState<IProduct[]>([]);
  
  useEffect(() => {
    setEditedProducts(products);
  }, [products]);
  
  // Function to handle updating a field in the new product form
  const handleUpdateNewProductField = (field: keyof IProduct, value: string | number) => {
    setNewProduct(prevState => ({
      ...prevState,
      [field]: value,
    }));
  }

  // Function to handle updating a product field
  const handleUpdateProductField = (index: number, field: keyof IProduct, value: string | number) => {
    setEditedProducts(prevState => {
      const newProducts = [...prevState];
      (newProducts[index] as any)[field] = value;
      return newProducts;
    });
  }

  const handleRemoveProduct = (productId: string) => {
    setEditedProducts(prevState => {
      const newProducts = prevState.filter(product => product.id !== productId);
      const removedProduct = prevState.find(product => product.id === productId);
      if (removedProduct) {
        setRemovedProducts(prevState => [...prevState, removedProduct]);
      }
      return newProducts;
    });
  }

  // Function to handle submitting the new product form
  const handleSubmitNewProduct = async () => {
    // Query the products collection to get all existing products
    const querySnapshot = await getDocs(collection(db, 'products'));
    // Find the highest id value among the existing products
    let maxId = 0;
    querySnapshot.forEach(doc => {
      const product = doc.data() as IProduct;
      const id = parseInt(product.id);
      if (id > maxId) {
        maxId = id;
      }
    });
    // Generate a new unique id by incrementing the highest id value by 1
    const newId = (maxId + 1).toString();
    // Add a new document to the products collection with the generated id
    await addDoc(collection(db, 'products'), {
      ...newProduct,
      id: newId,
      description: newProduct.description ?? '', // Set description to an empty string if it is undefined
      quantity: newProduct.quantity ?? 0, // Set quantity to 0 if it is undefined
      subcategory: newProduct.subcategory ?? '', // Set subcategory to an empty string if it is undefined
      subsubcategory: newProduct.subsubcategory ?? '', // Set subsubcategory to an empty string if it is undefined
    });
    // Clear the input fields
    setNewProduct({
      id: '',
      title: '',
      price: 0,
      description: '',
      category: '',
      image: '',
      quantity: 0,
      subcategory: '',
      subsubcategory: '',
    });
  
    // Update the last updated timestamp for the products collection
    const lastUpdatedRef = collection(db, 'lastUpdated');
    const lastUpdatedQuery = query(lastUpdatedRef, where('type', '==', 'products'));
    const lastUpdatedSnapshot = await getDocs(lastUpdatedQuery);
    const lastUpdatedDocRef = lastUpdatedSnapshot.docs[0]?.ref;
    await updateDoc(lastUpdatedDocRef, { timestamp: serverTimestamp() });
  }

  // Function to handle submitting the changes
  const handleSubmitChanges = async () => {
    // Loop through the edited products
    for (const product of editedProducts) {
      // Query the products collection for a document with a matching product.id field
      const querySnapshot = await getDocs(query(collection(db, 'products'), where('id', '==', product.id)));
      // Get the first document from the query result (there should only be one)
      const docSnapshot = querySnapshot.docs[0];
      if (docSnapshot) {
        // Get a reference to the product document
        const productRef = docSnapshot.ref;
        // Update the product document with the new information
        await updateDoc(productRef, {
          title: product.title,
          price: product.price,
          description: product.description ?? '', // Set description to an empty string if it is undefined
          category: product.category,
          image: product.image,
          quantity: product.quantity,
          subcategory: product.subcategory ?? '', // Set subcategory to an empty string if it is undefined
          subsubcategory: product.subsubcategory ?? '', // Set subsubcategory to an empty string if it is undefined
        });
      }
    }
    // Loop through the removed products
    for (const product of removedProducts) {
      // Query the products collection for a document with a matching product.id field
      const querySnapshot = await getDocs(query(collection(db, 'products'), where('id', '==', product.id)));
      // Get the first document from the query result (there should only be one)
      const docSnapshot = querySnapshot.docs[0];
      if (docSnapshot) {
        // Get a reference to the product document
        const productRef = docSnapshot.ref;
        // Delete the product document
        await deleteDoc(productRef);
      } else {
        console.log(`No document found with id ${product.id}`);
      }
    }
  
    // Update the last updated timestamp for the products collection
    const lastUpdatedRef = collection(db, 'lastUpdated');
    const lastUpdatedQuery = query(lastUpdatedRef, where('type', '==', 'products'));
    const lastUpdatedSnapshot = await getDocs(lastUpdatedQuery);
    const lastUpdatedDocRef = lastUpdatedSnapshot.docs[0]?.ref;
    await updateDoc(lastUpdatedDocRef, { timestamp: serverTimestamp() });

  } 

  return (
    <div className="bg-gray-100">
      <Header />
      {isAuthorized ? (
        // Render page content for authorized users
        <main className="max-w-screen-2xl mx-auto">
          {/* Header */}
          <Head>
            <title>Populate Products</title>
            <link rel="icon" href="/fcicon.ico" />
          </Head>
          <h2>When adding or editing a product, please allow roughly 20 seconds before navigating away from this page.</h2>
          {/* New product form */}
          <div className="m-5 bg-white z-30 p-10">
            <h2>New Product</h2>
            {/* Render input fields for each product field (except id) */}
            <label>Title: *</label>
            <input
              type="text"
              value={newProduct.title}
              onChange={e => handleUpdateNewProductField('title', e.target.value)}
              className="border border-gray-300 rounded-md p-1"
            />
            <br />
            <label>Price: *</label>
            <input
              type="number"
              value={newProduct.price}
              onChange={e => handleUpdateNewProductField('price', parseFloat(e.target.value))}
              className="border border-gray-300 rounded-md p-1"
            />
            <br />
            <label>Description:</label>
            <input
              type="text"
              value={newProduct.description}
              onChange={e => handleUpdateNewProductField('description', e.target.value)}
              className="border border-gray-300 rounded-md p-1"
            />
            <br />
            <label>Category: *</label>
            <input
              type="text"
              value={newProduct.category}
              onChange={e => handleUpdateNewProductField('category', e.target.value)}
              className="border border-gray-300 rounded-md p-1"
            />
            <br />
            {/* Input field for subcategory */}
            <label>Subcategory:</label>
            <input
              type="text"
              value={newProduct.subcategory}
              onChange={e => handleUpdateNewProductField('subcategory', e.target.value)}
              className="border border-gray-300 rounded-md p-1"
            />
            <br />
            {/* Input field for subsubcategory */}
            <label>Sub-subcategory:</label>
            <input
              type="text"
              value={newProduct.subsubcategory}
              onChange={e => handleUpdateNewProductField('subsubcategory', e.target.value)}
              className="border border-gray-300 rounded-md p-1"
            />
            <br />
            <label>Image URL: *</label>
            <input
              type="text"
              value={newProduct.image}
              onChange={e => handleUpdateNewProductField('image', e.target.value)}
              className="border border-gray-300 rounded-md p-1"
            />
            <br />
            <label>Quantity: *</label>
            <input
              type="number"
              value={newProduct.quantity}
              onChange={e => handleUpdateNewProductField('quantity', parseInt(e.target.value))}
              className="border border-gray-300 rounded-md p-1"
            />
            {/* Submit button for New Product */}
            <button
              onClick={() => {
                if (
                  newProduct.title &&
                  newProduct.price &&
                  newProduct.category &&
                  newProduct.image &&
                  (newProduct.quantity || newProduct.quantity === 0)
                ) {
                  handleSubmitNewProduct();
                } else {
                  alert('Please fill in all required fields');
                }
              }}
              className="mt-auto button mx-auto mb-10"
            >
              Submit New Product
            </button>
          </div>
          {/* Product editor */}
          <div className="grid grid-flow-row-dense md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {editedProducts.map((product, index) => (
              <div key={product.id} className="relative flex flex-col m-5 bg-white z-30 p-10">
                {/* X button to remove product */}
                <button onClick={() => handleRemoveProduct(product.id)} className="absolute top-2 right-2 text-lg font-bold">
                  X
                </button>
                {/* Render input fields for each product field (except id) */}
                <label>Title: *</label>
                <input
                  type="text"
                  value={product.title}
                  onChange={e => handleUpdateProductField(index, 'title', e.target.value)}
                  className="border border-gray-300 rounded-md p-1"
                />
                <br />
                <label>Price: *</label>
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
                <label>Category: *</label>
                <input
                  type="text"
                  value={product.category}
                  onChange={e => handleUpdateProductField(index, 'category', e.target.value)}
                  className="border border-gray-300 rounded-md p-1"
                />
                <br />
                {/* Input field for subcategory */}
                <label>Subcategory:</label>
                <input
                  type="text"
                  value={product.subcategory}
                  onChange={e => handleUpdateProductField(index, 'subcategory', e.target.value)}
                  className="border border-gray-300 rounded-md p-1"
                />
                <br />
                {/* Input field for subsubcategory */}
                <label>Sub-subcategory:</label>
                <input
                  type="text"
                  value={product.subsubcategory}
                  onChange={e => handleUpdateProductField(index, 'subsubcategory', e.target.value)}
                  className="border border-gray-300 rounded-md p-1"
                />
                <br />
                <label>Image URL: *</label>
                <img src={product.image} alt={product.title} className="object-contain w-252 h-350 mx-auto" />
                <input
                  type="text"
                  value={product.image}
                  onChange={e => handleUpdateProductField(index, 'image', e.target.value)}
                  className="border border-gray-300 rounded-md p-1"
                />
                <br />
                <label>Quantity: *</label>
                <input
                  type="number"
                  value={product.quantity}
                  onChange={e => handleUpdateProductField(index, 'quantity', parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md p-1"
                />
              </div>
            ))}
          </div>
          {/* Submit button for Changes */}
          <button
            onClick={() => {
              let allFieldsFilled = true;
              editedProducts.forEach(product => {
                if (!product.title || !product.price || !product.category || !product.image) {
                  allFieldsFilled = false;
                }
              });
              if (allFieldsFilled) {
                handleSubmitChanges();
              } else {
                alert('Please fill in all required fields');
              }
            }}
            className="mt-auto button mx-auto mb-10"
          >
            Submit Changes
          </button>
      </main>
      ) : (
        // Render placeholder image for unauthorized users
        <img
          src="https://i.redd.it/70jk8jtyl6a31.jpg"
          alt="Move along, nothing to see here."
          style={{
            display: 'block',
            maxWidth: '80%',
            maxHeight: '80%',
            width: 'auto',
            height: 'auto',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
    </div>
  );
};

export default Populate;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  // Get user logged in credentials
  const session: ISession | null = await getSession(context);
  return {
    props: {
      session,
    },
  };
};