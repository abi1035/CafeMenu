import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function CheckoutPage() {
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('allCafeOrders')) || [];
    setOrders(stored);
  }, []);

  // Extract unique dates and branches
  const uniqueDates = Array.from(
    new Set(
      orders.map(o => new Date(o.timestamp).toLocaleDateString())
    )
  );

 

  // Filter orders by selected date and branch
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.timestamp).toLocaleDateString();
    const matchesDate = selectedDate ? orderDate === selectedDate : true;
    const matchesBranch = selectedBranch === 'All' || order.branch === selectedBranch;
    return matchesDate && matchesBranch;
  });

  // Group and summarize items
  const itemSummary = {};
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      const key = item.name;
      if (!itemSummary[key]) {
        itemSummary[key] = { name: item.name, quantity: 0, total: 0 };
      }
      itemSummary[key].quantity += item.quantity;
      itemSummary[key].total += item.quantity * item.price;
    });
  });

  const summarizedItems = Object.values(itemSummary).sort(
    (a, b) => b.quantity - a.quantity
  );

  const totalCollected = filteredOrders.reduce(
    (sum, order) => sum + parseFloat(order.total),
    0
  );

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Daily Sales Summary</h1>
      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
  Filter by Date:
  <DatePicker
    selected={selectedDate ? new Date(selectedDate) : null}
    onChange={(date) => setSelectedDate(date ? date.toLocaleDateString() : '')}
    placeholderText="Select a date"
    className="calendar-input"
    dateFormat="MM/dd/yyyy"
    isClearable
    popperPlacement="bottom-start"  // 👈 ensures alignment
    popperModifiers={[
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        },
      },
    ]}
  />
</label>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>

        {/* <label>
          Filter by Branch:{' '}
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
          >
            <option value="All">All Branches</option>
            {uniqueBranches.map((branch, idx) => (
              <option key={idx} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </label> */}
      </div>

      <p>
        <strong>Total Collected:</strong> ${totalCollected.toFixed(2)}
      </p>

      {summarizedItems.length === 0 ? (
        <p>No items sold for this filter.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: '2px solid #999', padding: '0.5rem' }}>
                Item
              </th>
              <th style={{ borderBottom: '2px solid #999', padding: '0.5rem' }}>
                Quantity Sold
              </th>
              <th style={{ borderBottom: '2px solid #999', padding: '0.5rem' }}>
                Total Sales ($)
              </th>
            </tr>
          </thead>
          <tbody>
            {summarizedItems.map((item, idx) => (
              <tr key={idx}>
                <td style={{ padding: '0.5rem' }}>{item.name}</td>
                <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
                <td style={{ padding: '0.5rem' }}>
                  {(item.total*1.13).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
