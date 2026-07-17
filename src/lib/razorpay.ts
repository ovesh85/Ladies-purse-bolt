declare global {
  interface Window {
    Razorpay: any;
  }
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}

export type RazorpayOptions = {
  amount: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (paymentId: string, signature: string) => void;
  onFailure: (error: any) => void;
};

const RAZORPAY_KEY_ID = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_DEMOMOCKKEY0001';

export async function openRazorpayCheckout(opts: RazorpayOptions) {
  await loadScript();

  const amountPaise = Math.round(opts.amount * 100);

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amountPaise,
    currency: 'INR',
    name: 'Marisol',
    description: `Order ${opts.orderNumber}`,
    prefill: {
      name: opts.customerName,
      email: opts.customerEmail,
      contact: opts.customerPhone,
    },
    theme: { color: '#a06a42' },
    handler: (response: any) => {
      opts.onSuccess(response.razorpay_payment_id, response.razorpay_signature || '');
    },
    modal: {
      ondismiss: () => opts.onFailure(new Error('Payment dismissed')),
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (resp: any) => {
    opts.onFailure(resp.error || new Error('Payment failed'));
  });
  rzp.open();
}
