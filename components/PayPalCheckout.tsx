import React, { useEffect, useRef } from 'react';

interface PayPalCheckoutProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

declare global {  
  interface Window {
    paypal: any;
  }
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({ amount, onSuccess, onCancel }) => {
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const render = () => {
      if (!window.paypal || !paypalRef.current) return;
      paypalRef.current.innerHTML = '';
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'pill',
          label: 'pay',
          height: 50,
          fundingicons: true // Show funding icons for cards
        },
        fundingSource: undefined, // Allow both PayPal and cards
        enableStandardCardFields: true,
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount.toFixed(2),
                currency_code: 'USD'
              },
              description: `CineNYC Movie Tickets - ${Math.round(amount / 12.00)} Seats`
            }],
            application_context: {
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW'
            }
          });
        },
        onApprove: async (data: any, actions: any) => {
          // Capture the transaction
          const order = await actions.order.capture();
          console.log('Payment Approved:', order);
          onSuccess();
        },
        onCancel: () => {
          onCancel();
        },
        onError: (err: any) => {
          console.error('PayPal Error:', err);
        }
      }).render(paypalRef.current);
    };

    if (window.paypal) {
      render();
    } else {
      const script = document.querySelector('script[src*="paypal.com/sdk/js"]');
      script?.addEventListener('load', render);
      return () => script?.removeEventListener('load', render);
    }
  }, [amount, onSuccess, onCancel]);

  return (
    <div ref={paypalRef} />
  );
};

export default PayPalCheckout;