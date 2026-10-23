import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ToastContainer from './Toast';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-mayfipay-bg">
      <Header />
      <main className="flex-1">
        <ToastContainer />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}