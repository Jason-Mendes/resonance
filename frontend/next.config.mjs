/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emits a self-contained server with only the dependencies actually reached,
  // so the container does not carry the whole node_modules tree.
  output: "standalone",

  // `next build` and `next dev` both write here, so a build run while the dev
  // server is up overwrites the chunks it is serving and every request 404s
  // until it restarts. `npm run build:check` points this elsewhere so a
  // verification build cannot disturb someone's running server.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
