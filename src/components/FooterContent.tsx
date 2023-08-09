// You are free to edit this file in order to modify the footer
import Link from 'next/link';

const FooterContent = () => {
  return (
    <div>
      <h4 className="font-bold mb-2">Get to Know Us</h4>
      <ul>
        <li>
          <Link href="/about">
            <a>About Us</a>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default FooterContent;