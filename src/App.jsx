import { Routes, Route, Link } from 'react-router-dom';
import './index.css';
import CafeBilling from './CafeBilling';
import SummaryPage from './CheckoutPage';
import SalesReport from './SalesReport';

export default function App() {
  return (
    <div>
      <nav className='nav-bar'>
        <Link to="/" className="nav-link">Order</Link>
        <Link to="/summary" className="nav-link" >Summary</Link>
        <Link to="/SalesReport" className="nav-link">Sales Report</Link>
      </nav>

      <Routes>
        <Route path="/" element={<CafeBilling />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/SalesReport" element={<SalesReport />} />
      </Routes>
    </div>
  );
}