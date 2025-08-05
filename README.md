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

### CDN

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
        },
        paymentAttemptedCallback: () => {
        }, // If we want to handle payment completion without redirection, for redirect no need pass this callback or keep it null
        paymentCancelledCallback: () => {
        } // Optional callback for Apple Pay cancellation
    }


    const payment = new HesabeApplePay(config);
    payment.init();
</script>
```

---

### ES Modules

#### JS Section : Initialize Hesabe Apple Pay

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
    currencyCode: 'KWD',
    paymentAttemptedCallback: (result) => {
    }, // If we want to handle payment completion without redirection, for redirect no need pass this callback or keep it null
    paymentCancelledCallback: () => {
    } // Optional callback for Apple Pay cancellation
}

const payment = new HesabeApplePay(config);

// Call init when it is ready check browser compatibility and show the buttons 
payment.init();
```

#### HTML Section : Design your Apple Pay button

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

| Option                     | Type     | Required | Description                                                                      |
|----------------------------|----------|----------|----------------------------------------------------------------------------------|
| `token`                    | string   | ✓        | Authentication token                                                             |
| `requestData`              | string   | ✓        | Encrypted payment data                                                           |
| `amount`                   | string   | ✓        | Payment amount                                                                   |
| `availablePaymentGateways` | array    | ✓        | List of available payment gateway IDs. See [Types](#payment-types-for-apple-pay) |
| `countryCode`              | string   |          | Country code (default: `'KW'`)                                                   |
| `env`                      | string   | ✓        | Environment: `'sandbox'` or `'production'`                                       |
| `currencyCode`             | string   |          | Currency code (default: `'KWD'`)                                                 |
| `debug`                    | boolean  |          | Enable debug logging (default: `false`)                                          |
| `paymentAttemptedCallback` | function |          | Optional callback for successful payment. Not required if redirection is used    |
| `paymentCancelledCallback` | function |          | Optional callback for payment cancellation                                       |
| `elements`                 | object   |          | DOM element configuration for Apple Pay buttons                                  |

### Elements Configuration

The `elements` object configures how the library interacts with your DOM elements:

```javascript
elements: {
    applePayButtonQuerySelector: '.apple-pay-button'      // CSS selector for buttons
}
```

- `applePayButtonQuerySelector`: CSS selector to find Apple Pay buttons

### Payment Callback

You can provide an optional callback function to handle payment completion instead of browser redirection:

```javascript
paymentAttemptedCallback: (result) => {
    if (result.success) {
        // Payment was successful
        console.log('Transaction details:', result.data);
        // result.data contains the transaction enquiry response with status, amount, etc.
    } else {
        // Payment failed
        console.log('Payment error:', result.error);
    }
}
```

**Enquiry API Response Examples:**

### `result` in `paymentAttemptedCallback`

**Successful Transaction:**

```json
{
  "status": true,
  "message": "Transaction found",
  "data": {
    "data": [
      {
        "token": "<TOKEN>",
        "amount": "9.000",
        "reference_number": "<REFERENCE_NUMBER>",
        "status": "SUCCESSFUL",
        "TransactionID": "<TRANSACTION_ID>",
        "Id": "<ID>",
        "PaymentID": "<PAYMENT_ID>",
        "Terminal": "<TERMINAL_ID>",
        "TrackID": "<TRACK_ID>",
        "payment_type": "<TYPE_NAME>",
        "service_type": "<SERVICE_TYPE>",
        "customerName": "",
        "customerEmail": "",
        "customerMobile": "",
        "customerCardType": "-NA-",
        "customerCard": "-NA-",
        "datetime": "2025-02-12 16:13:58"
      }
    ]
  }
}
```

**Failed Transaction:**

```json
{
  "status": true,
  "message": "Transaction found",
  "data": {
    "data": [
      {
        "token": "<TOKEN>",
        "amount": "33.000",
        "reference_number": "<REFERENCE_NUMBER>",
        "status": "FAILED",
        "TransactionID": "<TRANSACTION_ID>",
        "Id": "<ID>",
        "PaymentID": "<PAYMENT_ID>",
        "Terminal": "<TERMINAL_ID>",
        "TrackID": "<TRACK_ID>",
        "payment_type": "<TYPE_NAME>",
        "service_type": "<SERVICE_TYPE>",
        "customerName": null,
        "customerEmail": null,
        "customerMobile": null,
        "customerCardType": "-NA-",
        "customerCard": "-NA-",
        "datetime": "2025-07-01 17:33:25"
      }
    ]
  }
}
```

**Transaction Not Found:**

```json
{
  "status": false,
  "message": "Transaction not found",
  "data": null
}
```

**Error Occured:**

```json
{
  "status": false,
  "message": "<error_message>"
}
```

### Payment Cancellation Callback

This callback is triggered when the user cancels the Apple Pay session before completing the payment.

```javascript
config.paymentCancelledCallback = () => {
    console.log('User cancelled the payment');
    // Handle cancellation logic here
}
```

## Payment Types for Apple Pay

> Make sure to pass the correct payment type ID in the `availablePaymentGateways` array in the configuration. and it is
> enabled in your Hesabe account.

- `MPGS_APPLE_PAY` (9) - MPGS Apple Pay
- `CYBERSOURCE_APPLE_PAY` (10) - CyberSource Apple Pay
- `KNET_DEBIT` (11) - KNET Debit cards
- `KNET_CREDIT` (12) - KNET Credit cards
- `KNET_INTERNATIONAL_APPLE_PAY` (13) - KNET International Apple Pay
- `AMEX_APPLE_PAY` (14) - American Express Apple Pay

## Testing Environment:

- Use token and request data from the Hesabe sandbox environment.
- Make sure enviroment is set to `sandbox` for testing purposes.
- Enable debug mode by setting `debug: true` in the configuration to see detailed logs in the console.

## Going Live

- Ensure you have a valid merchant enabled "Apple Pay" payment method for live account.
- Set the `env` to `production` in the configuration.
- Set the `debug` to `false` in the configuration.
- Make sure checkout token and request data are valid for production.
- Test thoroughly in the sandbox environment before switching to production.

## Browser Support

- Safari 11.1+
- iOS Safari 11.3+
- Other browsers with Apple Pay JS support