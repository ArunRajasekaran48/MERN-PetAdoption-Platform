import React from "react";
import { Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      {/* Single-line footer text */}
      <div className="flex flex-wrap justify-center items-center space-x-4 text-sm">
        <span className="font-bold text-white">
          Paw<span className="text-rose-400">Pal</span>
        </span>
        <span>Connecting pets with loving homes since 2024</span>
        <div className="flex space-x-4">
          <a href="https://www.facebook.com" className="text-gray-400 hover:text-white transition-colors">
            <Facebook className="w-6 h-6" />
          </a>
          <a href="https://www.x.com" className="text-gray-400 hover:text-white transition-colors">
            <Twitter className="w-6 h-6" />
          </a>
          <a href="https://www.instagram.com" className="text-gray-400 hover:text-white transition-colors">
            <Instagram className="w-6 h-6" />
          </a>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-center text-xs">
          &copy; {new Date().getFullYear()} PawPal. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
