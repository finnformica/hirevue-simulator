/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        // source: "/simulator/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src 'self' blob:; connect-src 'self' blob: ${process.env.NEXT_PUBLIC_SUPABASE_URL};`,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
