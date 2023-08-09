import Head from 'next/head';
import Header from '../components/Header';
import Link from 'next/link';

type Props = {};

const About = (props: Props) => {
  return (
    <>
      <Head>
        <title>About | Flying Cards</title>
      </Head>
      <Header />
      <main className="max-w-screen-2xl mx-auto p-10">
        <h1 className="text-3xl font-bold mb-6">About Flying Cards</h1>
        <p className="text-lg mb-4">
          Flying Cards is business that is selling different types of trading cards. The cards sold here are cards mainly ones that we have bought ourselves!
        </p>
        <p className="text-lg mb-4">
          We have some pack openings on the Flying Cards YouTube Channel which has led to the stock we currently have available. You can watch us{' '}
          <Link href="https://www.youtube.com/@Flying-Cards">
            <a className="text-blue-500 underline">here</a>
          </Link>!
        </p>
        {/* ... */}
      </main>
    </>
  );
};

export default About;