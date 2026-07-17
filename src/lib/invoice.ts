import { Order, OrderItem, STORE_NAME, STORE_GSTIN, GST_RATE } from './supabase';
import { formatINR, formatDate } from './format';

export function generateInvoiceHTML(order: Order, items: OrderItem[]): string {
  const cgst = order.gst_amount / 2;
  const sgst = order.gst_amount / 2;
  const rows = items.map((it, idx) => {
    const lineTotal = Number(it.price) * it.quantity;
    const lineGst = Number(it.gst_amount);
    return `
      <tr>
        <td>${idx + 1}</td>
        <td>${it.product_name}${it.product_sku ? `<br/><span class="muted">SKU: ${it.product_sku}</span>` : ''}</td>
        <td class="num">${it.quantity}</td>
        <td class="num">${formatINR(Number(it.price))}</td>
        <td class="num">${it.gst_rate}%</td>
        <td class="num">${formatINR(lineGst)}</td>
        <td class="num">${formatINR(lineTotal)}</td>
      </tr>`;
  }).join('');

  const saddr = order.shipping_address;
  const baddr = order.billing_address;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>GST Invoice - ${order.order_number}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; color: #1c1916; margin: 0; padding: 40px; background: #f3f1ec; }
  .invoice { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #a06a42; padding-bottom: 20px; margin-bottom: 24px; }
  .brand { font-family: Georgia, serif; font-size: 32px; font-weight: 600; color: #1c1916; }
  .brand span { color: #a06a42; }
  .muted { color: #7a7268; font-size: 12px; }
  .title { font-size: 22px; font-weight: 600; margin: 0; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
  .box { background: #faf7f2; padding: 16px; border-radius: 6px; }
  .box h3 { margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #a06a42; }
  .box p { margin: 2px 0; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #1c1916; color: #fff; padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 10px 8px; border-bottom: 1px solid #e7e3da; font-size: 13px; vertical-align: top; }
  .num { text-align: right; }
  .totals { margin-left: auto; width: 280px; }
  .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
  .totals .row.total { border-top: 2px solid #1c1916; margin-top: 8px; padding-top: 12px; font-weight: 600; font-size: 16px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e7e3da; text-align: center; font-size: 11px; color: #7a7268; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
  .badge.paid { background: #d1fae5; color: #065f46; }
  @media print { body { background: #fff; padding: 0; } .invoice { box-shadow: none; } }
</style>
</head>
<body>
<div class="invoice">
  <div class="header">
    <div>
      <div class="brand">${STORE_NAME}<span>.</span></div>
      <p class="muted">123 Commercial Street, Bengaluru 560001<br/>Karnataka, India · GSTIN: ${STORE_GSTIN}</p>
    </div>
    <div style="text-align:right">
      <h2 class="title">Tax Invoice</h2>
      <p class="muted">${order.order_number}</p>
      <p class="muted">Date: ${formatDate(order.created_at)}</p>
      <span class="badge ${order.payment_status === 'paid' ? 'paid' : ''}">${order.payment_status.toUpperCase()}</span>
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <h3>Bill To</h3>
      <p><strong>${order.billing_name}</strong></p>
      ${order.gst_number ? `<p>GSTIN: ${order.gst_number}</p>` : ''}
      <p>${baddr.line1}${baddr.line2 ? `, ${baddr.line2}` : ''}</p>
      <p>${baddr.city}, ${baddr.state} - ${baddr.pincode}</p>
      <p>Phone: ${baddr.phone}</p>
    </div>
    <div class="box">
      <h3>Ship To</h3>
      <p><strong>${saddr.full_name}</strong></p>
      <p>${saddr.line1}${saddr.line2 ? `, ${saddr.line2}` : ''}</p>
      <p>${saddr.city}, ${saddr.state} - ${saddr.pincode}</p>
      <p>Phone: ${saddr.phone}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr><th>#</th><th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">GST</th><th class="num">GST Amt</th><th class="num">Total</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Subtotal</span><span>${formatINR(order.subtotal)}</span></div>
    <div class="row"><span>CGST (${GST_RATE/2}%)</span><span>${formatINR(cgst)}</span></div>
    <div class="row"><span>SGST (${GST_RATE/2}%)</span><span>${formatINR(sgst)}</span></div>
    <div class="row"><span>Shipping</span><span>${order.shipping_amount === 0 ? 'Free' : formatINR(order.shipping_amount)}</span></div>
    <div class="row total"><span>Grand Total</span><span>${formatINR(order.total)}</span></div>
  </div>

  ${order.payment_id ? `<p class="muted" style="margin-top:16px">Payment Reference: ${order.payment_id}</p>` : ''}

  <div class="footer">
    <p>This is a computer-generated invoice and does not require a signature.</p>
    <p>For any queries, contact care@marisol.in or +91 98765 43210 · ${STORE_NAME}</p>
  </div>
</div>
<script>window.onload = () => setTimeout(() => window.print(), 300);</script>
</body>
</html>`;
}

export function downloadInvoice(order: Order, items: OrderItem[]) {
  const html = generateInvoiceHTML(order, items);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Invoice-${order.order_number}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
