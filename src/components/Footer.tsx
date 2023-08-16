import Link from 'next/link';
import FooterContent from './FooterContent';

type Props = {};

const Footer = (props: Props) => {
  return (
    <footer className="bg-[#1d2298] text-white p-10">
      <div className="flex justify-between">
        <FooterContent />
      </div>

      <div className="flex space-x-2 mt-10" style={{ alignItems: 'flex-start' }}>
        <Link href="https://www.fiverr.com/thereconjacob/create-a-cheap-easy-to-use-ecommerce-website-with-zero-maintenance-costs">
          <p>This website was made by TheReconJacob from</p>
          <img
            src="https://freelogopng.com/images/all_img/1656739841old-fiverr-logo-white.png"
            alt="Fiverr"
            style={{ height: '18px', width: 'auto' }}
          />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;