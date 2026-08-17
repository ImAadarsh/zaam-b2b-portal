'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DeliverySelector } from '@/components/checkout/DeliverySelector';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { BankTransferTab } from '@/components/checkout/BankTransferTab';
import { CreditCardTab } from '@/components/checkout/CreditCardTab';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { zaamApi } from '@/lib/api';
import { getAffiliateAttribution } from '@/lib/affiliate';
import {
  CreditCard,
  Building2,
  Wallet,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

export default function CheckoutPage() {
  const { cart, totalAmount, clearCart } = useCart();
  const { retailer, availableCredit, refreshProfile } = useAuth();
  const { showToast } = useNotifications();

  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'card' | 'credit'>('bank_transfer');
  const [selectedBankId, setSelectedBankId] = useState('barclays');
  const [banks, setBanks] = useState<{ id: string; name: string; logo: string; popular?: boolean }[]>([]);
  const [paymentMeta, setPaymentMeta] = useState<any>(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    holderName: retailer?.contactName || ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    couponCode: string;
    couponName: string;
    discountAmount: number;
    freeShipping?: boolean;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [opts, methods] = await Promise.all([
          zaamApi.getShippingOptions(totalAmount),
          zaamApi.getPaymentMethods()
        ]);
        setDeliveryOptions(opts);
        if (opts[0]) setSelectedDelivery(opts[0].id || opts[0].code);
        setPaymentMeta(methods);
        // UK bank directory for open-banking UI selection (not operational ledger data)
        setBanks([
          { id: 'barclays', name: 'Barclays', logo: '🏦', popular: true },
          { id: 'hsbc', name: 'HSBC', logo: '🏛️', popular: true },
          { id: 'lloyds', name: 'Lloyds', logo: '🐴' },
          { id: 'natwest', name: 'NatWest', logo: '🟣' },
          { id: 'monzo', name: 'Monzo', logo: '🧡', popular: true },
          { id: 'starling', name: 'Starling', logo: '⭐' }
        ]);
      } catch (e: any) {
        showToast(e.message || 'Failed to load checkout options', 'error');
      }
    })();
  }, [totalAmount]);

  if (cart.length === 0 && !completedOrder) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900">Your basket is empty</h2>
        <p className="text-xs text-neutral-500">Add items from the wholesale catalog before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-flex items-center space-x-2 bg-zaam-green-600 hover:bg-zaam-green-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-glow-green"
        >
          <span>Browse Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleProcessOrder = async () => {
    if (!retailer) return;
    setIsProcessing(true);
    setPendingNotice(null);
    try {
      const deliveryObj = deliveryOptions.find((d) => d.id === selectedDelivery || d.code === selectedDelivery);
      const aff = getAffiliateAttribution();
      const { order } = await zaamApi.createOrder({
        lines: cart.map((i) => ({ variantId: i.variant.id, quantity: i.quantity })),
        shippingMethod: deliveryObj?.name,
        shippingMethodCode: deliveryObj?.code || deliveryObj?.id,
        paymentMethod,
        couponCode: appliedCoupon?.couponCode,
        ...aff
      });

      let paidOrder: any = order;
      if (paymentMethod === 'credit') {
        paidOrder = await zaamApi.payWithTradeCredit(order.id);
        setCompletedOrder(paidOrder);
        clearCart();
        await refreshProfile();
        showToast(`Order ${paidOrder.orderNumber} authorized on trade credit`, 'success');
      } else if (paymentMethod === 'card') {
        if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv) {
          throw new Error('Enter card number, expiry, and CVV for Worldpay card payment');
        }
        const result = await zaamApi.payIntent(order.id, 'card', { cardDetails });
        paidOrder = result.order;
        setCompletedOrder({
          ...paidOrder,
          gatewayUsed: result.gateway
            ? `${result.gateway.name} (${result.gateway.mode === 'test' ? 'TEST' : 'LIVE'})`
            : paidOrder.gatewayUsed,
          settlementNote: result.message
        });
        clearCart();
        await refreshProfile();
        showToast(result.message || `Order ${paidOrder.orderNumber} paid`, 'success');
      } else {
        const result = await zaamApi.payIntent(order.id, 'bank_transfer', { bankId: selectedBankId });
        paidOrder = result.order;
        setPendingNotice(result.bankTransferInstructions || result.message || 'Awaiting bank transfer confirmation');
        setCompletedOrder({
          ...paidOrder,
          gatewayUsed: result.gateway
            ? `${result.gateway.name} (${result.gateway.mode === 'test' ? 'TEST' : 'LIVE'} — pending)`
            : 'Manual bank transfer (pending)',
          settlementNote: result.message,
          bankTransferInstructions: result.bankTransferInstructions
        });
        clearCart();
        await refreshProfile();
        showToast('Order placed — payment pending bank confirmation (not auto-completed)', 'warning');
      }
    } catch (err: any) {
      showToast(err.message || 'Order processing error', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedShip = deliveryOptions.find((d) => d.id === selectedDelivery || d.code === selectedDelivery);
  const shipExVat = appliedCoupon?.freeShipping ? 0 : Number(selectedShip?.price || 0);
  const shipVat = shipExVat > 0 ? shipExVat * 0.2 : 0;
  const couponDiscount = Number(appliedCoupon?.discountAmount || 0);
  const payableTotal = Math.max(0, totalAmount + shipExVat + shipVat - couponDiscount);

  if (completedOrder) {
    const isPending = String(completedOrder.paymentStatusLabel || completedOrder.gatewayUsed || '').toLowerCase().includes('pending')
      || Boolean(pendingNotice)
      || Boolean(completedOrder.bankTransferInstructions);
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-soft-lg text-center space-y-5">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-soft-md ${isPending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-600'}`}>
            {isPending ? <AlertTriangle className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
          </div>
          <div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${isPending ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
              {isPending ? 'Order placed — payment pending' : 'Payment confirmed'}
            </span>
            <h2 className="text-2xl font-extrabold text-zaam-dark-900 mt-2">Wholesale order received</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Order Reference: <strong className="text-neutral-900 font-mono text-sm">{completedOrder.orderNumber}</strong>
            </p>
          </div>
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 text-left text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-neutral-800">
              <span>Settlement Method:</span>
              <span className="text-zaam-green-700">{completedOrder.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span>Processor:</span>
              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-neutral-200">
                {completedOrder.gatewayUsed || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span>Delivery Method:</span>
              <span>{completedOrder.deliveryMethod}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span>Total (Inc VAT):</span>
              <strong className="text-sm text-neutral-900">£{Number(completedOrder.total).toFixed(2)}</strong>
            </div>
            {completedOrder.bankTransferInstructions && (
              <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2">
                {completedOrder.bankTransferInstructions}
              </p>
            )}
            {completedOrder.settlementNote && (
              <p className="text-neutral-600 pt-1">{completedOrder.settlementNote}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link href="/" className="w-full sm:w-auto bg-zaam-green-600 hover:bg-zaam-green-700 text-white text-xs font-bold py-3 px-6 rounded-xl shadow-glow-green">
              Return to Dashboard
            </Link>
            <Link href="/shop" className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold py-3 px-6 rounded-xl">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const preferredCard = paymentMeta?.preferredCardProvider || 'worldpay';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-zaam-green-700 to-zaam-green-600 text-white rounded-2xl shadow-glow-green">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-zaam-dark-900">Wholesale B2B Checkout</h1>
            <p className="text-xs text-neutral-500">
              Card payments route through configured ERP gateways (preferred: {preferredCard}). No simulated success.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>API-backed settlement</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="lg:col-span-2 xl:col-span-3 space-y-6">
          <DeliverySelector
            options={deliveryOptions}
            selectedOption={selectedDelivery}
            onSelect={setSelectedDelivery}
          />

          <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Payment Gateway</h3>
                <p className="text-[11px] text-neutral-500">Select payment method for order settlement</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setPaymentMethod('bank_transfer')} className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${paymentMethod === 'bank_transfer' ? 'bg-zaam-green-50/70 border-zaam-green-600 text-zaam-green-900 ring-2 ring-zaam-green-600/15' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
                <Building2 className={`w-5 h-5 ${paymentMethod === 'bank_transfer' ? 'text-zaam-green-600' : 'text-neutral-400'}`} />
                <span className="text-xs font-bold">Pay by Bank</span>
              </button>
              <button type="button" onClick={() => setPaymentMethod('card')} className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${paymentMethod === 'card' ? 'bg-zaam-green-50/70 border-zaam-green-600 text-zaam-green-900 ring-2 ring-zaam-green-600/15' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
                <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-zaam-green-600' : 'text-neutral-400'}`} />
                <span className="text-xs font-bold">Pay by Card</span>
                <span className="text-[9px] text-neutral-400 font-medium">{preferredCard}</span>
              </button>
              <button type="button" onClick={() => setPaymentMethod('credit')} className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${paymentMethod === 'credit' ? 'bg-zaam-gold-50/70 border-zaam-gold-500 text-zaam-dark-900 ring-2 ring-zaam-gold-500/20' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
                <Wallet className={`w-5 h-5 ${paymentMethod === 'credit' ? 'text-zaam-gold-600' : 'text-neutral-400'}`} />
                <span className="text-xs font-bold">Trade Credit</span>
              </button>
            </div>

            <div className="pt-2">
              {paymentMethod === 'bank_transfer' && (
                <BankTransferTab
                  banks={banks}
                  selectedBankId={selectedBankId}
                  onSelectBank={setSelectedBankId}
                  instructions={paymentMeta?.bankTransferInstructions}
                />
              )}
              {paymentMethod === 'card' && (
                <CreditCardTab cardDetails={cardDetails} onChange={setCardDetails} />
              )}
              {paymentMethod === 'credit' && (
                <div className="bg-zaam-gold-50/60 border border-zaam-gold-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800">Available Trade Facility:</span>
                    <span className="text-sm font-extrabold text-zaam-dark-900">£{availableCredit.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    This order (£{totalAmount.toFixed(2)}) will be invoiced to your {retailer?.companyName} trade account.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <OrderSummary
            appliedCoupon={appliedCoupon}
            onCouponApplied={setAppliedCoupon}
            shippingPrice={
              appliedCoupon?.freeShipping
                ? 0
                : Number(
                    deliveryOptions.find((d) => d.id === selectedDelivery || d.code === selectedDelivery)?.price || 0
                  )
            }
            shippingLabel={
              deliveryOptions.find((d) => d.id === selectedDelivery || d.code === selectedDelivery)?.name || 'Delivery'
            }
          />
          <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-3">
            <button
              onClick={handleProcessOrder}
              disabled={isProcessing || !selectedDelivery}
              className={`w-full font-bold text-sm py-4 px-5 rounded-2xl flex items-center justify-center space-x-2 shadow-glow-green btn-press transition-all ${isProcessing || !selectedDelivery ? 'bg-neutral-400 text-white cursor-not-allowed' : 'bg-zaam-green-600 hover:bg-zaam-green-700 text-white'}`}
            >
              {isProcessing ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Authorizing Settlement...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authorize £{payableTotal.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-neutral-400 leading-tight">
              By confirming, you authorize delivery to <strong>{retailer?.tradingName}</strong> under your trade agreement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
