import React, { useEffect, useState } from 'react';

// list of items that should have Hide buttons (base names, without sizes)
const HIDEABLE_BASENAMES = new Set([
  'Water',
  'Pop',
  'Chai Tea' // add more if needed
]);

const baseName = (name) => name.split(' (')[0];

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

  // Summarize items for one day, respecting hidden set
  const summarizeItems = (ordersForDate) => {
    const map = {};
    ordersForDate.forEach((order) => {
      order.items.forEach((it) => {
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
            subtotal: 0,
            hideable: isHideable,
          };
        }
        map[it.name].quantity += it.quantity;
        map[it.name].subtotal += it.quantity * it.price;
      });
    });
    return Object.values(map).sort((a, b) => b.quantity - a.quantity);
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
        const dailySubtotal = itemSummary.reduce((s, i) => s + i.subtotal, 0);
        const dailyTax = dailySubtotal * 0.13;
        const dailyTotal = dailySubtotal + dailyTax;

        return (
          <div key={date} style={{ marginBottom: '3rem' }}>
            <h2>{date}</h2>
            <p>
              <strong>Total Collected:</strong> ${dailyTotal.toFixed(2)}
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
                    Subtotal
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
                      ${it.subtotal.toFixed(2)}
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
                    <strong>${dailyTax.toFixed(2)}</strong>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                    <strong>Total</strong>
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                    <strong>${dailyTotal.toFixed(2)}</strong>
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
