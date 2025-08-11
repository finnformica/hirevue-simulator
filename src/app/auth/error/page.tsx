"use client";

import { paths } from "@/utils/paths";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Home,
  RefreshCw,
  AlertTriangle,
  Mail,
  Clock,
  Shield,
} from "lucide-react";
import Link from "next/link";

const authIssues = [
  {
    icon: Mail,
    iconColor: "text-blue-400",
    title: "Email Not Received",
    description:
      "Check your spam folder or try requesting a new magic link. Make sure you entered the correct email address.",
  },
  {
    icon: Clock,
    iconColor: "text-yellow-400",
    title: "Link Expired",
    description:
      "Magic links expire after 30 minutes to keep your account secure. You'll need to request a new one to continue.",
  },
  {
    icon: Shield,
    iconColor: "text-green-400",
    title: "Browser Security",
    description:
      "Some browsers block magic links. Try opening the link in a different browser or disable pop-up blockers.",
  },
  {
    icon: AlertTriangle,
    iconColor: "text-red-400",
    title: "Invalid Link",
    description:
      "The link may have been tampered with or corrupted. Request a fresh magic link to resolve this.",
  },
];

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Animated error icon */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-1 bg-red-500 mx-auto max-w-xs"
          />
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Authentication Error
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            We encountered an issue with your authentication. This is usually
            related to the magic link email verification process.
          </p>
        </motion.div>

        {/* Common issues section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <h3 className="text-xl font-semibold text-white mb-6">
            Common Issues & Solutions
          </h3>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {authIssues.map((issue, index) => {
              const IconComponent = issue.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-900/50 p-6 rounded-lg border border-gray-800 text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <IconComponent className={`w-5 h-5 ${issue.iconColor}`} />
                    <h4 className="font-medium text-white">{issue.title}</h4>
                  </div>
                  <p className="text-gray-400 text-sm">{issue.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={paths.root}
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
            >
              <Home size={20} />
              Go Home
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={paths.auth.signIn}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-medium px-6 py-3 rounded-lg transition-colors duration-200"
            >
              <RefreshCw size={20} />
              Try Again
            </Link>
          </motion.div>
        </motion.div>

        {/* Additional help text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-8"
        >
          <p className="text-gray-500 text-sm">
            Still having trouble? Contact our support team for assistance.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
