import React, { useEffect, useState } from 'react';

// list of items that should have Hide buttons (base names, without sizes)
const HIDEABLE_BASENAMES = new Set([
  'Water',
  'Pop',
  'Chai Tea' // add more if needed
]);

const baseName = (name) => name.split(' (')[0];

// helpers
const toMoney = (n) => Math.round(Number(n || 0) * 100) / 100;

// get a unit pre-tax price for a line item, with fallbacks for legacy saves
const getItemBase = (it) => {
  if (it.priceExTax != null) return Number(it.priceExTax);          // new schema
  if (it.price != null) return Number(it.price);                    // legacy pre-tax or (old) tax-included
  if (it.priceWithTax != null) return toMoney(Number(it.priceWithTax) / 1.13);
  return 0;
};

export default function SummaryPage() {
  const [orders, setOrders] = useState([]);
  const [hiddenItems, setHiddenItems] = useState(new Set());

  // Load saved orders
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('allCafeOrders')) || [];
    setOrders(stored);
  }, []);

  // Load hidden items from storage
  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem('hiddenItems')) || [];
    setHiddenItems(new Set(raw));
  }, []);

  const saveHidden = (set) =>
    localStorage.setItem('hiddenItems', JSON.stringify(Array.from(set)));

  const hideItem = (name) => {
    const next = new Set(hiddenItems);
    next.add(baseName(name)); // hide by base name
    setHiddenItems(next);
    saveHidden(next);
  };

  const unhideAll = () => {
    setHiddenItems(new Set());
    localStorage.removeItem('hiddenItems');
  };

  // Group by date
  const groupedByDate = {};
  orders.forEach((order) => {
    const parsed = new Date(order.timestamp);
    const dateStr = !isNaN(parsed.getTime())
      ? parsed.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        })
      : 'Invalid Date';
    (groupedByDate[dateStr] ||= []).push(order);
  });

  // Summarize items for one day, respecting hidden set (pre-tax subtotals)
  const summarizeItems = (ordersForDate) => {
    const map = {};
    ordersForDate.forEach((order) => {
      (order.items || []).forEach((it) => {
        const bn = baseName(it.name);

        // skip if hidden
        if (hiddenItems.has(bn)) return;

        // decide if hideable: either from order OR fallback to current list
        const isHideable =
          it.hideable !== undefined ? !!it.hideable : HIDEABLE_BASENAMES.has(bn);

        if (!map[it.name]) {
          map[it.name] = {
            name: it.name,
            quantity: 0,
            subtotalEx: 0, // pre-tax
            hideable: isHideable,
          };
        }
        const unitBase = getItemBase(it);
        map[it.name].quantity += Number(it.quantity) || 0;
        map[it.name].subtotalEx += unitBase * (Number(it.quantity) || 0);
      });
    });
    return Object.values(map)
      .map((row) => ({ ...row, subtotalEx: toMoney(row.subtotalEx) }))
      .sort((a, b) => b.quantity - a.quantity);
  };

  // Prefer saved daily totals when present (keeps rounding consistent). Otherwise recompute.
  const computeDailyTotals = (dateOrders) => {
    const allHaveSaved = dateOrders.every(
      (o) => o.subtotal != null && o.tax != null && o.total != null
    );
    if (allHaveSaved) {
      const subtotal = dateOrders.reduce((s, o) => s + parseFloat(o.subtotal), 0);
      const tax = dateOrders.reduce((s, o) => s + parseFloat(o.tax), 0);
      const total = dateOrders.reduce((s, o) => s + parseFloat(o.total), 0);
      return { subtotal: toMoney(subtotal), tax: toMoney(tax), total: toMoney(total) };
    }

    // Recompute from items (pre-tax → tax → total)
    const subtotal = dateOrders.reduce((sum, o) => {
      const items = o.items || [];
      return (
        sum +
        items.reduce((s, it) => s + getItemBase(it) * (Number(it.quantity) || 0), 0)
      );
    }, 0);
    const tax = subtotal * 0.13;
    const total = subtotal + tax;
    return { subtotal: toMoney(subtotal), tax: toMoney(tax), total: toMoney(total) };
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Sales Summary by Date</h1>

      <button
        onClick={unhideAll}
        style={{
          marginBottom: '1rem',
          padding: '.4rem .8rem',
          background: '#888',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        Unhide All
      </button>

      {Object.entries(groupedByDate).map(([date, dateOrders]) => {
        const itemSummary = summarizeItems(dateOrders);
        const { subtotal, tax, total } = computeDailyTotals(dateOrders);

        return (
          <div key={date} style={{ marginBottom: '3rem' }}>
            <h2>{date}</h2>
            <p>
              <strong>Subtotal:</strong> ${subtotal.toFixed(2)} &nbsp;|&nbsp;
              <strong>Tax (13%):</strong> ${tax.toFixed(2)} &nbsp;|&nbsp;
              <strong>Total Collected:</strong> ${total.toFixed(2)}
            </p>

            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '1rem',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem',
                      borderBottom: '2px solid #ccc',
                    }}
                  >
                    Item
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      padding: '0.5rem',
                      borderBottom: '2px solid #ccc',
                    }}
                  >
                    Quantity
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '0.5rem',
                      borderBottom: '2px solid #ccc',
                    }}
                  >
                    Subtotal (pre-tax)
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '0.5rem',
                      borderBottom: '2px solid #ccc',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {itemSummary.map((it, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '0.5rem' }}>{it.name}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {it.quantity}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                      ${it.subtotalEx.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                      {it.hideable && (
                        <button
                          onClick={() => hideItem(it.name)}
                          style={{
                            padding: '.3rem .6rem',
                            background: '#e11',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        >
                          Hide
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                    <strong>Tax (13%)</strong>
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                    <strong>${tax.toFixed(2)}</strong>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                    <strong>Total</strong>
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                    <strong>${total.toFixed(2)}</strong>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })}
    </div>
  );
}
