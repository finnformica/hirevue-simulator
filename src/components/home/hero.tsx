"use client";

import { paths } from "@/utils/paths";
import { ArrowRight, Pause, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function HeroSection() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  return (
    <section
      id="hero"
      className="w-full bg-black py-20 px-6 md:px-12 relative overflow-hidden"
    >
      {/* Dotted background pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(#333 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      ></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm mb-6">
            <span>Ace your HireVue interviews</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Practice Makes Perfect
            <br />
            <span className="text-green-400">Graduate Interviews</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mb-8">
            Prepare for your HireVue interviews with industry-specific prompts,
            AI-powered feedback, and expert guidance to land your dream job.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              onClick={() => router.push(paths.auth.createAccount)}
              className="bg-green-500 hover:bg-green-600 text-black font-medium px-6 py-3 rounded-md transition-colors flex items-center justify-center"
            >
              Start Practicing Now
              <ArrowRight size={18} className="ml-2" />
            </button>
            <button
              onClick={() => {}}
              className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-md transition-colors"
            >
              Watch Demo
            </button>
          </div>
        </div>
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="aspect-video bg-gray-800 border border-gray-700 rounded-lg relative overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              onEnded={handleVideoEnded}
            >
              <source src="/videos/product-intro.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <button
              onClick={togglePlay}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
                isPlaying
                  ? "opacity-0 hover:opacity-100 bg-black/30 hover:bg-black/50"
                  : "opacity-100 bg-black/30 hover:bg-black/50"
              }`}
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? (
                <Pause className="h-12 w-12 text-white" />
              ) : (
                <Play className="h-12 w-12 text-white ml-1" />
              )}
            </button>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-white">100+</div>
            <div className="text-gray-400">Interview Prompts</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-white">92%</div>
            <div className="text-gray-400">Success Rate</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-gray-400">Major Companies</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-gray-400">Practice Access</div>
          </div>
        </div>
      </div>
    </section>
  );
}
