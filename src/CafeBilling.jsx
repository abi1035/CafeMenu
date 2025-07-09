import React, { useState } from 'react';
import './CafeBilling.css';


const items = [
  {
    id: 1,
    name: 'Coffee',
    image: '/CoffeeCup.png',
    branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'],
    sizes: [
      { label: 'Small', price: 1.1062, totalPrice:1.25 },
      { label: 'Large', price: 1.7699, totalPrice:2.00 },
    ],
  },

  {
    id: 2,
    name: 'Tea',
    image: '/Tea.png',
    branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'],
    sizes: [
      { label: 'Small', price: 1.1062, totalPrice:1.25 },
      { label: 'Large', price: 1.1062, totalPrice:1.25 },
    ],
  },
  { id: 19, name: 'Water', price: 1.7699, image:'/Water.png', branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'], totalPrice:2.00 },

  { id: 3, name: 'Muffin', price: 1.3274, image:'/Muffin.png', branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'], totalPrice:1.5 },
  { id: 4, name: 'Cookie', price: 1.1062, image:'/Cookie.png', branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'], totalPrice:1.25 },
  { id: 21, name: 'Butter Tart', price: 1.5486, image:'/Butter-Tarts.png', branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'], totalPrice:1.75 },
  { id: 20, name: 'Pop', price: 1.7699, image:'/Pop.png', branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'], totalPrice:2.00 },

{
    id: 6,
    name: 'Noodles Pack',
    image:'/Mr.Noodles.png',
    price:1.1062,
    branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'],
    totalPrice:1.25
  },
  {
    id: 7,
    name: 'Noodle Bowl',
    image:'/Koi_Noodle.png',
    price:2.2123,
    branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'],
    totalPrice:2.50
  },
  {
    id: 8,
    name: 'Plain Bagel',
    image:'/Bagel.png',
    price:1.327, 
    branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'],
    totalPrice:1.5
  },
  {
    id: 9,
    name: 'Bagel Cream Cheese',
    image:'/bagelcreamcheese.png',
    price:1.991,
    branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'],
    totalPrice:2.25
  },
  {
    id: 10,
    name: 'Chai Tea',
    image: '/chaiTea.png',
    branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'],
    sizes: [
      { label: 'Small', price: 1.3274, totalPrice:1.50 },
      { label: 'Large', price: 1.7699, totalPrice:2.00 },
    ],
  },
  {
    id: 11,
    name: 'BBQ Meal',
    image:'/BBQMeal.png',
    price:4.42477,
    branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'],
    totalPrice:5.00
  },
  {
    id: 12,
    name: 'Ice Cream [Drumsticks]',
    image:'/iceCream.png',
    price:1.9911,
    branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'],
    totalPrice:2.25
  },
  {
    id: 13,
    name: 'Samosas',
    image:'/Samosa.png',
    price:1.7699,
    branches: ['BurtonManor'],
    totalPrice:2.00
  },
  {
    id: 14,
    name: 'Tossed Salad',
    image:'/TossedSalad.png',
    price:1.9911,
    branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'],
    totalPrice:2.25
  },
  {
    id: 16,
    name: 'Egg Salad Sandwich',
    image:'/EggSalad.png',
    price:1.7699,
    branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'],
    totalPrice:2.00
  },
  {
    id: 17,
    name: 'Turkey Sandwich',
    image:'/Turkey.png',
    price:2.6548,
    branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'],
    totalPrice:3.00
  },
   {
    id: 18,
    name: 'Beef Sandwich',
    image:'/BeefSW.png',
    price:2.6548,
    branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'],
    totalPrice:3.00
  },
 
];

export default function CafeBilling() {
  const [order, setOrder] = useState({});
  const [activeItemId, setActiveItemId] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('HenleyPlace');

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
      // timestamp: new Date().toLocaleString(),
      timestamp: new Date().toISOString(),
        branch: selectedBranch
      
    };

   
  
    const prevOrders = JSON.parse(localStorage.getItem('allCafeOrders')) || [];
    localStorage.setItem('allCafeOrders', JSON.stringify([...prevOrders, newOrder]));
      alert('Item has been added to the check out')
  
    clearOrder(); // clear the form
    // alert('Order saved!');
  };

  

  return (
    <div className="container">
      <h1 className="title">Café Vita</h1>

    <div className="branch-selector">
      <label>Select Branch: </label>
      <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="branch-dropdown">
        <option value="HenleyPlace">Henley Place</option>
        <option value="HenleyHouse">Henley House</option>
        <option value="BurtonManor">Burton Manor</option>
      </select>
    </div>

      <div className="menu-grid">
      {items.filter(item => {
    // Show only items for selected branch
    if (selectedBranch === 'HenleyPlace') {
      return !item.branches || item.branches.includes('HenleyPlace');
    } else if (selectedBranch === 'HenleyHouse') {
      return item.branches && item.branches.includes('HenleyHouse');
    } else if (selectedBranch === 'BurtonManor') {
      return item.branches && item.branches.includes('BurtonManor');
    }
    return false;
  }).map(item => (
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
                {size.label} - ${size.totalPrice.toFixed(2)}
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
        <img src={item.image} alt={item.name} style={{ height: '138px', objectFit: 'contain' }} className="menu-image" />
        {item.name} - ${item.totalPrice.toFixed(2)}
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
