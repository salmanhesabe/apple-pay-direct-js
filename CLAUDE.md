# CLAUDE.md

This codebase is for developing a javascript library for easy integration of Apple Pay with the Hesabe payment gateway. The library is designed to be modular, lightweight, and supports multiple build formats including UMD, ESM, and CommonJS. It is distributed via npm and CDN.
## Project Overview

This is a JavaScript library for Apple Pay integration with the Hesabe payment gateway. The library provides a modular, lightweight solution that supports multiple build formats (UMD, ESM, CommonJS) and is distributed via npm and CDN.

## Build System

The project uses Rollup for bundling with multiple output formats:

- **Development build**: `npm run build:dev`
- **Production build**: `npm run build:prod` 
- **Full build**: `npm run build` (builds all formats)
- **Clean build artifacts**: `npm run clean`

Build outputs:
- `dist/hesabe-apple-pay.js` - CommonJS format
- `dist/hesabe-apple-pay.esm.js` - ES Module format
- `dist/hesabe-apple-pay.umd.js` - UMD format (browser)
- `cdn/hesabe-apple-pay.min.js` - Minified UMD for CDN

## Architecture

### Core Class Structure
The main `HesabeApplePay` class (`src/HesabeApplePay.js`) uses:
- Private fields and methods (# prefix) for encapsulation
- Static constants for payment types and configuration
- Environment-based configuration (sandbox/production)
- Automatic merchant identifier and session ID generation

### Key Components
- **Configuration Management**: Merges user config with defaults and validates required fields
- **Apple Pay Integration**: Handles SDK loading, merchant validation, and payment processing
- **Payment Types**: Supports MPGS, CyberSource, KNET, and Visa payment methods
- **URL Building**: Constructs API endpoints for validation and payment processing

### Environment Configuration
- **Sandbox**: Uses `merchant.hesabe.dec`, `https://sandbox.hesabe.com`
- **Production**: Uses `merchant.hesabe.prod`, `https://api.hesabe.com`

## Development Workflow

1. Make changes to `src/HesabeApplePay.js`
2. Test locally using `test.html`
3. Run `npm run build` to generate all distribution formats
4. Use `npm run prepublishOnly` before publishing (cleans and rebuilds)

## Testing

The project includes `test.html` for manual testing. No automated test framework is currently configured.

## Payment Flow

1. Initialize with required config (token, requestData, amount, etc.)
2. Load Apple Pay SDK dynamically
3. Validate merchant capabilities with Apple
4. Setup payment buttons based on available gateways
5. Handle payment authorization and redirect to Hesabe

