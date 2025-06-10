import React, { useEffect, useState } from 'react';

// Map base item names to image paths
const itemImages = {
  'Coffee': '/CoffeeCup.png',
  'Tea': '/Tea.png',
  'Muffin': '/Muffin.png',
  'Cookie': '/Cookie.png',
  'Butter Tart': '/Butter-Tarts.png',
  'Pie': '/PumpkinPie.png',
  'Noodles Pack': '/Mr.Noodles.png',
  'Noodle Bowl': '/Koi_Noodle.png',
  'Plain Bagel': '/Bagel.png',
  'Bagel Cream Cheese': '/bagelcreamcheese.png',
  'BBQ Meal': '/BBQMeal.png',
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

  
  const totalRevenue = itemData.reduce((sum, item) => sum + item.revenue+item.revenue*0.13, 0);

  return (
    <div className="container">
      <h1>Sales Summary</h1>
      {itemData.length === 0 ? (
        <p>No orders found.</p>
      ) : (
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
  <thead>
    <tr>
      <th style={{ width: '60px' }}></th> {/* image column */}
      <th style={{ textAlign: 'left', padding: '8px' }}>Item</th>
      <th style={{ textAlign: 'center', padding: '8px' }}>Units Sold</th>
      <th style={{ textAlign: 'right', padding: '8px' }}>Total Revenue</th>
    </tr>
  </thead>
  <tbody>
    {itemData.map((item) => (
      <tr key={item.name} style={{ borderBottom: '1px solid #ddd' }}>
        <td style={{ padding: '8px' }}>
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
            />
          )}
        </td>
        <td style={{ padding: '8px' }}>{item.name}</td>
        <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
        <td style={{ padding: '8px', textAlign: 'right' }}>${item.revenue.toFixed(2)}</td>
      </tr>
    ))}
  </tbody>
  <tfoot>
    <tr>
      <td></td>
      <td colSpan="2" style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>Total Revenue</td>
      <td style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>${totalRevenue.toFixed(2)}</td>
    </tr>
  </tfoot>
</table>
      )}
    </div>
  );
}
