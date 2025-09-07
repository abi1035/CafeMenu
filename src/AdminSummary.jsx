// src/AdminSummary.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";
import { db } from "./Firebase"; 
import SignOutButton from "./components/SignOutButton";

const toMoney = (n) => Math.round(Number(n || 0) * 100) / 100;
const TAX_RATE = 0.13;

const toLocalYMD = (d) => {
  const yr = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${yr}-${m}-${day}`;
};
const unique = (arr) => Array.from(new Set(arr));

const unitBaseFromItem = (it) => {
  if (it.priceExTax != null) return Number(it.priceExTax);
  if (it.price != null) return Number(it.price);
  if (it.priceWithTax != null) return toMoney(Number(it.priceWithTax) / (1 + TAX_RATE));
  return 0;
};

export default function AdminSummary() {
  const [orders, setOrders] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [branchFilter, setBranchFilter] = useState(
    () => localStorage.getItem("branchFilter") || "all"
  );

  useEffect(() => {
    localStorage.setItem("branchFilter", branchFilter);
  }, [branchFilter]);

  // live Firestore query
  useEffect(() => {
    let q = query(collection(db, "orders"), orderBy("ymd", "asc"));
    if (fromDate) q = query(q, where("ymd", ">=", fromDate));
    if (toDate) q = query(q, where("ymd", "<=", toDate));
    if (branchFilter !== "all") q = query(q, where("branch", "==", branchFilter));

    const unsub = onSnapshot(
      q,
      (snap) => setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("Firestore onSnapshot error:", err)
    );
    return unsub;
  }, [fromDate, toDate, branchFilter]);

  // group by pretty date label
  const groupedByDate = useMemo(() => {
    const m = {};
    for (const o of orders) {
      const parsed = new Date(o.timestamp);
      const key = !isNaN(parsed.getTime())
        ? parsed.toLocaleDateString(undefined, {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          })
        : "Invalid Date";
      (m[key] ||= []).push(o);
    }
    return m;
  }, [orders]);

  // build item rows for a set of orders
  const summarizeItems = (ordersForGroup) => {
    const map = {};
    for (const order of ordersForGroup) {
      for (const it of order.items || []) {
        if (!map[it.name]) map[it.name] = { name: it.name, quantity: 0, subtotalEx: 0 };
        const qty = Number(it.quantity) || 0;
        map[it.name].quantity += qty;
        map[it.name].subtotalEx += unitBaseFromItem(it) * qty;
      }
    }
    return Object.values(map)
      .map((r) => ({ ...r, subtotalEx: toMoney(r.subtotalEx) }))
      .sort((a, b) => b.quantity - a.quantity);
  };

  // totals for a set of orders
  const computeTotals = (ordersForGroup) => {
    const saved = ordersForGroup.every((o) => o.subtotal && o.tax && o.total);
    if (saved) {
      const subtotal = ordersForGroup.reduce((s, o) => s + Number(o.subtotal), 0);
      const tax = ordersForGroup.reduce((s, o) => s + Number(o.tax), 0);
      const total = ordersForGroup.reduce((s, o) => s + Number(o.total), 0);
      return { subtotal: toMoney(subtotal), tax: toMoney(tax), total: toMoney(total) };
    }
    const subtotal = ordersForGroup.reduce(
      (sum, o) =>
        sum +
        (o.items || []).reduce(
          (s, it) => s + unitBaseFromItem(it) * (Number(it.quantity) || 0),
          0
        ),
      0
    );
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    return { subtotal: toMoney(subtotal), tax: toMoney(tax), total: toMoney(total) };
  };

  // ❌ Delete one item (by name) for a given ymd + branch across all orders in that group
  const deleteItemFromDateBranch = async (ymd, branch, itemName) => {
    if (!ymd || !branch) return;
    if (!window.confirm(`Remove "${itemName}" from all ${branch} orders on ${ymd}?`)) return;

    // query all orders for that date+branch
    const q = query(
      collection(db, "orders"),
      where("ymd", "==", ymd),
      where("branch", "==", branch)
    );
    const snap = await getDocs(q);
    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      const o = d.data();
      const remaining = (o.items || []).filter((it) => it.name !== itemName);

      if (remaining.length === (o.items || []).length) {
        // this order didn't contain the item; skip
        return;
      }

      // recompute totals from remaining items
      const subtotalRaw = remaining.reduce(
        (s, it) => s + unitBaseFromItem(it) * (Number(it.quantity) || 0),
        0
      );
      const subtotal = toMoney(subtotalRaw);
      const tax = toMoney(subtotal * TAX_RATE);
      const total = toMoney(subtotal + tax);

      if (remaining.length === 0) {
        // delete empty order
        batch.delete(doc(db, "orders", d.id));
      } else {
        batch.update(doc(db, "orders", d.id), {
          items: remaining,
          subtotal: subtotal.toFixed(2),
          tax: tax.toFixed(2),
          total: total.toFixed(2),
        });
      }
    });

    await batch.commit();
    // onSnapshot will refresh UI
  };

  const setToday = () => {
    const t = toLocalYMD(new Date());
    setFromDate(t);
    setToDate(t);
  };
  const setLast7 = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    setFromDate(toLocalYMD(start));
    setToDate(toLocalYMD(end));
  };
  const setThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setFromDate(toLocalYMD(start));
    setToDate(toLocalYMD(end));
  };
  const clearDates = () => {
    setFromDate("");
    setToDate("");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
       <SignOutButton />

      <h1>Admin Sales Summary</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
        <label>From:{" "}
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label>To:{" "}
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </label>

        <label>Branch:{" "}
          <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="HenleyPlace">Henley Place</option>
            <option value="HenleyHouse">Henley House</option>
            <option value="BurtonManor">Burton Manor</option>
          </select>
        </label>

        <button onClick={setToday} style={btn}>Today</button>
        <button onClick={setLast7} style={btn}>Last 7 Days</button>
        <button onClick={setThisMonth} style={btn}>This Month</button>
        <button onClick={clearDates} style={btn}>Clear</button>
      </div>
      

      {orders.length === 0 && (
        <p style={{ opacity: 0.75 }}>No orders found for the selected range.</p>
      )}

      {/* Date blocks */}
      {Object.entries(groupedByDate).map(([dateLabel, dateOrders]) => {
        if (branchFilter !== "all") {
          // single-branch view for this date
          const rows = summarizeItems(dateOrders);
          const { subtotal, tax, total } = computeTotals(dateOrders);
          // ymd for this date group (take from first)
          const ymd = dateOrders[0]?.ymd;

          return (
            <div key={dateLabel} style={dateCard}>
              <h2>{dateLabel}</h2>
              <p>
                <strong>Subtotal:</strong> ${subtotal.toFixed(2)} &nbsp;|&nbsp;
                <strong>Tax ({Math.round(TAX_RATE * 100)}%):</strong> ${tax.toFixed(2)} &nbsp;|&nbsp;
                <strong>Total:</strong> ${total.toFixed(2)}
              </p>

              <ItemsTable
                rows={rows}
                showActions
                onDeleteItem={(itemName) =>
                  deleteItemFromDateBranch(ymd, branchFilter, itemName)
                }
              />
            </div>
          );
        }

        // Branch = All → split by branch
        const branches = unique(dateOrders.map((o) => o.branch).filter(Boolean)).sort();
        const allTotals = computeTotals(dateOrders);

        return (
          <div key={dateLabel} style={dateCard}>
            <h2>{dateLabel}</h2>
            <p>
              <strong>All Branches — Subtotal:</strong> ${allTotals.subtotal.toFixed(2)} &nbsp;|&nbsp;
              <strong>Tax ({Math.round(TAX_RATE * 100)}%):</strong> ${allTotals.tax.toFixed(2)} &nbsp;|&nbsp;
              <strong>Total:</strong> ${allTotals.total.toFixed(2)}
            </p>

            {branches.map((br) => {
              const branchOrders = dateOrders.filter((o) => o.branch === br);
              const rows = summarizeItems(branchOrders);
              const { subtotal, tax, total } = computeTotals(branchOrders);
              const ymd = branchOrders[0]?.ymd;

              return (
                <div key={br} style={{ marginBottom: "1.75rem", background: "#fff", border: "1px solid #eee", borderRadius: 8 }}>
                  <div style={branchHeader}>
                    <strong>{br}</strong>
                    <span>
                      <strong>Subtotal:</strong> ${subtotal.toFixed(2)} &nbsp;|&nbsp;
                      <strong>Tax:</strong> ${tax.toFixed(2)} &nbsp;|&nbsp;
                      <strong>Total:</strong> ${total.toFixed(2)}
                    </span>
                  </div>

                  <ItemsTable
                    rows={rows}
                    showActions
                    onDeleteItem={(itemName) =>
                      deleteItemFromDateBranch(ymd, br, itemName)
                    }
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Reusable table with optional Actions column
function ItemsTable({ rows, showActions = false, onDeleteItem }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
      <thead>
        <tr>
          <th style={thL}>Item</th>
          <th style={thC}>Qty</th>
          <th style={thR}>Subtotal (pre-tax)</th>
          {showActions && <th style={thR}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td style={td}>{r.name}</td>
            <td style={{ ...td, textAlign: "center" }}>{r.quantity}</td>
            <td style={{ ...td, textAlign: "right" }}>${r.subtotalEx.toFixed(2)}</td>
            {showActions && (
              <td style={{ ...td, textAlign: "right" }}>
                <button
                  onClick={() => onDeleteItem?.(r.name)}
                  style={btnDanger}
                >
                  Delete
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// styles
const btn = { padding: ".4rem .8rem", background: "#0d6efd", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
const btnDanger = { padding: ".25rem .6rem", background: "#e11", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
const thL = { textAlign: "left", padding: "0.5rem", borderBottom: "2px solid #ccc" };
const thC = { textAlign: "center", padding: "0.5rem", borderBottom: "2px solid #ccc" };
const thR = { textAlign: "right", padding: "0.5rem", borderBottom: "2px solid #ccc" };
const td  = { padding: "0.5rem" };
const dateCard = { marginBottom: "3rem", background: "#fffaf3", padding: "1rem", borderRadius: 8 };
const branchHeader = { padding: "0.75rem 1rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" };
