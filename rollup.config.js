import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

const banner = `/*!
 * Hesabe Apple Pay v1.0.0
 * Apple Pay integration library for Hesabe payment gateway
 * (c) 2025 Hesabe IT Team
 * Released under the MIT License.
 */`;

export default [
  // UMD build for browsers (unminified)
  {
    input: 'src/HesabeApplePay.js',
    output: {
      file: 'dist/hesabe-apple-pay.umd.js',
      format: 'umd',
      name: 'HesabeApplePay',
      banner: banner,
      exports: 'default'
    }
  },
  
  // ES Module build
  {
    input: 'src/HesabeApplePay.js',
    output: {
      file: 'dist/hesabe-apple-pay.esm.js',
      format: 'es',
      banner: banner
    }
  },
  
  // CommonJS build
  {
    input: 'src/HesabeApplePay.js',
    output: {
      file: 'dist/hesabe-apple-pay.js',
      format: 'cjs',
      banner: banner,
      exports: 'default'
    }
  },
  
  // CDN build - minified UMD
  {
    input: 'src/HesabeApplePay.js',
    output: {
      file: 'cdn/hesabe-apple-pay.min.js',
      format: 'umd',
      name: 'HesabeApplePay',
      banner: banner,
      exports: 'default'
    },
    plugins: [
      terser({
        compress: {
          drop_console: false,
          drop_debugger: true
        },
        format: {
          comments: /^!/
        }
      })
    ]
  }
];