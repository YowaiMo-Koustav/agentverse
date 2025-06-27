/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@walletconnect/ethereum-provider'],
  webpack: (config) => {
    config.module.rules.push({
      test: /HeartbeatWorker\.js$/,
      use: 'null-loader',
    });
    return config;
  },
};

export default nextConfig;
