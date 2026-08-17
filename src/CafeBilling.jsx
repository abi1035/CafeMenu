import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./Firebase";
import "./CafeBilling.css";

// ======================================================
// BRANCHES
// ======================================================

const BRANCHES = [
  { id: "HenleyPlace", label: "Henley Place" },
  { id: "HenleyHouse", label: "Henley House" },
  { id: "BurtonManor", label: "Burton Manor" },
];

// ======================================================
// MENU CATEGORIES
// ======================================================

const MENU_CATEGORIES = [
  {
    id: "beverages",
    label: "Beverages",
    icon: "☕",
  },
  {
    id: "bakery",
    label: "Bakery & Snacks",
    icon: "🥐",
  },
  {
    id: "light-bites",
    label: "Bagels & Light Bites",
    icon: "🥯",
  },
  {
    id: "sandwiches",
    label: "Sandwiches",
    icon: "🥪",
  },
  {
    id: "fresh",
    label: "Salads & Fresh Items",
    icon: "🥗",
  },
  {
    id: "hot-meals",
    label: "Hot Meals",
    icon: "🍲",
  },
  {
    id: "desserts",
    label: "Desserts",
    icon: "🍦",
  },
];

// ======================================================
// MENU ITEMS
// ======================================================

const items = [
  // =========================
  // BEVERAGES
  // =========================

  {
    id: 1,
    name: "Coffee",
    category: "beverages",
    image: "/CoffeeCup.png",
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    sizes: [
      {
        label: "Small",
        price: 1.1062,
        totalPrice: 1.25,
      },
      {
        label: "Large",
        price: 1.7699,
        totalPrice: 2.0,
      },
    ],
  },

  {
    id: 100,
    name: "Espresso Shot",
    category: "beverages",
    price: 0.4425,
    image: "/expressoshot.jpg",
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    totalPrice: 0.5,
  },

  {
    id: 101,
    name: "Specialty Coffee",
    category: "beverages",
    image: "/Specialty.jpg",
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    sizes: [
      {
        label: "Cappuccino",
        price: 1.7699,
        totalPrice: 2.0,
      },
      {
        label: "Latte",
        price: 1.7699,
        totalPrice: 2.0,
      },
    ],
  },

  {
    id: 2,
    name: "Tea",
    category: "beverages",
    image: "/Tea.png",
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    sizes: [
      {
        label: "Small",
        price: 1.1062,
        totalPrice: 1.25,
      },
      {
        label: "Large",
        price: 1.1062,
        totalPrice: 1.25,
      },
    ],
  },

  // =========================
  // BAKERY & SNACKS
  // =========================

  {
    id: 3,
    name: "Muffin",
    category: "bakery",
    price: 1.3274,
    image: "/Muffin.png",
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    totalPrice: 1.5,
  },

  {
    id: 4,
    name: "Cookie",
    category: "bakery",
    price: 1.1062,
    image: "/Cookie.png",
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    totalPrice: 1.25,
  },

  {
    id: 300,
    name: "Butter Tart",
    category: "bakery",
    price: 1.5486,
    image: "/Butter-Tarts.png",
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    totalPrice: 1.75,
  },

  // =========================
  // BAGELS & LIGHT BITES
  // =========================

  {
    id: 8,
    name: "Plain Bagel",
    category: "light-bites",
    image: "/Bagel.png",
    price: 1.327,
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    totalPrice: 1.5,
  },

  {
    id: 9,
    name: "Bagel with Cream Cheese",
    category: "light-bites",
    image: "/bagelcreamcheese.png",
    price: 1.991,
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    totalPrice: 2.25,
  },

  // =========================
  // SANDWICHES
  // =========================

  {
    id: 16,
    name: "Egg Salad Sandwich",
    category: "sandwiches",
    image: "/EggSalad.png",
    price: 3.54,
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    totalPrice: 4.0,
  },

  {
    id: 17,
    name: "Turkey Sandwich",
    category: "sandwiches",
    image: "/Turkey.png",
    price: 3.54,
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    totalPrice: 4.0,
  },

  {
    id: 18,
    name: "Beef Sandwich",
    category: "sandwiches",
    image: "/BeefSW.png",
    price: 3.54,
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    totalPrice: 4.0,
  },

  // =========================
  // SALADS & FRESH ITEMS
  // =========================

  {
    id: 14,
    name: "Tossed Salad",
    category: "fresh",
    image: "/TossedSalad.png",
    price: 3.54,
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    totalPrice: 4.0,
  },

  // {
  //   id: 23,
  //   name: "Couscous Salad",
  //   category: "fresh",
  //   image: "/Couscous.png",
  //   price: 4.8672,
  //   branches: ["HenleyPlace", "BurtonManor"],
  //   totalPrice: 5.5,
  // },

  {
    id: 25,
    name: "Chicken Caesar Salad",
    category: "fresh",
    image: "/ChickenCeasarSalad.png",
    price: 4.42,
    branches: ["HenleyPlace", "BurtonManor"],
    totalPrice: 5.0,
  },

  {
    id: 21,
    name: "Southwest Cobb Salad",
    category: "fresh",
    image: "/SouthwestCobbSalad.png",
    price: 7.3008,
    branches: ["HenleyPlace", "BurtonManor"],
    totalPrice: 8.25,
  },

  {
    id: 22,
    name: "Fruit Cup",
    category: "fresh",
    image: "/FruitCup.png",
    price: 3.3185,
    branches: ["HenleyPlace", "BurtonManor"],
    totalPrice: 3.75,
  },

  {
    id: 24,
    name: "Yogurt & Fruit Cup",
    category: "fresh",
    image: "/YougurtFruitCup.png",
    price: 3.3185,
    branches: ["HenleyPlace", "BurtonManor"],
    totalPrice: 3.75,
  },

  // =========================
  // HOT MEALS
  // =========================

  {
    id: 6,
    name: "Noodle Pack",
    category: "hot-meals",
    image: "/Mr.Noodles.png",
    price: 1.1062,
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    totalPrice: 1.25,
  },

  {
    id: 7,
    name: "Noodle Bowl",
    category: "hot-meals",
    image: "/Koi_Noodle.png",
    price: 2.2123,
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    totalPrice: 2.5,
  },

  {
    id: 11,
    name: "BBQ Meal",
    category: "hot-meals",
    image: "/BBQMeal.png",
    price: 4.42477,
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    totalPrice: 5.0,
  },

  {
    id: 13,
    name: "Samosas",
    category: "hot-meals",
    image: "/Samosa.png",
    price: 1.7699,
    branches: ["BurtonManor"],
    totalPrice: 2.0,
  },

  {
    id: 27,
    name: "Chili",
    category: "hot-meals",
    image: "/chili.png",
    price: 4.425,
    branches: ["HenleyPlace", "BurtonManor", "HenleyHouse"],
    totalPrice: 5.0,
  },

  {
    id: 26,
    name: "Soup",
    category: "hot-meals",
    image: "/Soup.png",
    price: 2.6548,
    branches: ["HenleyPlace", "BurtonManor", "HenleyHouse"],
    totalPrice: 3.0,
  },

  {
    id: 30,
    name: "Jamaican Patty",
    category: "hot-meals",
    image: "/JamaicanPatty.jpg",
    price: 1.7699,
    branches: ["HenleyPlace", "BurtonManor", "HenleyHouse"],
    totalPrice: 2.0,
  },

  {
    id: 31,
    name: "Poutine",
    category: "hot-meals",
    image: "/poutine.jpg",
    price: 4.42477,
    branches: ["HenleyPlace", "BurtonManor", "HenleyHouse"],
    totalPrice: 5.0,
  },

  // =========================
  // DESSERTS
  // =========================

  {
    id: 12,
    name: "Ice Cream Drumstick",
    category: "desserts",
    image: "/iceCream.png",
    price: 1.9911,
    branches: ["HenleyPlace", "HenleyHouse", "BurtonManor"],
    totalPrice: 2.25,
  },
];

