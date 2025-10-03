import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './Firebase'
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
  // { id: 19, name: 'Water', price: 1.7699, image:'/Water.png', branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'], totalPrice:2.00, hideable: true },

  { id: 3, name: 'Muffin', price: 1.3274, image:'/Muffin.png', branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'], totalPrice:1.5 },
  { id: 4, name: 'Cookie', price: 1.1062, image:'/Cookie.png', branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'], totalPrice:1.25 },
  { id: 26, name: 'Butter Tart', price: 1.5486, image:'/Butter-Tarts.png', branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'], totalPrice:1.75 },
  // { id: 20, name: 'Pop', price: 1.7699, image:'/Pop.png', branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'], totalPrice:2.00,hideable: true },

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
  // {
  //   id: 10,
  //   name: 'Chai Tea',
  //   image: '/chaiTea.png',
  //   branches: ['HenleyPlace', 'HenleyHouse','BurtonManor'],
  //   sizes: [
  //     { label: 'Small', price: 1.3274, totalPrice:1.50 },
  //     { label: 'Large', price: 1.7699, totalPrice:2.00 },
  //   ],
  //   // hideable: !!items.hideable, 
  // },
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
   {
    id: 23,
    name: 'Couscous Salad',
    image:'/Couscous.png',
    price:4.8672,
    branches: ['HenleyPlace','BurtonManor'],
    totalPrice:5.50
  },
   {
    id: 25,
    name: 'Chicken Ceasar Salad',
    image:'/ChickenCeasarSalad.png',
    price:7.7433,
    branches: ['HenleyPlace','BurtonManor'],
    totalPrice:8.75
  },
   {
    id: 21,
    name: 'Southwest Cobb Salad',
    image:'/SouthwestCobbSalad.png',
    price:7.3008,
    branches: ['HenleyPlace','BurtonManor'],
    totalPrice:8.25
  },
   {
    id: 22,
    name: 'Fruit Cup',
    image:'/FruitCup.png',
    price:3.3185,
    branches: ['HenleyPlace','BurtonManor'],
    totalPrice:3.75
  },
   {
    id: 27,
    name: 'Veggie Cup',
    image:'/VeggieCup.png',
    price:3.3185,
    branches: ['HenleyPlace','BurtonManor'],
    totalPrice:3.75
  },
   {
    id: 24,
    name: 'Yogurt and Fruit Cup',
    image:'/YougurtFruitCup.png',
    price:3.3185,
    branches: ['HenleyPlace','BurtonManor'],
    totalPrice:3.75
  },
   {
    id: 25,
    name: 'Chili',
    image:'/Soup.png',
    price:2.6548,
    branches: ['HenleyPlace'],
    totalPrice:3.00
  },
 
   {
    id: 26,
    name: 'Soup',
    image:'/chili.png',
    price:4.425,
    branches: ['HenleyPlace'],
    totalPrice:5.00
  },
 
];




export default function CafeBilling() {
  const [order, setOrder] = useState({});
  const [activeItemId, setActiveItemId] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('HenleyPlace');

  const HIDEABLE_BASENAMES = new Set([
  'Water', // add any others you want hideable
  'Pop',
]);

const isPlainObject = (v) => Object.prototype.toString.call(v) === '[object Object]';

const sanitizeForFirestore = (value) => {
  if (value === undefined) return undefined;           // caller will drop it
  if (value === null) return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return value;
  }
  if (typeof value === 'string' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    // drop undefined entries
    return value
      .map((v) => sanitizeForFirestore(v))
      .filter((v) => v !== undefined);
  }
  if (isPlainObject(value)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const sv = sanitizeForFirestore(v);
      if (sv !== undefined) out[k] = sv; // omit undefined fields
    }
    return out;
  }
  // functions, symbols, etc.
  return null;
};


const toLocalYMD = (d) => {
  const yr = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${yr}-${m}-${day}`;
};


  const pickUnitPrice = (item, sizeOption) => {
  // Prefer totalPrice if present (that’s what you show in UI)
  if (sizeOption) return sizeOption.totalPrice ?? sizeOption.price;
  return item.totalPrice ?? item.price;
};

  const addItem = (item, sizeOption = null) => {
  const itemKey = sizeOption ? `${item.name} (${sizeOption.label})` : item.name;

  const unitBase  = getUnitBase(item, sizeOption);   // pre-tax
  const unitTotal = getUnitTotal(item, sizeOption);  // with tax

  setOrder((prev) => {
    const existing = prev[itemKey] || {
      name: itemKey,
      priceExTax: unitBase,
      priceWithTax: unitTotal,
      quantity: 0,
      hideable: !!item.hideable,
      baseName: item.name.split(' (')[0],
    };
    return {
      ...prev,
      [itemKey]: {
        ...existing,
        quantity: existing.quantity + 1,
        // keep unit prices consistent for this key
        priceExTax: unitBase,
        priceWithTax: unitTotal,
      },
    };
  });
};

  const toMoney = (n) => Math.round(n * 100) / 100;

const getUnitBase = (item, sizeOption) => {
  if (sizeOption) {
    // prefer explicit base price; as a fallback, derive from total if needed
    if (sizeOption.price != null) return sizeOption.price;
    if (sizeOption.totalPrice != null) return toMoney(sizeOption.totalPrice / 1.13);
    return 0;
  }
  if (item.price != null) return item.price;
  if (item.totalPrice != null) return toMoney(item.totalPrice / 1.13);
  return 0;
};

const getUnitTotal = (item, sizeOption) => {
  if (sizeOption) {
    if (sizeOption.totalPrice != null) return sizeOption.totalPrice;
    if (sizeOption.price != null) return toMoney(sizeOption.price * 1.13);
    return 0;
  }
  if (item.totalPrice != null) return item.totalPrice;
  if (item.price != null) return toMoney(item.price * 1.13);
  return 0;
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

// compute from pre-tax values
const subtotal = orderedItems.reduce(
  (sum, item) => sum + item.priceExTax * item.quantity,
  0
);
const tax = subtotal * 0.13;
const total = subtotal + tax;
  
const [saving, setSaving] = useState(false);

const handleCheckout = async () => {
  if (saving) return;
  setSaving(true);

  try {
    const now = new Date();

    const itemsForSave = orderedItems.map((it) =>
      sanitizeForFirestore({
        name: it.name,
        quantity: Number(it.quantity) || 0,
        priceExTax: Math.round((it.priceExTax ?? 0) * 100) / 100,
        priceWithTax: Math.round((it.priceWithTax ?? 0) * 100) / 100,
        hideable: !!it.hideable,
        baseName: it.baseName ?? it.name.split(" (")[0],
      })
    );

    // Firestore payload (can include serverTimestamp)
    const orderForFirestore = sanitizeForFirestore({
      items: itemsForSave,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      timestamp: now.toISOString(),
      ymd: toLocalYMD(now),
      branch: selectedBranch,
      createdAt: serverTimestamp(),
    });

    // Local payload (NO serverTimestamp; all JSON-serializable)
    const orderForLocal = {
      ...orderForFirestore,
      createdAt: now.toISOString(),
    };

    // 1) Save to Firestore
    try {
      await addDoc(collection(db, "orders"), orderForFirestore);
    } catch (err) {
      console.error("Firestore write failed:", err);
      // continue to save locally so clerks still see it
    }

    // 2) Save to the SAME key the Summary page reads
    try {
      const prev = JSON.parse(localStorage.getItem("allCafeOrders") || "[]");
      prev.push(orderForLocal);
      localStorage.setItem("allCafeOrders", JSON.stringify(prev));
    } catch (e2) {
      console.error("LocalStorage write failed:", e2);
    }

    alert("Order saved!");
    clearOrder();
  } finally {
    setSaving(false);
  }
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
              {item.name} x{item.quantity} = ${ (item.priceExTax * item.quantity).toFixed(2) }
              {/* optionally show with-tax per line:
                {' '}(<em>${(item.priceWithTax * item.quantity).toFixed(2)} with tax</em>)
              */}
            </span>
            <button onClick={() => removeItem(key)} className="remove-button">Remove</button>
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
