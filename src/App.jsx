import { Routes, Route, Link } from 'react-router-dom';
import CafeBilling from './CafeBilling';
import SummaryPage from './CheckoutPage';
import SalesReport from './SalesReport';

export default function App() {
  return (
    <div>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Order</Link>
        <Link to="/summary" style={{ marginRight: '1rem' }} >Summary</Link>
        <Link to="/SalesReport">Sales Report</Link>
      </nav>

      <Routes>
        <Route path="/" element={<CafeBilling />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/SalesReport" element={<SalesReport />} />
      </Routes>
    </div>
  );
}