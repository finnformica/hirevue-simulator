import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
export function Footer() {
  return (
    <footer className="w-full bg-black border-t border-gray-800 py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-green-400 font-bold text-xl">GradGuru</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Helping graduates ace their interviews and land their dream jobs.
            </p>
            <div className="flex space-x-4">
              <a
                href="#twitter"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#instagram"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#linkedin"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#facebook"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Testimonials
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#blog"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#guides"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Interview Guides
                </a>
              </li>
              <li>
                <a
                  href="#tips"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Career Tips
                </a>
              </li>
              <li>
                <a
                  href="#webinars"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Webinars
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#about"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#careers"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#privacy"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} GradGuru. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
