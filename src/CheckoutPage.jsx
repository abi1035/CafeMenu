import React, { useEffect, useState } from 'react';

export default function SummaryPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('allCafeOrders')) || [];
    setOrders(stored);
  }, []);

  // Group orders by date (yyyy-mm-dd format)
  const groupedByDate = {};

orders.forEach(order => {
  const parsed = new Date(order.timestamp);
  
  // Safely convert to 'MM/DD/YYYY' or your desired format
  const dateStr = !isNaN(parsed.getTime())
    ? parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' })
    : 'Invalid Date';

  if (!groupedByDate[dateStr]) {
    groupedByDate[dateStr] = [];
  }
  groupedByDate[dateStr].push(order);
});


  // Get item summary for a group of orders
  const summarizeItems = (ordersForDate) => {
    const itemMap = {};

    ordersForDate.forEach(order => {
      order.items.forEach(item => {
        const key = item.name;
        if (!itemMap[key]) {
          itemMap[key] = { name: key, quantity: 0, total: 0 };
        }
        itemMap[key].quantity += item.quantity;
        itemMap[key].total += item.quantity * item.price;
      });
    });

    return Object.values(itemMap).sort((a, b) => b.quantity - a.quantity);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Sales Summary by Date</h1>

      {Object.entries(groupedByDate).map(([date, dateOrders]) => {
        const dailyTotal = dateOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
        const itemSummary = summarizeItems(dateOrders);

        return (
          <div key={date} style={{ marginBottom: '3rem' }}>
            <h2>{date}</h2>
            <p><strong>Total Collected:</strong> ${dailyTotal.toFixed(2)}</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '50%', textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #ccc' }}>Item</th>
                  <th style={{ width: '25%', textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #ccc' }}>Quantity</th>
                  <th style={{ width: '25%', textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #ccc' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {itemSummary.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '0.5rem', textAlign: 'left' }}>{item.name}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'left' }}>{item.quantity}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'left' }}>${(item.total*1.13).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        );
      })}
    </div>
  );
}
