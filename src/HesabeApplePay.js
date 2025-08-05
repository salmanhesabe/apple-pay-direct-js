/**
 * HesabeApplePay - A modular payment integration class
 * Currently supports Apple Pay with extensible architecture for other payment methods
 */

class HesabeApplePay {
    static PAYMENT_TYPES = {
        MPGS_APPLE_PAY: 9,
        CYBERSOURCE_APPLE_PAY: 11,
        KNET_CREDIT: 12,
        VISA: 10
    };

    static APPLE_PAYMENT_METHOD_IDS = [9, 10, 11, 12, 13, 14];
    static AP_DEFAULT_CARD = {
        merchantCapabilities: ['supports3DS'],
        supportedNetworks: ['visa', 'masterCard']
    };

    #config;
    #internalConfig;

    constructor(config = {}) {
        this.#config = this.#mergeConfig(config);
        this.#internalConfig = {
            routes: {
                appleValidation: this.#getBaseUrl() + '/transaction/apple',
                payment: this.#getBaseUrl() + '/payment'
            },
            token: this.#config.token
        };

        this.#validateConfig();
    }

    #mergeConfig(config) {
        const baseConfig = {
            env: 'sandbox',
            debug: false,
            currencyCode: 'KWD',
            countryCode: 'KW',
            amount: '',
            token: '',
            requestData: '',
            availablePaymentGateways: [],
            elements: {
                applePayButtonContainer: 'applePayment',
                applePayButtonQuerySelector: '.applePayBtn'
            },
            ...config
        };

        // Set internal merchantIdentifier based on the environment
        baseConfig.merchantIdentifier = baseConfig.env === 'production'
            ? 'merchant.hesabe.prod'
            : 'merchant.hesabe.dec';


        // Generate sessionId if not provided
        baseConfig.sessionId = baseConfig.sessionId || this.#generateSessionId();

        return baseConfig;
    }

    #getBaseUrl() {
        return this.#config.env === 'production'
            ? 'https://api.hesabe.com'
            : 'https://dev-paymentapi.hesabe.com';
    }

    #generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `apple-direct-${timestamp}-${random}`;
    }

    #validateConfig() {
        const requiredFields = {
            token: 'Token is required',
            requestData: 'Request data is required',
            amount: 'Amount is required',
            availablePaymentGateways: 'Available payment gateways are required',
            countryCode: 'Country code is required',
            env: 'Environment is required',
            currencyCode: 'Currency code is required'
        };

        for (const [field, message] of Object.entries(requiredFields)) {
            if (!this.#config[field] || (Array.isArray(this.#config[field]) && this.#config[field].length === 0)) {
                throw new Error(`[HesabeApplePay] ${message}`);
            }
        }
    }

    #initialize() {
        // Load Apple Pay SDK first if not already loaded
        this.#loadApplePaySDK().then(() => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.#setupApplePay());
            } else {
                this.#setupApplePay();
            }
        });
    }

    #loadApplePaySDK() {
        return new Promise((resolve) => {
            // Check if Apple Pay SDK is already loaded
            // if (window.ApplePaySession) {
            //     resolve();
            //     return;
            // }

            // Check if script is already being loaded
            const existingScript = document.querySelector('script[src*="apple-pay-sdk.js"]');
            if (existingScript) {
                existingScript.onload = resolve;
                return;
            }

            // Create and inject Apple Pay SDK script
            const script = document.createElement('script');
            script.src = 'https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js';
            script.onload = resolve;
            script.onerror = () => {
                this.#log('Failed to load Apple Pay SDK');
                resolve(); // Continue anyway
            };

            (document.head || document.body || document.documentElement).appendChild(script);
        });
    }

    #setupApplePay() {
        if (!window.ApplePaySession) {
            this.#log('ApplePaySession not available in this browser');
            return;
        }

        if (!this.#isApplePaySupported()) {
            this.#log('Apple Pay not supported or not enabled for merchant');
            return;
        }

        this.#initializeApplePay();
    }

    #isApplePaySupported() {
        return window.ApplePaySession &&
            this.#config.merchantIdentifier &&
            HesabeApplePay.APPLE_PAYMENT_METHOD_IDS.some(v =>
                this.#config.availablePaymentGateways.includes(v)
            );
    }

    async #initializeApplePay() {
        try {
            const canPay = await ApplePaySession.applePayCapabilities(this.#config.merchantIdentifier);

            if (!canPay) {
                this.#log('Apple Pay available in browser, but merchant not activated for domain');
                return;
            }

            this.#setupApplePayButtons();
            this.#log('Apple Pay initialized successfully');
        } catch (error) {
            this.#log('Apple Pay initialization failed:', error);
        }
    }

    #createPaymentRequest(paymentType) {
        const paymentRequest = {
            countryCode: this.#config.countryCode,
            currencyCode: this.#config.currencyCode,
            total: {
                label: this.#config.merchantCode || 'Payment',
                type: 'final',
                amount: this.#config.amount
            }
        };

        // Apply default card settings
        Object.keys(HesabeApplePay.AP_DEFAULT_CARD).forEach(key => {
            paymentRequest[key] = HesabeApplePay.AP_DEFAULT_CARD[key];
        });

        // Specific configurations for KNET payment types
        if (paymentType === 11) {
            paymentRequest.merchantCapabilities = ['supports3DS', 'supportsDebit'];
        }
        if (paymentType === 12) {
            paymentRequest.merchantCapabilities = ['supports3DS', 'supportsCredit'];
        }
        if (paymentType === 11 || paymentType === 12) {
            paymentRequest.supportedCountries = ['KW'];
        }

        return paymentRequest;
    }

    async #processPayment(paymentType) {
        const paymentRequest = this.#createPaymentRequest(paymentType);
        const session = new ApplePaySession(5, paymentRequest);

        // Merchant validation
        session.onvalidatemerchant = async (event) => {
            this.#log('Validating merchant...');

            try {
                const validationUrl = this.#buildValidationUrl(event.validationURL, paymentType);
                const response = await fetch(validationUrl);

                if (!response.ok) {
                    throw new Error(`Validation failed: ${response.status}`);
                }

                const merchantSession = await response.json();
                session.completeMerchantValidation(merchantSession);
            } catch (error) {
                this.#log('Merchant validation failed:', error);
                session.abort();
            }
        };

        // Payment authorization
        session.onpaymentauthorized = (event) => {
            this.#log('Payment authorized', event.payment);
            this.#handleApplePayAuthorization(event.payment, paymentType, session);
        };

        // Payment cancellation
        session.oncancel = (event) => {
            this.#log('Apple Pay cancelled', event);
        };

        session.begin();
    }

    /**
     * Setup Apple Pay button event listeners
     */
    #setupApplePayButtons() {
        const applePayContainer = document.getElementById(this.#config.elements.applePayButtonContainer);
        if (!applePayContainer) {
            this.#log('Apple Pay button container not found');
            return;
        }

        applePayContainer.style.display = 'block';

        document.querySelectorAll(this.#config.elements.applePayButtonQuerySelector).forEach(button => {
            const paymentType = parseInt(button.dataset.paymenttype);
            const canShowButton = paymentType && this.#config.availablePaymentGateways.includes(paymentType);

            button.style.display = canShowButton ? 'inline-block' : 'none';

            button.onclick = (event) => {
                event.preventDefault();
                if (canShowButton) {
                    this.#processPayment(paymentType);
                } else {
                    this.#log('Apple Pay button not enabled for this merchant');
                }
            };
        });
    }


    /**
     * Build validation URL for Apple Pay merchant validation
     */
    #buildValidationUrl(validationURL, paymentType) {
        const params = new URLSearchParams({
            u: validationURL,
            token: this.#internalConfig.token,
            serviceId: new URLSearchParams(location.search).get('serviceTypeId') || '',
            payId: paymentType
        });

        return `${this.#internalConfig.routes.appleValidation}?${params.toString()}`;
    }

    /**
     * Handle Apple Pay payment authorization
     */
    #handleApplePayAuthorization(payment, paymentType, session) {

        try {
            const paymentParams = new URLSearchParams({
                token: this.#internalConfig.token,
                paymentType: paymentType,
                data: this.#config.requestData,
                applePaymentToken: JSON.stringify(payment.token.paymentData),
                paymentMethod: JSON.stringify(payment.token.paymentMethod),
                session_id: this.#config.sessionId,
                transactionIdentifier: (payment.token.transactionIdentifier || '').toLowerCase()
            });

            const paymentUrl = `${this.#internalConfig.routes.payment}?${paymentParams.toString()}`;

            session.completePayment(ApplePaySession.STATUS_SUCCESS);
            location.href = paymentUrl;
        } catch (error) {
            this.#log('Payment processing failed:', error);
            session.completePayment(ApplePaySession.STATUS_FAILURE);
        }
    }


    /**
     * Utility method for debug logging
     */
    #log(...args) {
        if (this.#config.debug) {
            console.log('[HesabeApplePay]', ...args);
        }
    }


    /**
     * Public method to initialize Apple Pay
     * This is the only method that should be called by merchants
     */
    init() {
        this.#initialize();
        return this;
    }
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.HesabeApplePay = HesabeApplePay;
}

export default HesabeApplePay;


