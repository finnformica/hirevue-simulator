"use client";

import { paths } from "@/utils/paths";
import { MenuIcon, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full border-b border-gray-800 bg-black py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-green-400 font-bold text-2xl">GradGuru</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <a
            href="#features"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-gray-300 hover:text-white transition-colors"
          >
            How it Works
          </a>
          <a
            href="#pricing"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Pricing
          </a>
          <a
            href="#about"
            className="text-gray-300 hover:text-white transition-colors"
          >
            About
          </a>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <a
            href={paths.auth.signIn}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Sign in
          </a>
          <a
            href={paths.auth.createAccount}
            className="bg-green-500 hover:bg-green-600 text-black font-medium px-4 py-2 rounded-md transition-colors"
          >
            Get Started
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-300 hover:text-white"
          >
            {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-black border-b border-gray-800 z-50">
          <div className="flex flex-col space-y-4 p-6">
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-300 hover:text-white transition-colors"
            >
              How it Works
            </a>
            <a
              href="#pricing"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="text-gray-300 hover:text-white transition-colors"
            >
              About
            </a>
            <div className="pt-4 border-t border-gray-800 flex flex-col space-y-4">
              <a
                href={paths.auth.signIn}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign in
              </a>
              <a
                href={paths.auth.createAccount}
                className="bg-green-500 hover:bg-green-600 text-black font-medium px-4 py-2 rounded-md transition-colors text-center"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
