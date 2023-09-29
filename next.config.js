/** @type {import('next').NextConfig} */
const nextConfig = {
  compilerOptions: {
    baseUrl: "src/",
    paths: {
      "@/components/*": ["components/*"],
    },
  },
};

module.exports = nextConfig;
