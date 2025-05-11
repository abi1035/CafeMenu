import React, { useEffect, useState } from 'react';

// Map base item names to image paths
const itemImages = {
  'Coffee': '/CoffeeCup.jpg',
  'Tea': '/Tea.jpg',
  'Muffin': '/Muffin.jpg',
  'Cookie': '/Cookie.jpg',
  'Blue Tart': '/Muffin.jpg',
  'Pie': '/PumpkinPie.jpg'
};

export default function SalesReport() {
  const [itemData, setItemData] = useState([]);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem('allCafeOrders')) || [];
    const totals = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        // Remove anything in parentheses to group e.g. Coffee (Small) => Coffee
        const baseName = item.name.split(' (')[0];

        if (!totals[baseName]) {
          totals[baseName] = { quantity: 0, revenue: 0 };
        }

        totals[baseName].quantity += item.quantity;
        totals[baseName].revenue += item.quantity * item.price;
      });
    });

    const sortedItems = Object.entries(totals)
      .map(([name, data]) => ({
        name,
        image: itemImages[name] || '',
        ...data
      }))
      .sort((a, b) => b.quantity - a.quantity);

    setItemData(sortedItems);
  }, []);

  const totalRevenue = itemData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="container">
      <h1>Sales Summary</h1>
      {itemData.length === 0 ? (
        <p>No orders found.</p>
      ) : (
      <table>
  <thead>
    <tr>
      <th></th> {/* empty header for image */}
      <th>Item</th>
      <th>Units Sold</th>
      <th>Total Revenue</th>
    </tr>
  </thead>
  <tbody>
    {itemData.map((item) => (
      <tr key={item.name}>
        <td>
          {item.image && (
            <img src={item.image} alt={item.name} style={{ width: '50px', borderRadius: '8px' }} />
          )}
        </td>
        <td>{item.name}</td>
        <td style={{display:'flex', justifyContent:'center', alignItems:'center' }}>{item.quantity}</td>
        <td>${item.revenue.toFixed(2)}</td>
      </tr>
    ))}
  </tbody>
  <tfoot>
    <tr>
      <td></td>
      <td colSpan="2"><strong>Total Revenue</strong></td>
      <td><strong>${totalRevenue.toFixed(2)}</strong></td>
    </tr>
  </tfoot>
</table>
      )}
    </div>
  );
}
