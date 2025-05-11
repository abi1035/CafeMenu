import React, { useEffect, useState } from 'react';

export default function SummaryPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('allCafeOrders')) || [];
    setOrders(stored);
  }, []);

  const totalCollected = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Daily Summary</h1>
      <p><strong>Total Collected:</strong> ${totalCollected.toFixed(2)}</p>
      <h2>Orders:</h2>
      <ul>
        {orders.map((order, index) => (
          <li key={index} style={{ marginBottom: '1rem' }}>
            <p><strong>Time:</strong> {order.timestamp}</p>
            <ul>
              {order.items.map((item, idx) => (
                <li key={idx}>{item.name} x{item.quantity} = ${(item.price * item.quantity).toFixed(2)}</li>
              ))}
            </ul>
            <p>Total: ${order.total}</p>
            <hr />
          </li>
        ))}
      </ul>
      <button
  onClick={() => {
    localStorage.removeItem('allCafeOrders');
    alert('All saved orders have been cleared.');
  }}
  className="clear-storage-button"
>
  Clear Saved Orders
</button>
    </div>
  );
}
