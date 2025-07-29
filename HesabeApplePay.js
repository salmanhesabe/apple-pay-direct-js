/**
 * HesabeApplePay - A modular payment integration class
 * Currently supports Apple Pay with extensible architecture for other payment methods
 */


class HesabeApplePay {
    constructor(config = {}) {
        this.config = {
            env: 'sandbox', // 'production' or 'sandbox'
            debug: true,
            merchantCode: '',
            merchantIdentifier: '',
            currencyCode: 'KWD',
            countryCode: 'KW',
            amount: '',
            sessionId: '',
            requestData: '',
            elements: {
                spinner: 'appSpin',
                container: 'app',
                applePayButtonContainer: 'applePayment',
                applePayButtonQuerySelector: '.applePaybtn'
            },
            availablePaymentGateways: [9, 10, 11],
            ...config
        };


        this.internalConfig = {
            routes: {
                appleValidation: '',
                payment: ''
            },
            token: '',
        }

        // this.config.availablePaymentGateways = this.#getAvailablePaymentMethodsForMerchant().map(obj => obj.id)


        document.addEventListener('DOMContentLoaded', () => {
            const requiredFields = ['merchantCode', 'merchantIdentifier', 'routes.appleValidation', 'routes.payment'];

            if (!window.ApplePaySession) {
                this.#loadExternalScript('https://cdn.rawgit.com/ricmoo/aes-js/e27b99df/index.js')
                this.#loadExternalScript('https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js', () => {
                    const registeredApp = this.registerApplePay();
                    registeredApp.initialize();
                    this.apppay = registeredApp;
                });
            } else {
                throw new Error('Failed to load Apple Pay script');
            }

        });
    }


    /**
     * Apple Pay Integration
     */
    registerApplePay() {
        const applePayHandler = {
            name: 'HesabeApplePay',
            isSupported: () => {
                return window.ApplePaySession &&
                    this.config.merchantIdentifier &&
                    ["9", "10", "11", "12", "13", "14"].some(v =>
                        this.config.availablePaymentGateways.includes(parseInt(v))
                    );
            },

            initialize: async () => {

                if (!applePayHandler.isSupported()) {
                    this.log('Apple Pay not supported or not enabled for merchant');
                    return;
                }


                try {

                    const canPay = await ApplePaySession.canMakePaymentsWithActiveCard(this.config.merchantIdentifier);

                    if (!canPay) {
                        this.log('Apple Pay available, but not activated');
                        return;
                    }

                    this.#setupApplePayButtons();
                    this.log('Apple Pay initialized successfully');

                } catch (error) {
                    this.log('Apple Pay initialization failed:', error);
                }
            },

            createPaymentRequest: (paymentType) => {
                const merchantCapabilities = this.#getApplePayCapabilities(paymentType);
                const supportedCountries = this.#getApplePaySupportedCountries(paymentType);
                const supportedNetworks = ["visa", "masterCard",];
                return {
                    countryCode: this.config.countryCode,
                    currencyCode: this.config.currencyCode,
                    total: {
                        label: '',
                        type: 'final',
                        amount: this.config.amount,
                    },
                    supportedNetworks: supportedNetworks,
                    merchantCapabilities: merchantCapabilities,
                    supportedCountries: supportedCountries
                };
            },

            processPayment: async (paymentType) => {
                const paymentRequest = applePayHandler.createPaymentRequest(paymentType);
                const session = new ApplePaySession(3, paymentRequest);

                // Merchant validation
                session.onvalidatemerchant = async (event) => {
                    this.log('Validating merchant...');

                    try {
                        const validationUrl = this.#buildValidationUrl(event.validationURL, paymentType);
                        const response = await fetch(validationUrl);
                        const merchantSession = await response.json();
                        session.completeMerchantValidation(merchantSession);
                    } catch (error) {
                        this.log('Merchant validation failed:', error);
                        session.abort();
                    }
                };

                // Payment authorization
                session.onpaymentauthorized = (event) => {
                    this.log('Payment authorized', event.payment);
                    this.#handleApplePayAuthorization(event.payment, paymentType, session);
                };

                // Payment cancellation
                session.oncancel = (event) => {
                    this.log('Apple Pay cancelled', event);
                };

                session.begin();
            }
        };

        return applePayHandler;
    }

    /**
     * Setup Apple Pay button event listeners
     */
    #setupApplePayButtons() {
        const applePayContainer = document.getElementById(this.config.elements.applePayButtonContainer);
        if (!applePayContainer) {
            this.log('Apple Pay button container not found');
            return;
        }

        applePayContainer.style.display = 'block';

        document.querySelectorAll(this.config.elements.applePayButtonQuerySelector).forEach(button => {

            const paymentType = parseInt(button.dataset.paymenttype);
            const canShowButton = paymentType && this.config.availablePaymentGateways.includes(paymentType);

            if (canShowButton) {
                button.style.display = 'inline-block';
            }

            button.onclick = (event) => {
                if (canShowButton) {
                    const applePayHandler = this.apppay;
                    applePayHandler.processPayment(paymentType);
                } else {
                    this.log("Apple button available but not enabled for the merchant")
                }
            };
        });
    }

    /**
     * Get Apple Pay merchant capabilities based on payment type
     */
    #getApplePayCapabilities(paymentType) {
        switch (paymentType) {
            case '11':
                return ['supports3DS', 'supportsDebit'];
            case '12':
                return ['supports3DS', 'supportsCredit'];
            default:
                return ['supports3DS'];
        }
    }

    /**
     * Get Apple Pay supported countries based on payment type
     */
    #getApplePaySupportedCountries(paymentType) {
        return (paymentType === '11' || paymentType === '12') ? ['KW'] : ['KW'];
    }

    /**
     * Build validation URL for Apple Pay merchant validation
     */
    #buildValidationUrl(validationURL, paymentType) {
        const params = new URLSearchParams({
            u: validationURL,
            token: this.internalConfig.token,
            serviceId: new URLSearchParams(location.search).get('serviceTypeId') || '',
            payId: paymentType
        });

        return `${this.internalConfig.routes.appleValidation}?${params.toString()}`;
    }

    /**
     * Handle Apple Pay payment authorization
     */
    #handleApplePayAuthorization(payment, paymentType, session) {
        // Hide main UI and show spinner
        this.#toggleElement(this.config.elements.container, false);
        this.#toggleElement(this.config.elements.spinner, true);

        // Build payment URL
        const paymentParams = new URLSearchParams({
            token: this.internalConfig.token,
            paymentType: paymentType,
            data: this.config.requestData,
            applePaymentToken: JSON.stringify(payment.token.paymentData),
            paymentMethod: JSON.stringify(payment.token.paymentMethod),
            session_id: this.config.sessionId,
            transactionIdentifier: (payment.token.transactionIdentifier || '').toLowerCase()
        });

        const paymentUrl = `${this.internalConfig.routes.payment}?${paymentParams.toString()}`;

        // Complete payment and redirect
        session.completePayment(ApplePaySession.STATUS_SUCCESS);
        location.href = paymentUrl;
    }


    /**
     * Utility method for debug logging
     */
    log(...args) {
        if (this.config.debug) {
            console.log('[HesabeApplePay]', ...args);
        }
    }

    /**
     * Show/hide UI elements
     */
    #toggleElement(elementId, show = true) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    }


    #loadExternalScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        script.async = true;

        script.onload = () => {
            if (typeof callback === 'function') callback();
        };

        script.onerror = () => {
            console.error(`failed to load script: ${src}`);
        };

        document.head.appendChild(script);
    }


}


