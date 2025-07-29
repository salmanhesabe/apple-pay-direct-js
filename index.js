// index.js
// Load MPGS Checkout.js dynamically and configure the payment session
document.addEventListener("DOMContentLoaded", async () => {
    try {
     
        const sessionData ={
    "checkoutMode": "WEBSITE",
    "merchant": "TEST900120301",
    "result": "SUCCESS",
    "session": {
        "id": "SESSION0002312929244K1317359F44",
        "updateStatus": "SUCCESS",
        "version": "b8c0131001"
    },
    "successIndicator": "c8b3830de46c4502"
};

        // ✅ Step 2: Configure Checkout.js
        window.Checkout.configure({
            session: {
                id: sessionData.session.id
            }
        });

        // ✅ Step 3: Attach event to a pay button
        document.getElementById("payButton").addEventListener("click", () => {
            window.Checkout.showPaymentPage();
        });

    } catch (error) {
        console.error("Error initializing checkout:", error);
    }
});
