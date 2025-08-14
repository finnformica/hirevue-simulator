"use client";

import { Navbar } from "@/components/home/navbar";
import { Button } from "@/components/ui/button";
import { paths } from "@/utils/paths";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function About() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="pt-20 pb-8 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About Us
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Two graduates who've been through the struggle and want to make it
              easier for those coming next.
            </p>
          </div>

          {/* Content */}
          <div className="max-w-none">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 md:p-12">
              {/* Founders Image - Responsive Layout */}
              <div className="md:float-left md:mr-8 text-center mt-5 mb-4">
                <div className="relative w-48 h-48 mx-auto md:mx-0">
                  <div className="absolute inset-0 rounded-full bg-white/20 scale-90 blur-xl z-[9]" />
                  <img
                    src="/finn_and_ken.avif"
                    alt="Finn and Ken, Co-founders of GradGuru"
                    className="w-48 h-48 rounded-full object-cover ring-2 ring-white/20 relative z-10"
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2 text-center">
                  Finn & Ken, Co-founders
                </p>
              </div>

              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                Like many students,{" "}
                <strong className="text-white">Finn and I</strong> left
                university thinking the hardest part was over. But when it came
                to applying for graduate jobs, we quickly realised how little we
                actually knew.
              </p>

              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                We'd done the <em className="text-gray-200">"right" things</em>{" "}
                — studied hard, got involved, built decent CVs — but suddenly we
                were thrown into a world of{" "}
                <strong className="text-green-400">
                  online tests, endless application forms, cryptic feedback
                </strong>{" "}
                (or no feedback at all), and interviews that felt more like
                puzzles than conversations. It was{" "}
                <em className="text-gray-200">
                  overwhelming, and frankly, demoralising
                </em>
                .
              </p>

              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                Over time, we began to figure things out —{" "}
                <em className="text-gray-200">
                  not because it was ever made clear
                </em>
                , but because we stumbled, shared notes, and learnt the hard
                way. Along the way, we realised we weren't alone.{" "}
                <strong className="text-green-400">
                  So many grads feel lost in this process
                </strong>
                , unsure where to start, and lacking the kind of guidance that
                actually helps.
              </p>

              <p className="text-gray-300 leading-relaxed text-lg">
                That's why we started{" "}
                <strong className="text-green-400">GradGuru</strong> — not as
                experts, but as two people who've been through it and wanted to
                make the path clearer for those coming next. We're here to share
                what we've learnt, highlight what we wish we'd known sooner, and
                hopefully make the whole experience a bit less painful.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Call to Action */}
      <div className="bg-black border-t border-gray-800 mt-14">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-400 mb-6">
              Join the hundreds of graduates who've already transformed their
              careers with our guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push(paths.auth.createAccount)}
                className="bg-green-500 hover:bg-green-600 text-black font-medium px-6 py-3 rounded-md transition-colors"
              >
                Get Started
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white font-medium px-6 py-3 rounded-md transition-colors"
              >
                <Link href="mailto:gradguruapp@gmail.com">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
