// layout.js
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast'; // <-- NEW IMPORT

export const metadata = {
  title: 'My eCommerce App',
  description: 'Buy everything you need!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="p-6">{children}</main>
            <Toaster position="bottom-center" reverseOrder={false} /> {/* <-- NEW: Add Toaster component */}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
