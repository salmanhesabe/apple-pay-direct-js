/*!
 * Hesabe Apple Pay v1.0.0
 * Apple Pay integration library for Hesabe payment gateway
 * (c) 2025 Salman Ulfaris
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.HesabeApplePay = factory());
})(this, (function () { 'use strict';

    /**
     * HesabeApplePay - A modular payment integration class
     * Currently supports Apple Pay with extensible architecture for other payment methods
     */

    class HesabeApplePay {
        static PAYMENT_TYPES = {
            STANDARD: 9,
            KNET_DEBIT: 11,
            KNET_CREDIT: 12,
            VISA: 10
        };

        static APPLE_PAYMENT_METHOD_IDS = [9, 10, 11, 12, 13, 14];
        static SUPPORTED_NETWORKS = ['visa', 'masterCard'];
        static DEFAULT_MERCHANT_CAPABILITIES = ['supports3DS'];

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
            // Don't auto-initialize, wait for init() call
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
                    applePayButtonQuerySelector: '.applePaybtn'
                },
                ...config
            };

            // Set internal merchantIdentifier based on environment
            baseConfig.merchantIdentifier = baseConfig.env === 'production'
                ? 'merchant.hesabe.prod'
                : 'merchant.hesabe.dev';


            // Generate sessionId if not provided
            baseConfig.sessionId = baseConfig.sessionId || this.#generateSessionId();

            return baseConfig;
        }

        #getBaseUrl() {
            return this.#config.env === 'production'
                ? 'https://hesabe.com'
                : 'https://sandbox.hesabe.com';
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
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.#setupApplePay());
            } else {
                this.#setupApplePay();
            }
        }

        #setupApplePay() {
            if (!window.ApplePaySession) {
                this.#log('Apple Pay not available in this browser');
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
                const canPay = await ApplePaySession.canMakePaymentsWithActiveCard(this.#config.merchantIdentifier);

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
            const merchantCapabilities = this.#getApplePayCapabilities(paymentType);
            const supportedCountries = this.#getApplePaySupportedCountries(paymentType);

            return {
                countryCode: this.#config.countryCode,
                currencyCode: this.#config.currencyCode,
                total: {
                    label: this.#config.merchantCode || 'Hesabe Payment',
                    type: 'final',
                    amount: this.#config.amount
                },
                supportedNetworks: HesabeApplePay.SUPPORTED_NETWORKS,
                merchantCapabilities: merchantCapabilities,
                supportedCountries: supportedCountries
            };
        }

        async #processPayment(paymentType) {
            const paymentRequest = this.#createPaymentRequest(paymentType);
            const session = new ApplePaySession(4, paymentRequest);

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
         * Get Apple Pay merchant capabilities based on payment type
         */
        #getApplePayCapabilities(paymentType) {
            switch (paymentType) {
                case HesabeApplePay.PAYMENT_TYPES.KNET_DEBIT:
                    return [...HesabeApplePay.DEFAULT_MERCHANT_CAPABILITIES, 'supportsDebit'];
                case HesabeApplePay.PAYMENT_TYPES.KNET_CREDIT:
                    return [...HesabeApplePay.DEFAULT_MERCHANT_CAPABILITIES, 'supportsCredit'];
                default:
                    return HesabeApplePay.DEFAULT_MERCHANT_CAPABILITIES;
            }
        }

        /**
         * Get Apple Pay supported countries based on payment type
         */
        #getApplePaySupportedCountries(paymentType) {
            return [this.#config.countryCode];
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

    return HesabeApplePay;

}));
