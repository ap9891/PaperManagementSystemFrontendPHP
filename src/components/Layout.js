import React from 'react';
import Navbar from './navbar/Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto py-4">
        {children}
      </div>
    </div>
  );
};

export default Layout;