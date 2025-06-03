/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       // source: "/simulator/:path*",
  //       headers: [
  //         {
  //           key: "Content-Security-Policy",
  //           value: `
  //           default-src 'self';
  //           script-src 'self' 'unsafe-inline' 'unsafe-eval';
  //           style-src 'self' 'unsafe-inline';
  //           media-src 'self' blob: data:;
  //           connect-src *;
  //           img-src 'self' blob: data: https:;
  //           frame-ancestors 'self';
  //         `.replace(/\n/g, ""),
  //         },
  //         {
  //           key: "Cross-Origin-Embedder-Policy",
  //           value: "require-corp",
  //         },
  //         {
  //           key: "Cross-Origin-Opener-Policy",
  //           value: "same-origin",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
