# Hesabe Apple Pay

A lightweight, modular Apple Pay integration library for the Hesabe payment gateway.

## Installation

### NPM

```bash
npm i @hesabe-pay/direct-apple-pay
```

### CDN

```html

<script src="https://unpkg.com/@hesabe-pay/direct-apple-pay@1.0.0/dist/hesabe-apple-pay.js"></script>
```

## Usage

#### Steps

1. Request Checkout API in Hesabe (Follow the normal steps)
2. In response, you will get `token` and `data`, pass it as `token` and `requestData` respectively in the
   `HesabeApplePay` constructor.
3. Pass the Apple Pay container element ID in html as `config.elements.applePayButtonContainer`
4. Pass the Apple Pay button selector (eg: `.apple-pay-button`) `config.elements.applePayButtonQuerySelector`
5. After all the required parameters are set, call the `init()` method to initialize Apple Pay.

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
    currencyCode: 'KWD'
}

const payment = new HesabeApplePay(config);

// Call init when it is ready check browser compatibility and show the buttons 
payment.init();
```
#### HTML : Design your Apple Pay button
```html
<!--HTML Party-->
<!-- Design your apple -->
<body>
   <div class="applePayButtonContainer">
      <button class="apple-pay-button" data-paymenttype="9">
         Apple Pay
      </button>
   </div>
</body>
```

### Browser (UMD)

```html

<head>
   <script src="https://unpkg.com/@hesabe-pay/direct-apple-pay@1.0.0/dist/hesabe-apple-pay.js"></script>
</head>
<body>
<div class="applePayButtonContainer">
   <button class="apple-pay-button" data-paymenttype="9">
      Apple Pay
   </button>
</div>
</body>
<script>

   const config = {
      token: 'token',
      requestData: 'encrypted-data',
      amount: '10.00',
      availablePaymentGateways: [9],
      countryCode: 'KW',
      env: 'sandbox',
      debug: false,
      currencyCode: 'KWD',
      elements: {
         applePayButtonContainerId: 'applePayButtonContainer',
         applePayButtonQuerySelector: '.apple-pay-button'
      }
   }
   const payment = new HesabeApplePay(config);

   payment.init();
</script>
```

## Configuration

| Option                     | Type    | Required | Description                            |
|----------------------------|---------|----------|----------------------------------------|
| `token`                    | string  | ✓        | Authentication token                   |
| `requestData`              | string  | ✓        | Encrypted payment data                 |
| `amount`                   | string  | ✓        | Payment amount                         |
| `availablePaymentGateways` | array   | ✓        | Available payment gateway IDs          |
| `countryCode`              | string  |          | Country code. default 'KW'             |
| `env`                      | string  | ✓        | Environment: 'sandbox' or 'production' |
| `currencyCode`             | string  |          | Currency code. default 'KWD'           |
| `debug`                    | boolean |          | Enable debug logging (default: false)  |


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