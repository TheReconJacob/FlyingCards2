import admin from './firebaseAdmin';

const db = admin.firestore();
const productsRef = db.collection('products');

export const seedDatabase = async () => {
  const productData = {
    id: 'product-id',
    title: 'Product Title',
    price: 9.99,
    description: 'Product Description',
    category: 'Product Category',
    image: 'Product Image URL',
  };

  const snapshot = await productsRef.where('id', '==', productData.id).get();
  if (snapshot.empty) {
    await productsRef.add(productData);
  }

  // Add more products as needed
};