import React, { useEffect, useState } from "react";

// list of items that should have Hide buttons (base names, without sizes)
const HIDEABLE_BASENAMES = new Set(["Water", "Pop", "Chai Tea"]);

const baseName = (name) => name.split(" (")[0];
const toMoney = (n) => Math.round(Number(n || 0) * 100) / 100;

// Get a unit pre-tax price for a line item, with fallbacks for legacy saves
const getItemBase = (it) => {
  if (it.priceExTax != null) return Number(it.priceExTax); // new schema
  if (it.price != null) return Number(it.price); // legacy pre-tax
  if (it.priceWithTax != null) return toMoney(Number(it.priceWithTax) / 1.13);
  return 0;
};

// Local YYYY-MM-DD (no timezone shift)
const toLocalYMD = (d) => {
  const yr = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${yr}-${m}-${day}`;
};

export default function SummaryPage() {
  const [orders, setOrders] = useState([]);
  const [hiddenItems, setHiddenItems] = useState(new Set());
  const [branchFilter, setBranchFilter] = useState(null);

  // Date filter state
  const [fromDate, setFromDate] = useState(""); // YYYY-MM-DD
  const [toDate, setToDate] = useState(""); // YYYY-MM-DD

  useEffect(() => {
    const saved = localStorage.getItem("currentBranch");
    if (saved) {
      setBranchFilter(saved);
    }
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("allCafeOrders")) || [];
    setOrders(stored);
  }, []);

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem("hiddenItems")) || [];
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

  // ---- NEW: Filter orders by date range (inclusive) before grouping ----
  const filteredOrders = orders.filter((o) => {
    const d = new Date(o.timestamp);
    if (isNaN(d.getTime())) return false;

    const ymd = toLocalYMD(d);
    if (fromDate && ymd < fromDate) return false;
    if (toDate && ymd > toDate) return false;

    // only show orders for this branch if we have one
    if (branchFilter && o.branch !== branchFilter) return false;

    return true;
  });
  // Group filtered orders by display date
  const groupedByDate = {};
  filteredOrders.forEach((order) => {
    const parsed = new Date(order.timestamp);
    const dateStr = !isNaN(parsed.getTime())
      ? parsed.toLocaleDateString(undefined, {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        })
      : "Invalid Date";
    (groupedByDate[dateStr] ||= []).push(order);
  });

  // Summarize items for one day, respecting hidden set (pre-tax subtotals)
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
        map[it.name].quantity += Number(it.quantity) || 0;
        map[it.name].subtotalEx += unitBase * (Number(it.quantity) || 0);
      });
    });

    return Object.values(map)
      .map((row) => ({ ...row, subtotalEx: toMoney(row.subtotalEx) }))
      .sort((a, b) => b.quantity - a.quantity);
  };

  // Prefer saved daily totals when present; otherwise recompute
  const computeDailyTotals = (dateOrders) => {
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

  // ---- NEW: Quick preset handlers ----
  const setToday = () => {
    const today = toLocalYMD(new Date());
    setFromDate(today);
    setToDate(today);
  };
  const setLast7 = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6); // inclusive last 7 days
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

  if (!branchFilter) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Sales Summary by Date</h1>
      <p>No branch selected. Please go to the Café page and choose a branch.</p>
    </div>
  );
}

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Sales Summary by Date</h1>

      {/* Date filter UI */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        <label>
          From:{" "}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ padding: ".3rem .4rem" }}
          />
        </label>
        <label>
          To:{" "}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ padding: ".3rem .4rem" }}
          />
        </label>

        <button onClick={setToday} style={btnStyle}>
          Today
        </button>
        <button onClick={setLast7} style={btnStyle}>
          Last 7 Days
        </button>
        <button onClick={setThisMonth} style={btnStyle}>
          This Month
        </button>
        <button onClick={clearDates} style={btnStyle}>
          Clear
        </button>

        <button
          onClick={unhideAll}
          style={{ ...btnStyle, marginLeft: "auto", background: "#888" }}
        >
          Unhide All
        </button>
      </div>

      {Object.entries(groupedByDate).map(([date, dateOrders]) => {
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
      })}
    </div>
  );
}

// Small inline style helpers
const btnStyle = {
  padding: ".4rem .8rem",
  background: "#0d6efd",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

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
