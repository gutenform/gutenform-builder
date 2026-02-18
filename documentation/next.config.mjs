import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: "export", // static export for Vercel
  // basePath weglassen: App läuft unter / (für Lizenz-/Account-App & Vercel)
  reactStrictMode: true,
};

export default withMDX(config);
