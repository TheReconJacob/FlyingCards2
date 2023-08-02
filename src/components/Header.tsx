import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { selectItems } from "../slices/basketSlice";
import { useEffect, useState } from "react";

type Props = {};

const Header = (props: Props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();
  const items = useSelector(selectItems);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    router.push(`/search?q=${searchQuery}`);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch('/.netlify/functions/categories');
      const categories = await res.json();
      setCategories(categories);
    };
    
    fetchCategories();
  }, []);  

  return (
    <header>
      {/* top nav */}
      <div className="flex items-center bg-[#1d2298] p-1 flex-grow py-2">
        <div className="h-12 flex items-center flex-grow sm:flex-grow-0">
          <Image
            onClick={() => router.push("/")}
            className="cursor-pointer overflow-hidden mt-2"
            src="/flyingcards.png"
            width={150}
            height={40}
            alt="Flying Cards"
          />
        </div>
        {/* search */}
        <div className="hidden sm:flex items-center h-10 rounded-md flex-grow cursor-pointer bg-[#4c4fbd] hover:bg-[#6c6fdd]">
          <input
            type="text"
            className="bg-white p-2 h-full w-6 flex-grow flex-shrink rounded-l-md focus:outline-none px-4"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch();
              }
            }}
          />
          <MagnifyingGlassIcon className="h-12 p-4" onClick={handleSearch} />
        </div>
        {/* right menu */}
        <div className="text-white flex items-center text-xs space-x-6 mx-6 whitespace-nowrap">
          <div
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
            className="link relative"
          >
            {session ? (
              <>
                <p className="font-extrabold text-sm mt-2">Hello, {session.user.name}</p>
                {dropdownOpen && (
                  <div className="absolute top-full right-0 bg-[#1d2298] text-white p-2 rounded-md shadow-md">
                    <button onClick={() => signOut()} className="link">
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button onClick={() => signIn()} className="link">
                <p className="font-extrabold text-sm mt-2">Sign In</p>
              </button>
            )}
          </div>
          <div
            onClick={() => session && router.push("/orders")}
            className="cursor-pointer link"
          >
            <p>Returns</p>
            <p className="font-extrabold md:text-sm">& Orders</p>
          </div>
          <div
            onClick={() => router.push("/checkout")}
            className="relative link flex items-center"
          >
            <span className="absolute top-0 -right-2 md:right-10 w-4 h-4 bg-[#01C4CC] text-center rounded-full text-black font-bold">
              {items.length}
            </span>

            <ShoppingCartIcon className="h-10" />
            <p className="hidden md:inline font-extrabold text-sm mt-2">
              Basket
            </p>
          </div>
        </div>
      </div>
      {/* mobile search and Banner*/}
      <div className="bg-[#1d2298]">
        {/* mobile search */}
        <div className="md:hidden flex justify-center px-4 bg-[#1d2298] mb-2">
          <div className="flex items-center h-10 rounded-md flex-grow cursor-pointer bg-[#4c4fbd] hover:bg-[#6c6fdd]">
            <input
              type="text"
              className="bg-white p-2 h-full w-6 flex-grow flex-shrink rounded-l-md focus:outline-none px-4"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSearch();
                }
              }}
            />
            <div
              className="flex items-center justify-center rounded-md cursor-pointer bg-[#4c4fbd] hover:bg-[#6c6fdd]"
              style={{ width: '2.5rem', height: '2.5rem' }}
            >
              <MagnifyingGlassIcon className="h-6" onClick={handleSearch} />
            </div>
          </div>
        </div>
        {/* bottom nav */}
        <div className="flex items-center space-x-3 p-2 pl-6 bg-[#4c4fbd] text-white text-sm">
          {categories.map(category => (
            <p key={category} className="link" onClick={() => router.push(`/category/${category}`)}>{category}</p>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;