/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The OG image route reads its Heebo TTFs from disk at request time. The path
  // is assembled at runtime, so tracing cannot infer it — name the files here or
  // they are missing from the deployed function and the route 500s.
  outputFileTracingIncludes: {
    "/[slug]/opengraph-image": ["./app/[slug]/*.ttf"],
  },
};

export default nextConfig;
