# Hesabe Apple Pay

A module for Apple Pay integration directly on merchant websites through the Hesabe payment gateway.

## Installation

### NPM

```bash
npm i @hesabe-pay/direct-apple-pay
```

### CDN

```html

<script src="https://unpkg.com/@hesabe-pay/direct-apple-pay@latest/cdn/hesabe-apple-pay.min.js"></script>
```

## Usage

#### Steps

1. Request Checkout API in Hesabe (Follow the normal steps)
2. In response, you will get `token` and `data`, pass it as `token` and `requestData` respectively in the
   `HesabeApplePay` constructor.
3. Pass the Apple Pay button selector (eg: `.apple-pay-button`) `config.elements.applePayButtonQuerySelector`
4. After all the required parameters are set, call the `init()` method to initialize Apple Pay.




### Browser (UMD)

```html
<head>
   <script src="https://unpkg.com/@hesabe-pay/direct-apple-pay@latest/cdn/hesabe-apple-pay.min.js"></script>
</head>
   <body>
      <button class="apple-pay-button" data-paymenttype="9">
         Apple Pay
      </button>
   </body>
<script>

   const config = {
      token: 'token',
      requestData: 'encrypted-data',
      amount: '10.00',
      availablePaymentGateways: [9],
      countryCode: 'KW',
      currencyCode: 'KWD',
      env: 'sandbox',
      debug: true,
      elements: {
         applePayButtonQuerySelector: '.apple-pay-button'
      }
   }
   const payment = new HesabeApplePay(config);

   payment.init();
</script>
```
---

### ES Modules

```javascript
import HesabeApplePay from '@hesabe-pay/direct-apple-pay';

const config = {
    token: 'token',
    requestData: 'encrypted-data',
    amount: '10.00',
    availablePaymentGateways: [9],
    countryCode: 'KW',
    env: 'sandbox',
    elements: {
        applePayButtonQuerySelector: '.apple-pay-button'
    },
    currencyCode: 'KWD'
}

const payment = new HesabeApplePay(config);

// Call init when it is ready check browser compatibility and show the buttons 
payment.init();
```
#### HTML : Design your Apple Pay button
```html
<!--HTML Part-->
<!-- Design your apple button with attribute data-paymenttype and class -->
<body>
      <button class="apple-pay-button" data-paymenttype="9">
         Apple Pay
      </button>
</body>
```
---


## Configuration

| Option                       | Type    | Required | Description                                           |
|------------------------------|---------|----------|-------------------------------------------------------|
| `token`                    a | string  | ✓        | Authentication token                                  |
| `requestData`                | string  | ✓        | Encrypted payment data                                |
| `amount`                     | string  | ✓        | Payment amount                                        |
| `availablePaymentGateways`   | array   | ✓        | Available payment gateway IDs,[Types](#payment-types) |
| `countryCode`                | string  |          | Country code. default 'KW'                            |
| `env`                        | string  | ✓        | Environment: 'sandbox' or 'production'                |
| `currencyCode`               | string  |          | Currency code. default 'KWD'                          |
| `debug`                      | boolean |          | Enable debug logging (default: false)                 |
| `elements`                   | object  |          | DOM element configuration for Apple Pay buttons       |

### Elements Configuration

The `elements` object configures how the library interacts with your DOM elements:

```javascript
elements: {
    applePayButtonQuerySelector: '.apple-pay-button'      // CSS selector for buttons
}
```


- `applePayButtonQuerySelector`: CSS selector to find Apple Pay buttons

**Testing Environment:**
- Make sure enviroment is set to `sandbox` for testing purposes.
- Enable debug mode by setting `debug: true` in the configuration to see detailed logs in the console.

## Before going live
- Ensure you have a valid merchant enabled "Apple Pay" payment method for live account.
- Set the `env` to `production` in the configuration.
- Set the `debug` to `false` in the configuration.
- Make sure checkout token and request data are valid for production.
- Test thoroughly in the sandbox environment before switching to production.


## Methods

- `init()` - Initialize Apple Pay

## Payment Types

- `MPGS_APPLE_PAY` (9) - MPGS Apple Pay
- `CYBERSOURCE_APPLE_PAY` (10) - CyberSource Apple Pay
- `KNET_DEBIT` (11) - KNET Debit cards
- `KNET_CREDIT` (12) - KNET Credit cards
- `KNET_INTERNATIONAL_APPLE_PAY` (13) - KNET International Apple Pay
- `AMEX_APPLE_PAY` (14) - American Express Apple Pay

## Browser Support

- Safari 11.1+
- iOS Safari 11.3+
- Other browsers with Apple Pay JS support

## License

MIT License - see LICENSE file for details.