// ======================================================
// COMPONENT
// ======================================================

export default function CafeBilling() {
  const [order, setOrder] = useState({});
  const [activeItemId, setActiveItemId] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [saving, setSaving] = useState(false);

  // ======================================================
  // BRANCH
  // ======================================================

  const handleBranchSelect = (branchId) => {
    setSelectedBranch(branchId);
    localStorage.setItem("currentBranch", branchId);
  };

  const handleChangeBranch = () => {
    setSelectedBranch(null);
    localStorage.removeItem("currentBranch");
    setActiveItemId(null);
  };

  const selectedBranchLabel =
    BRANCHES.find((branch) => branch.id === selectedBranch)?.label ||
    selectedBranch;

  // ======================================================
  // FIRESTORE HELPERS
  // ======================================================

  const isPlainObject = (value) =>
    Object.prototype.toString.call(value) === "[object Object]";

  const sanitizeForFirestore = (value) => {
    if (value === undefined) return undefined;

    if (value === null) return null;

    if (typeof value === "number") {
      if (!Number.isFinite(value)) return null;
      return value;
    }

    if (typeof value === "string" || typeof value === "boolean") {
      return value;
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => sanitizeForFirestore(item))
        .filter((item) => item !== undefined);
    }

    if (isPlainObject(value)) {
      const output = {};

      for (const [key, item] of Object.entries(value)) {
        const sanitizedValue = sanitizeForFirestore(item);

        if (sanitizedValue !== undefined) {
          output[key] = sanitizedValue;
        }
      }

      return output;
    }

    return null;
  };

  const toLocalYMD = (date) => {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ======================================================
  // PRICE HELPERS
  // ======================================================

  const toMoney = (number) => Math.round(number * 100) / 100;

  const getUnitBase = (item, sizeOption) => {
    if (sizeOption) {
      if (sizeOption.price != null) {
        return sizeOption.price;
      }

      if (sizeOption.totalPrice != null) {
        return toMoney(sizeOption.totalPrice / 1.13);
      }

      return 0;
    }

    if (item.price != null) {
      return item.price;
    }

    if (item.totalPrice != null) {
      return toMoney(item.totalPrice / 1.13);
    }

    return 0;
  };

  const getUnitTotal = (item, sizeOption) => {
    if (sizeOption) {
      if (sizeOption.totalPrice != null) {
        return sizeOption.totalPrice;
      }

      if (sizeOption.price != null) {
        return toMoney(sizeOption.price * 1.13);
      }

      return 0;
    }

    if (item.totalPrice != null) {
      return item.totalPrice;
    }

    if (item.price != null) {
      return toMoney(item.price * 1.13);
    }

    return 0;
  };

  // ======================================================
  // ORDER FUNCTIONS
  // ======================================================

  const addItem = (item, sizeOption = null) => {
    const itemKey = sizeOption
      ? `${item.name} (${sizeOption.label})`
      : item.name;

    const unitBase = getUnitBase(item, sizeOption);
    const unitTotal = getUnitTotal(item, sizeOption);

    setOrder((previousOrder) => {
      const existingItem = previousOrder[itemKey] || {
        name: itemKey,
        priceExTax: unitBase,
        priceWithTax: unitTotal,
        quantity: 0,
        hideable: !!item.hideable,
        baseName: item.name,
      };

      return {
        ...previousOrder,

        [itemKey]: {
          ...existingItem,

          quantity: existingItem.quantity + 1,

          priceExTax: unitBase,

          priceWithTax: unitTotal,
        },
      };
    });
  };

  const removeItem = (itemKey) => {
    setOrder((previousOrder) => {
      const newOrder = {
        ...previousOrder,
      };

      if (newOrder[itemKey].quantity > 1) {
        newOrder[itemKey].quantity -= 1;
      } else {
        delete newOrder[itemKey];
      }

      return newOrder;
    });
  };

  const clearOrder = () => {
    setOrder({});
  };

  const orderedItems = Object.values(order);

  // ======================================================
  // TOTALS
  // ======================================================

  const subtotal = orderedItems.reduce(
    (sum, item) => sum + item.priceExTax * item.quantity,
    0,
  );

  const tax = subtotal * 0.13;

  const total = subtotal + tax;

  // ======================================================
  // CHECKOUT
  // ======================================================

  const handleCheckout = async () => {
    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const now = new Date();

      const itemsForSave = orderedItems.map((item) =>
        sanitizeForFirestore({
          name: item.name,

          quantity: Number(item.quantity) || 0,

          priceExTax: Math.round((item.priceExTax ?? 0) * 100) / 100,

          priceWithTax: Math.round((item.priceWithTax ?? 0) * 100) / 100,

          hideable: !!item.hideable,

          baseName: item.baseName || item.name.split(" (")[0],
        }),
      );

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

      const orderForLocal = {
        ...orderForFirestore,

        createdAt: now.toISOString(),
      };

      // Save to Firebase
      try {
        await addDoc(collection(db, "orders"), orderForFirestore);
      } catch (error) {
        console.error("Firestore write failed:", error);
      }

      // Save locally
      try {
        const previousOrders = JSON.parse(
          localStorage.getItem("allCafeOrders") || "[]",
        );

        previousOrders.push(orderForLocal);

        localStorage.setItem("allCafeOrders", JSON.stringify(previousOrders));
      } catch (error) {
        console.error("LocalStorage write failed:", error);
      }

      alert("Order saved!");

      clearOrder();
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // ITEMS AVAILABLE FOR SELECTED BRANCH
  // ======================================================

  const visibleItems = items.filter((item) =>
    item.branches?.includes(selectedBranch),
  );

  // ======================================================
  // BRANCH SELECTION PAGE
  // ======================================================

  if (!selectedBranch) {
    return (
      <div className="container">
        <div className="cafe-header">
          <h1 className="title">Café Vita</h1>

          <p className="cafe-tagline">Fresh food, drinks & snacks</p>
        </div>

        <h2 className="subtitle">Select Branch</h2>

        <div className="branch-buttons">
          {BRANCHES.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => handleBranchSelect(branch.id)}
              className="branch-button-large"
            >
              {branch.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN PAGE
  // ======================================================

  return (
    <div className="container">
      {/* HEADER */}

      <div className="cafe-header">
        <h1 className="title">Café Vita</h1>

        <p className="cafe-tagline">Fresh food, drinks & snacks</p>
      </div>

      {/* BRANCH */}

      <div className="branch-indicator">
        <div>
          <span className="branch-indicator-label">Current Branch</span>

          <strong>{selectedBranchLabel}</strong>
        </div>

        <button
          type="button"
          onClick={handleChangeBranch}
          className="change-branch-button"
        >
          Change Branch
        </button>
      </div>

      {/* MENU */}

      <div className="cafe-menu">
        {MENU_CATEGORIES.map((category) => {
          const categoryItems = visibleItems.filter(
            (item) => item.category === category.id,
          );

          if (categoryItems.length === 0) {
            return null;
          }

          return (
            <section key={category.id} className="menu-section">
              {/* CATEGORY HEADER */}

              <div className="menu-section-header">
                <div className="menu-section-title">
                  <span className="menu-category-icon">{category.icon}</span>

                  <h2>{category.label}</h2>
                </div>

                <span className="menu-item-count">
                  {categoryItems.length}{" "}
                  {categoryItems.length === 1 ? "item" : "items"}
                </span>
              </div>

              {/* CATEGORY ITEMS */}

              <div className="menu-grid">
                {categoryItems.map((item) => (
                  <div key={item.id} className="menu-card">
                    {item.sizes ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveItemId(
                              activeItemId === item.id ? null : item.id,
                            )
                          }
                          className="menu-button"
                        >
                          <div className="menu-image-wrapper">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="menu-image"
                            />
                          </div>

                          <div className="menu-card-content">
                            <span className="menu-item-name">{item.name}</span>

                            <span className="menu-item-price">
                              From $
                              {Math.min(
                                ...item.sizes.map((size) => size.totalPrice),
                              ).toFixed(2)}
                            </span>
                          </div>
                        </button>

                        {/* SIZE OPTIONS */}

                        {activeItemId === item.id && (
                          <div className="size-buttons">
                            {item.sizes.map((size) => (
                              <button
                                key={size.label}
                                type="button"
                                onClick={() => {
                                  addItem(item, size);

                                  setActiveItemId(null);
                                }}
                                className="size-button"
                              >
                                <span>{size.label}</span>

                                <strong>${size.totalPrice.toFixed(2)}</strong>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addItem(item)}
                        className="menu-button"
                      >
                        <div className="menu-image-wrapper">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="menu-image"
                          />
                        </div>

                        <div className="menu-card-content">
                          <span className="menu-item-name">{item.name}</span>

                          <span className="menu-item-price">
                            ${item.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ORDER SUMMARY */}

      <section className="order-summary">
        <div className="order-summary-header">
          <div>
            <h2 className="subtitle">Order Summary</h2>

            <p className="order-summary-count">
              {orderedItems.reduce((sum, item) => sum + item.quantity, 0)} items
              selected
            </p>
          </div>
        </div>

        {orderedItems.length === 0 ? (
          <div className="empty-order">
            <p className="empty">No items selected.</p>

            <span>Select an item from the menu above.</span>
          </div>
        ) : (
          <ul className="order-list">
            {Object.entries(order).map(([key, item]) => (
              <li key={key} className="order-item">
                <div className="order-item-info">
                  <strong>{item.name}</strong>

                  <span>
                    ${item.priceExTax.toFixed(2)}
                    {" × "}
                    {item.quantity}
                  </span>
                </div>

                <div className="order-item-actions">
                  <strong className="order-line-total">
                    ${(item.priceExTax * item.quantity).toFixed(2)}
                  </strong>

                  <button
                    type="button"
                    onClick={() => removeItem(key)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* TOTALS */}

        <div className="totals">
          <div className="totals-row">
            <span>Subtotal</span>

            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="totals-row">
            <span>Tax (13%)</span>

            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="totals-row total">
            <span>Total</span>

            <strong>${total.toFixed(2)}</strong>
          </div>
        </div>

        {/* ACTIONS */}

        {orderedItems.length > 0 && (
          <div className="action-buttons">
            <button type="button" onClick={clearOrder} className="clear-button">
              Clear Order
            </button>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={saving}
              className="checkout-button"
            >
              {saving ? "Saving..." : "Checkout"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
