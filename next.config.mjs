/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets phones/laptops on your Wi-Fi open the dev server (npm run dev).
  // Only affects local development, not the Vercel deployment.
  allowedDevOrigins: ["192.168.1.236"],
};

export default nextConfig;
