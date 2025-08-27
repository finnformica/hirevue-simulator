"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does GradGuru work?",
      answer:
        "GradGuru provides a comprehensive interview preparation platform with AI-powered analysis, industry-specific prompts, and detailed feedback to help you ace your HireVue interviews.",
    },
    {
      question: "What types of interviews does GradGuru cover?",
      answer:
        "We cover HireVue interviews for major graduate employers such as Deloitte, JP Morgan and many more across various industries including technology, finance, and consulting.",
    },
    {
      question: "How accurate is the AI feedback?",
      answer:
        "Our AI analysis evaluates speech patterns, technical vocabulary, clarity, and response structure to provide comprehensive feedback that aligns directly with HireVue scoring criteria.",
    },
    {
      question: "How many practice interviews can I do?",
      answer:
        "You can practice as many times as you want! We have hundreds of industry-specific questions and motivational questions, with the option to retry each question multiple times to improve your responses, track your progress, and be well-prepared for your HireVue interview.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="faq" className="w-full bg-black py-20 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about GradGuru and how it can help you
            succeed.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center group transition-colors"
              >
                <span className="font-medium text-white group-hover:text-green-400 transition-colors">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 group-hover:text-green-400 transition-all ${
                    openFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openFaq === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-4">
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
