/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: no server, no serverless function, no per-user cost.
  // This is the decision the whole architecture rests on.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
}
export default nextConfig
