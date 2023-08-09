import Head from 'next/head';
import Header from '../components/Header';

const Contact = () => {
  return (
    <div className="bg-gray-100">
      <Head>
        <title>Flying Cards</title>
      </Head>
      <Header />
      <br />
      <div className="flex flex-col items-center">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLScdXgOLIGwpnyiqJnQqwOEaE5Mer35ihEQrNXXKTeUoUcYRqg/viewform?embedded=true"
          className="responsive-iframe"
        >
          Loading…
        </iframe>
      </div>
      <style jsx>{`
        .responsive-iframe {
          width: 80%;
          max-width: 640px;
          height: 100vh;
          max-height: 875px;
        }

        @media screen and (max-width: 768px) {
          .responsive-iframe {
            width: 80%;
            height: 80vh;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;