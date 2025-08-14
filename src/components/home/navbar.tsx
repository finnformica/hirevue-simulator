"use client";

import { useAuth } from "@/providers/auth-provider";
import { paths } from "@/utils/paths";
import { handleSmoothScroll } from "@/utils/smooth-scroll";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const router = useRouter();
  const { user } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full border-b border-gray-800 bg-black py-4 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href={paths.home}>
            <span className="text-green-400 font-bold text-2xl">GradGuru</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          <a
            onClick={(e) => handleSmoothScroll(e, "features")}
            className="text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            Features
          </a>
          <a
            onClick={(e) => handleSmoothScroll(e, "how-it-works")}
            className="text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            How it Works
          </a>
          <a
            onClick={(e) => handleSmoothScroll(e, "pricing")}
            className="text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            Pricing
          </a>
          <a
            onClick={() => router.push(paths.about)}
            className="text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            About
          </a>
        </div>
        <div className="hidden lg:flex items-center space-x-4">
          {user ? (
            <a
              onClick={() => router.push(paths.profile)}
              className="bg-green-500 hover:bg-green-600 text-black font-medium px-4 py-2 rounded-md transition-colors cursor-pointer"
            >
              Profile
            </a>
          ) : (
            <>
              <a
                href={paths.auth.signIn}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign in
              </a>
              <a
                href={paths.auth.createAccount}
                className="bg-green-500 hover:bg-green-600 text-black font-medium px-4 py-2 rounded-md transition-colors cursor-pointer"
              >
                Get Started
              </a>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-300 hover:text-green-400 transition-colors p-2"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                  isMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-current transition-all duration-300 mt-1 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-current transition-all duration-300 mt-1 ${
                  isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-16 left-0 right-0 bg-black border-b border-gray-800 z-50 transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "opacity-100 transform translate-y-0"
            : "opacity-0 transform -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex flex-col space-y-4 p-6">
          <a
            href="#features"
            onClick={(e) => handleSmoothScroll(e, "features")}
            className="text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => handleSmoothScroll(e, "how-it-works")}
            className="text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            How it Works
          </a>
          <a
            href="#pricing"
            onClick={(e) => handleSmoothScroll(e, "pricing")}
            className="text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            Pricing
          </a>
          <a
            onClick={() => router.push(paths.about)}
            className="text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            About
          </a>
          <div className="pt-4 border-t border-gray-800 flex flex-col space-y-4">
            {user ? (
              <a
                onClick={() => router.push(paths.profile)}
                className="bg-green-500 hover:bg-green-600 text-black font-medium px-4 py-2 rounded-md transition-colors text-center cursor-pointer"
              >
                Profile
              </a>
            ) : (
              <>
                <a
                  href={paths.auth.signIn}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Sign in
                </a>
                <a
                  href={paths.auth.createAccount}
                  className="bg-green-500 hover:bg-green-600 text-black font-medium px-4 py-2 rounded-md transition-colors text-center cursor-pointer"
                >
                  Get Started
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
