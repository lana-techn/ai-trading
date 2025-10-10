const config = {
  plugins: [
    "@tailwindcss/postcss",
    // Add autoprefixer for better browser compatibility
    "autoprefixer",
    // Add CSS nano for production minification
    ...(process.env.NODE_ENV === 'production' ? [
      ["cssnano", {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          colormin: true,
          minifyFontValues: true,
          minifySelectors: true,
        }],
      }],
    ] : []),
  ],
};

export default config;
