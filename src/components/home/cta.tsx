import { CheckCircle } from "lucide-react";

export function CtaSection() {
  return (
    <section className="w-full bg-black py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Join thousands of graduates who have successfully prepared for
              their interviews with GradGuru.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-black border border-gray-800 rounded-lg p-6 flex flex-col">
              <div className="text-gray-400 mb-2">Basic</div>
              <h3 className="text-2xl font-bold mb-1">Free</h3>
              <p className="text-sm text-gray-500 mb-6">
                Get started with practice interviews
              </p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start">
                  <CheckCircle
                    size={18}
                    className="text-green-400 mr-2 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-300">5 practice interviews</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    size={18}
                    className="text-green-400 mr-2 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-300">Basic feedback</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    size={18}
                    className="text-green-400 mr-2 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-300">General prompts library</span>
                </li>
              </ul>
              <a
                href="#start-free"
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-md transition-colors text-center"
              >
                Start Free
              </a>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="text-green-400 mb-2">Pro</div>
              <h3 className="text-2xl font-bold mb-1">
                £19.99
                <span className="text-lg font-normal text-gray-400">
                  /month
                </span>
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Full access to all features
              </p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start">
                  <CheckCircle
                    size={18}
                    className="text-green-400 mr-2 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-300">
                    Unlimited practice interviews
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    size={18}
                    className="text-green-400 mr-2 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-300">
                    Advanced AI analysis & feedback
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    size={18}
                    className="text-green-400 mr-2 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-300">
                    Industry-specific prompts
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    size={18}
                    className="text-green-400 mr-2 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-300">Performance tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    size={18}
                    className="text-green-400 mr-2 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-300">
                    Full documentation library
                  </span>
                </li>
              </ul>
              <a
                href="#start-pro"
                className="bg-green-500 hover:bg-green-600 text-black font-medium px-4 py-2 rounded-md transition-colors text-center"
              >
                Get Started
              </a>
            </div>
            <div className="bg-black border border-gray-800 rounded-lg p-6 flex flex-col">
              <div className="text-gray-400 mb-2">Enterprise</div>
              <h3 className="text-2xl font-bold mb-1">Custom</h3>
              <p className="text-sm text-gray-500 mb-6">
                For universities & career services
              </p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start">
                  <CheckCircle
                    size={18}
                    className="text-green-400 mr-2 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-300">Bulk student licenses</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    size={18}
                    className="text-green-400 mr-2 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-300">
                    Custom prompts & branding
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    size={18}
                    className="text-green-400 mr-2 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-300">Analytics dashboard</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    size={18}
                    className="text-green-400 mr-2 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-300">Dedicated support</span>
                </li>
              </ul>
              <a
                href="#contact-us"
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-md transition-colors text-center"
              >
                Contact Us
              </a>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h3 className="text-xl font-bold mb-2">
                  Still have questions?
                </h3>
                <p className="text-gray-400">
                  Our team is ready to help you get started with GradGuru.
                </p>
              </div>
              <a
                href="#book-demo"
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-md transition-colors whitespace-nowrap"
              >
                Book a Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
