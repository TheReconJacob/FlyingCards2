import { ReactNode } from 'react';
import { useFetchProducts } from '../hooks/UseFetchProducts';

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  useFetchProducts();

  return <>{children}</>;
};

export default Layout;