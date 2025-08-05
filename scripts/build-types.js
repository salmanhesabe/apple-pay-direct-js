const fs = require('fs');
const path = require('path');

const typesContent = `export interface HesabeApplePayConfig {
  /**
   * Environment setting - 'sandbox' for testing, 'production' for live
   * @default 'sandbox'
   */
  env?: 'sandbox' | 'production';
  
  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
  
  /**
   * Currency code for the payment
   * @default 'KWD'
   */
  currencyCode?: string;
  
  /**
   * Country code for the payment
   * @default 'KW'
   */
  countryCode?: string;
  
  /**
   * Payment amount (required)
   */
  amount: string;
  
  /**
   * Authentication token from Hesabe (required)
   */
  token: string;
  
  /**
   * Request data for the payment (required)
   */
  requestData: string;
  
  /**
   * Array of available payment gateway IDs (required)
   */
  availablePaymentGateways: number[];
  
  /**
   * DOM element configuration for Apple Pay buttons
   */
  elements?: {
    /**
     * Query selector for Apple Pay button elements
     * @default '.applePayBtn'
     */
    applePayButtonQuerySelector?: string;
  };
  
  /**
   * Session ID for the payment (auto-generated if not provided)
   */
  sessionId?: string;
  
  /**
   * Merchant code for display purposes
   */
  merchantCode?: string;
}

export interface PaymentTypes {
  MPGS_APPLE_PAY: 9;
  CYBERSOURCE_APPLE_PAY: 10;
  KNET_DEBIT: 11;
  KNET_CREDIT: 12;
  KNET_INTERNATIONAL_APPLE_PAY: 13;
  AMEX_APPLE_PAY: 14;
}

export interface ApplePayCardConfig {
  merchantCapabilities: string[];
  supportedNetworks: string[];
}

/**
 * HesabeApplePay - Apple Pay integration library for Hesabe payment gateway
 * 
 * @example
 * \`\`\`javascript
 * const applePay = new HesabeApplePay({
 *   env: 'sandbox',
 *   token: 'your-token',
 *   amount: '10.000',
 *   requestData: 'your-request-data',
 *   availablePaymentGateways: [9, 10]
 * });
 * 
 * applePay.init();
 * \`\`\`
 */
export default class HesabeApplePay {
  /**
   * Available payment types
   */
  static readonly PAYMENT_TYPES: PaymentTypes;
  
  /**
   * Apple Pay payment method IDs
   */
  static readonly APPLE_PAYMENT_METHOD_IDS: number[];
  
  /**
   * Default Apple Pay card configuration
   */
  static readonly AP_DEFAULT_CARD: ApplePayCardConfig;
  
  /**
   * Create a new HesabeApplePay instance
   * @param config Configuration object for Apple Pay integration
   */
  constructor(config: HesabeApplePayConfig);
  
  /**
   * Initialize Apple Pay functionality
   * Call this method after creating the instance to set up Apple Pay
   * @returns The HesabeApplePay instance for method chaining
   */
  init(): HesabeApplePay;
}`;

// Ensure dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the TypeScript definition file
fs.writeFileSync(path.join(distDir, 'hesabe-apple-pay.d.ts'), typesContent);
console.log('✅ TypeScript definitions generated successfully');