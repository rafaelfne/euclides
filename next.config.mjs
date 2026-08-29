/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: no server, no serverless function, no per-user cost.
  // This is the decision the whole architecture rests on.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  // O indicador de desenvolvimento nasce no canto inferior esquerdo, em cima
  // dos links da barra lateral. Ele não existe no export; move só o dev.
  devIndicators: { position: 'bottom-right' },
}
export default nextConfig
