import React, { useState } from 'react';
import './CafeBilling.css';

const items = [
  {
    id: 1,
    name: 'Coffee',
    image: '/CoffeeCup.png',
    sizes: [
      { label: 'Small', price: 1.1062 },
      { label: 'Large', price: 1.7699 },
    ],
  },
  {
    id: 2,
    name: 'Tea',
    image: '/Tea.png',
    sizes: [
      { label: 'Small', price: 1.1062 },
      { label: 'Large', price: 1.1062 },
    ],
  },

  { id: 3, name: 'Muffin', price: 1.3274, image:'/Muffin.png' },
  { id: 4, name: 'Cookie', price: 1.1062, image:'/Cookie.png' },
  { id: 4, name: 'Butter Tart', price: 1.5486, image:'/Butter-Tarts.png' },
  {
    id: 5,
    name: 'Pie',
    image:'/PumpkinPie.png',
    sizes: [
      { label: 'Apple', price: 1.7699 },
      { label: 'Lemon', price: 1.7699 },
    ],
  }
];

export default function CafeBilling() {
  const [order, setOrder] = useState({});
  const [activeItemId, setActiveItemId] = useState(null);

  const addItem = (item, sizeOption = null) => {
    const itemKey = sizeOption ? `${item.name} (${sizeOption.label})` : item.name;
    const price = sizeOption ? sizeOption.price : item.price;

    setOrder((prevOrder) => {
      const existing = prevOrder[itemKey] || { name: itemKey, price, quantity: 0 };
      return {
        ...prevOrder,
        [itemKey]: { ...existing, quantity: existing.quantity + 1 },
      };
    });

   
  };

  const removeItem = (itemKey) => {
    setOrder((prevOrder) => {
      const newOrder = { ...prevOrder };
      if (newOrder[itemKey].quantity > 1) {
        newOrder[itemKey].quantity -= 1;
      } else {
        delete newOrder[itemKey];
      }
      return newOrder;
    });
  };

  const clearOrder = () => setOrder({});

  const orderedItems = Object.values(order);
  const subtotal = orderedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.13;
  const total = subtotal + tax;

  const handleCheckout = () => {
    const newOrder = {
      items: orderedItems,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      timestamp: new Date().toLocaleString(),
    };
  
    const prevOrders = JSON.parse(localStorage.getItem('allCafeOrders')) || [];
    localStorage.setItem('allCafeOrders', JSON.stringify([...prevOrders, newOrder]));
      alert('Item has been checkedout')
  
    clearOrder(); // clear the form
    // alert('Order saved!');
  };

  

  return (
    <div className="container">
      <h1 className="title">Café Vita</h1>
      <div className="menu-grid">
      {items.map(item => (
  <div key={item.id}>
    {item.sizes ? (
      <>
        <button
          onClick={() =>
            setActiveItemId(activeItemId === item.id ? null : item.id)
          }
          className="menu-button"
        >
        <img src={item.image} alt={item.name} className="menu-image" />
          {item.name}
        </button>

        {activeItemId === item.id && (
          <div className="size-buttons">
            {item.sizes.map(size => (
              <button
                key={size.label}
                onClick={() => {
                  addItem(item, size);
                  setActiveItemId(null); // hide buttons after selection
                }}
                className="size-button"
              >
                {size.label} - ${size.price.toFixed(2)}
              </button>
            ))}
          </div>
        )}
      </>
    ) : (
      <button
        onClick={() => addItem(item)}
        className="menu-button"
      >
        <img src={item.image} alt={item.name} className="menu-image" />
        {item.name} - ${item.price.toFixed(2)}
      </button>
    )}
  </div>
))}
      </div>

      <h2 className="subtitle">Order Summary</h2>
      {orderedItems.length === 0 ? (
        <p className="empty">No items selected.</p>
      ) : (
        <ul className="order-list">
          {Object.entries(order).map(([key, item]) => (
            <li key={key} className="order-item">
              <span>
                {item.name} x{item.quantity} = ${(item.price * item.quantity).toFixed(2)}
              </span>
              <button onClick={() => removeItem(key)} className="remove-button">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="totals">
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Tax (13%): ${tax.toFixed(2)}</p>
        <p className="total">Total: ${total.toFixed(2)}</p>
      </div>

      

      {orderedItems.length > 0 && (
  <div className="action-buttons">
    <button onClick={clearOrder} className="clear-button">
      Clear Order
    </button>
    <button onClick={handleCheckout} className="checkout-button">
      Checkout
    </button>

    
  </div>
)}
    </div>
  );
}
