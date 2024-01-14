import Inspect from 'vite-plugin-inspect';

export default {
  plugins: [
    Inspect({
      build: true,
      outputDir: '.vite-inspect',
    }),
  ],
};
