import React, { useEffect, useMemo, useState } from "react";
import { db } from "./Firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

const HIDEABLE_BASENAMES = new Set(["Water", "Pop", "Chai Tea"]);
const baseName = (name) => name.split(" (")[0];
const toMoney = (n) => Math.round(Number(n || 0) * 100) / 100;

const getItemBase = (it) => {
  if (it.priceExTax != null) return Number(it.priceExTax);
  if (it.price != null) return Number(it.price);
  if (it.priceWithTax != null) return toMoney(Number(it.priceWithTax) / 1.13);
  return 0;
};

// ✅ Use timestamp ISO string (you always have this)
const getOrderDate = (o) => {
  const d = new Date(o.timestamp);
  return isNaN(d.getTime()) ? null : d;
};

export default function SummaryPage() {
  const [orders, setOrders] = useState([]);
  const [hiddenItems, setHiddenItems] = useState(new Set());

  // OPTIONAL: branch selector (remove if you don’t want it)
  const [branch, setBranch] = useState("ALL");

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOrders(docs);
      },
      (err) => console.error("Snapshot error:", err)
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem("hiddenItems") || "[]");
    setHiddenItems(new Set(raw));
  }, []);

  const saveHidden = (set) =>
    localStorage.setItem("hiddenItems", JSON.stringify(Array.from(set)));

  const hideItem = (name) => {
    const next = new Set(hiddenItems);
    next.add(baseName(name));
    setHiddenItems(next);
    saveHidden(next);
  };

  const unhideAll = () => {
    setHiddenItems(new Set());
    localStorage.removeItem("hiddenItems");
  };

  // OPTIONAL: filter by branch
  const visibleOrders = useMemo(() => {
    if (branch === "ALL") return orders;
    return orders.filter((o) => o.branch === branch);
  }, [orders, branch]);

  // Group orders by display date
  const groupedByDate = useMemo(() => {
    const grouped = {};
    visibleOrders.forEach((o) => {
      const d = getOrderDate(o);
      if (!d) return;

      const dateStr = d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });

      (grouped[dateStr] ||= []).push(o);
    });
    return grouped;
  }, [visibleOrders]);

  const summarizeItems = (ordersForDate) => {
    const map = {};

    ordersForDate.forEach((order) => {
      (order.items || []).forEach((it) => {
        const bn = baseName(it.name);
        if (hiddenItems.has(bn)) return;

        const isHideable =
          it.hideable !== undefined
            ? !!it.hideable
            : HIDEABLE_BASENAMES.has(bn);

        if (!map[it.name]) {
          map[it.name] = {
            name: it.name,
            quantity: 0,
            subtotalEx: 0,
            hideable: isHideable,
          };
        }

        const unitBase = getItemBase(it);
        const qty = Number(it.quantity) || 0;

        map[it.name].quantity += qty;
        map[it.name].subtotalEx += unitBase * qty;
      });
    });

    return Object.values(map)
      .map((row) => ({ ...row, subtotalEx: toMoney(row.subtotalEx) }))
      .sort((a, b) => b.quantity - a.quantity);
  };

  const computeDailyTotals = (dateOrders) => {
    // Use saved totals if present
    const allHaveSaved = dateOrders.every(
      (o) => o.subtotal != null && o.tax != null && o.total != null
    );

    if (allHaveSaved) {
      const subtotal = dateOrders.reduce(
        (s, o) => s + parseFloat(o.subtotal),
        0
      );
      const tax = dateOrders.reduce((s, o) => s + parseFloat(o.tax), 0);
      const total = dateOrders.reduce((s, o) => s + parseFloat(o.total), 0);
      return {
        subtotal: toMoney(subtotal),
        tax: toMoney(tax),
        total: toMoney(total),
      };
    }

    // Otherwise recompute from items
    const subtotal = dateOrders.reduce((sum, o) => {
      const items = o.items || [];
      return (
        sum +
        items.reduce(
          (s, it) => s + getItemBase(it) * (Number(it.quantity) || 0),
          0
        )
      );
    }, 0);
    const tax = subtotal * 0.13;
    const total = subtotal + tax;
    return {
      subtotal: toMoney(subtotal),
      tax: toMoney(tax),
      total: toMoney(total),
    };
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Sales Summary by Date</h1>
      {/* <p style={{ color: "#555" }}>
        Loaded <strong>{orders.length}</strong> orders from Firestore
      </p> */}

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 600 }}>Branch:</span>

        {[
          { id: "ALL", label: "All Branches" },
          { id: "HenleyPlace", label: "Henley Place" },
          { id: "HenleyHouse", label: "Henley House" },
          { id: "BurtonManor", label: "Burton Manor" },
        ].map((b) => (
          <button
            key={b.id}
            onClick={() => setBranch(b.id)}
            style={{
              padding: ".45rem .9rem",
              borderRadius: 999,
              border: "1px solid #ccc",
              cursor: "pointer",
              background: branch === b.id ? "#0d6efd" : "#fff",
              color: branch === b.id ? "#fff" : "#333",
              fontWeight: branch === b.id ? 600 : 400,
              transition: "all .15s ease",
            }}
          >
            {b.label}
          </button>
        ))}

        {/* <button
          onClick={unhideAll}
          style={{
            marginLeft: "auto",
            padding: ".45rem .9rem",
            background: "#888",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Unhide All
        </button> */}
      </div>

      {Object.keys(groupedByDate).length === 0 ? (
        <p>No sales found.</p>
      ) : (
        Object.entries(groupedByDate).map(([date, dateOrders]) => {
          const itemSummary = summarizeItems(dateOrders);
          const { subtotal, tax, total } = computeDailyTotals(dateOrders);

          return (
            <div key={date} style={{ marginBottom: "3rem" }}>
              <h2>{date}</h2>
              <p>
                <strong>Subtotal:</strong> ${subtotal.toFixed(2)} &nbsp;|&nbsp;
                <strong>Tax (13%):</strong> ${tax.toFixed(2)} &nbsp;|&nbsp;
                <strong>Total Collected:</strong> ${total.toFixed(2)}
              </p>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "1rem",
                }}
              >
                <thead>
                  <tr>
                    <th style={thL}>Item</th>
                    <th style={thC}>Quantity</th>
                    <th style={thR}>Subtotal (pre-tax)</th>
                    <th style={thR}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {itemSummary.map((it, idx) => (
                    <tr key={idx}>
                      <td style={td}>{it.name}</td>
                      <td style={{ ...td, textAlign: "center" }}>
                        {it.quantity}
                      </td>
                      <td style={{ ...td, textAlign: "right" }}>
                        ${it.subtotalEx.toFixed(2)}
                      </td>
                      <td style={{ ...td, textAlign: "right" }}>
                        {it.hideable && (
                          <button
                            onClick={() => hideItem(it.name)}
                            style={{
                              padding: ".3rem .6rem",
                              background: "#e11",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
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
                    <td style={{ textAlign: "right", padding: "0.5rem" }}>
                      <strong>Tax (13%)</strong>
                    </td>
                    <td style={{ textAlign: "right", padding: "0.5rem" }}>
                      <strong>${tax.toFixed(2)}</strong>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td style={{ textAlign: "right", padding: "0.5rem" }}>
                      <strong>Total</strong>
                    </td>
                    <td style={{ textAlign: "right", padding: "0.5rem" }}>
                      <strong>${total.toFixed(2)}</strong>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}

const thL = {
  textAlign: "left",
  padding: "0.5rem",
  borderBottom: "2px solid #ccc",
};
const thC = {
  textAlign: "center",
  padding: "0.5rem",
  borderBottom: "2px solid #ccc",
};
const thR = {
  textAlign: "right",
  padding: "0.5rem",
  borderBottom: "2px solid #ccc",
};
const td = { padding: "0.5rem" };
