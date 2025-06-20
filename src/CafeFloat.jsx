import React, { useState } from 'react';
import './CafeFloat.css';
import EndOfSales from './EndOfDaySales';

const defaultAmounts = [50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05];

const CafeFloat = () => {
  const [rows, setRows] = useState(defaultAmounts.map(amount => ({ quantity: 0, amount })));

  const handleChange = (value, index) => {
    const updated = [...rows];
    updated[index].quantity = parseFloat(value) || 0;
    setRows(updated);
  };

  const formatAmount = (amount) => amount.toFixed(2);
  const getTotal = (quantity, amount) => (quantity * amount).toFixed(2);
  const grandTotal = rows.reduce((acc, row) => acc + row.quantity * row.amount, 0).toFixed(2);

  return (
    <div className="float-wrapper">
      <h2 className="float-title">Café Cash Box Float</h2>
      {/* <div className="float-subtitle">$50.00</div> */}
      {/* <EndOfSales grandTotal={grandTotal}/> */}

      <table className="float-table">
        <thead>
          <tr>
            <th>Quantity</th>
            <th>Amount</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td><input value={row.quantity} type="number" onChange={(e) => handleChange(e.target.value, idx)} className="float-cell-input" /></td>
              <td><input value={formatAmount(row.amount)} readOnly className="float-cell-input" /></td>
              <td><input value={getTotal(row.quantity, row.amount)} readOnly className="float-total-cell" /></td>
            </tr>
          ))}
          <tr>
            <td colSpan={2} className="float-total-label">Total</td>
            <td><input value={grandTotal} readOnly className="float-total-cell" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CafeFloat;
