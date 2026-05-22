import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['onnxruntime-node', 'sharp'],
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/**/*.wasm', './node_modules/**/*.so', './node_modules/**/*.node'],
  },
};

export default nextConfig;
