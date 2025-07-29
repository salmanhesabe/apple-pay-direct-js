/**
 * HesabePayment - Clean Apple Pay Integration Library
 */
class HesabePayment2 {
    constructor(options = {}) {
        this.applePaySession = null;
        this.debug = options.debug || false;
        this.isApplePayAvailable = false;
        this._checkApplePayAvailability();
    }

    /**
     * Check Apple Pay availability
     */
    _checkApplePayAvailability() {
        if (typeof window !== 'undefined' && window.ApplePaySession) {
            this.isApplePayAvailable = ApplePaySession.canMakePayments();
        }
    }

    /**
     * Initialize Apple Pay with essential parameters
     * @param {Object} config - Configuration object
     * @param {string} config.merchantIdentifier - Apple Pay merchant ID
     * @param {string} config.amount - Payment amount
     * @param {string} config.currencyCode - Currency code (e.g., 'USD', 'KWD')
     * @param {string} config.countryCode - Country code (e.g., 'US', 'KW')
     * @param {string} config.paymentType - Payment type identifier
     * @param {string} config.paymentToken - Your payment token
     * @param {string} config.sessionId - Session ID
     * @param {string} config.requestData - Request data
     * @param {Object} config.applePayFilters - Apple Pay filters/settings
     * @param {string} config.validationRoute - Merchant validation route
     * @param {string} config.paymentRoute - Payment processing route
     * @param {Function} config.onSuccess - Success callback
     * @param {Function} config.onError - Error callback
     */
    applePayInit(config) {
        try {
            // Validate required parameters
            const required = ['merchantIdentifier', 'amount', 'currencyCode', 'countryCode', 'paymentType'];
            for (const field of required) {
                if (!config[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            if (!this.isApplePayAvailable) {
                throw new Error('Apple Pay is not available');
            }

            // Store configuration
            this.config = config;

            if (this.debug) {
                console.log('Apple Pay initialized successfully');
            }

            return true;

        } catch (error) {
            if (this.debug) {
                console.error('Apple Pay initialization failed:', error);
            }

            if (config.onError) {
                config.onError(error);
            }

            return false;
        }
    }

    /**
     * Start Apple Pay payment session
     */
    startPayment() {
        if (!this.config) {
            throw new Error('Apple Pay not initialized');
        }

        const {amount, currencyCode, countryCode, paymentType, applePayFilters} = this.config;

        // Build payment request
        const paymentRequest = {
            currencyCode: currencyCode,
            countryCode: countryCode,
            total: {
                label: '',
                type: 'final',
                amount: amount
            }
        };

        // Apply filters from your existing setup
        if (applePayFilters) {
            const filters = typeof applePayFilters === 'string'
                ? JSON.parse(this._decodeHTMLEntities(applePayFilters))
                : applePayFilters;

            Object.assign(paymentRequest, filters);
        }

        // Set payment type specific capabilities
        if (paymentType === '11') {
            paymentRequest.merchantCapabilities = ['supports3DS', 'supportsDebit'];
            paymentRequest.supportedCountries = ['KW'];
        } else if (paymentType === '12') {
            paymentRequest.merchantCapabilities = ['supports3DS', 'supportsCredit'];
            paymentRequest.supportedCountries = ['KW'];
        }

        // Create Apple Pay session
        this.applePaySession = new ApplePaySession(3, paymentRequest);

        // Set up event handlers
        this._setupEventHandlers();

        // Begin session
        this.applePaySession.begin();

        if (this.debug) {
            console.log('Apple Pay session started');
        }
    }

    /**
     * Setup Apple Pay session event handlers
     */
    _setupEventHandlers() {
        const {
            validationRoute,
            paymentRoute,
            paymentToken,
            paymentType,
            requestData,
            sessionId,
            onSuccess,
            onError
        } = this.config;

        // Merchant validation
        this.applePaySession.onvalidatemerchant = (event) => {
            if (this.debug) {
                console.log('Merchant validation required');
            }

            this._performValidation(event.validationURL, validationRoute, paymentToken, paymentType)
                .then(merchantSession => {
                    this.applePaySession.completeMerchantValidation(merchantSession);
                })
                .catch(error => {
                    if (this.debug) {
                        console.error('Merchant validation failed:', error);
                    }
                    if (onError) onError(error);
                });
        };

        // Payment authorization
        this.applePaySession.onpaymentauthorized = (event) => {
            if (this.debug) {
                console.log('Payment authorized');
            }

            this._sendPaymentToken(event.payment.token, paymentRoute, paymentToken, paymentType, requestData, sessionId)
                .then(success => {
                    const status = success ? ApplePaySession.STATUS_SUCCESS : ApplePaySession.STATUS_FAILURE;
                    this.applePaySession.completePayment(status);

                    if (success && onSuccess) {
                        onSuccess(event.payment);
                    }
                })
                .catch(error => {
                    this.applePaySession.completePayment(ApplePaySession.STATUS_FAILURE);
                    if (onError) onError(error);
                });
        };

        // Session cancellation
        this.applePaySession.oncancel = (event) => {
            if (this.debug) {
                console.log('Apple Pay session cancelled');
            }
        };
    }

    /**
     * Perform merchant validation
     */
    _performValidation(validationURL, validationRoute, paymentToken, paymentType) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const urlParams = new URLSearchParams(window.location.search);
            const serviceId = urlParams.get('serviceTypeId');

            xhr.onload = () => {
                try {
                    const data = JSON.parse(xhr.responseText);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };

            xhr.onerror = reject;
            xhr.open("GET", `${validationRoute}?u=${validationURL}&token=${paymentToken}&serviceId=${serviceId}&payId=${paymentType}`);
            xhr.send();
        });
    }

    /**
     * Send payment token to server
     */
    _sendPaymentToken(paymentToken, paymentRoute, token, paymentType, requestData, sessionId) {
        return new Promise((resolve, reject) => {
            if (this.debug) {
                console.log('Sending payment token');
            }

            const url = `${paymentRoute}?token=${token}&paymentType=${paymentType}&data=${requestData}&applePaymentToken=${encodeURIComponent(JSON.stringify(paymentToken.paymentData))}&paymentMethod=${encodeURIComponent(JSON.stringify(paymentToken.paymentMethod))}&session_id=${sessionId}&transactionIdentifier=${paymentToken.transactionIdentifier.toLowerCase()}`;

            // Redirect to payment processing
            window.location.href = url;
            resolve(true);
        });
    }

    /**
     * Check if Apple Pay can make payments with active card
     */
    static canMakePaymentsWithActiveCard(merchantIdentifier) {
        if (!window.ApplePaySession) {
            return Promise.resolve(false);
        }

        return ApplePaySession.canMakePaymentsWithActiveCard(merchantIdentifier);
    }

    /**
     * Decode HTML entities (helper method)
     */
    _decodeHTMLEntities(str) {
        return str.replace(/&quot;/g, '"');
    }


}

