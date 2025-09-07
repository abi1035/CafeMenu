import { Routes, Route, Link } from 'react-router-dom';
import './index.css';
import CafeBilling from './CafeBilling';
import SummaryPage from './SummaryPage';
import SalesReport from './SalesReport';
import CafeFloatTable from './CafeFloat';
import EndOfSales from './EndOfDaySales';
import AdminSummary from './AdminSummary';
import RequireAuth from './components/RequireAuth';

export default function App() {
  return (
    <div>
      <nav className='nav-bar'>
        <Link to="/" className="nav-link">Order</Link>
        <Link to="/summary" className="nav-link" >Summary</Link>
        <Link to="/SalesReport" className="nav-link">Sales Report</Link>
        <Link to="/cafeFloat" className="nav-link">Cafe Float</Link>
        <Link to="/admin-summary" className="nav-link">Admin Report</Link>
        {/* <Link to="/endOfDaySales" className="nav-link">End of Day Sales</Link> */}
      </nav>

      <Routes>
        <Route path="/" element={<CafeBilling />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/SalesReport" element={<SalesReport />} />
        <Route path="/cafeFloat" element={<CafeFloatTable />} />
        <Route
          path="/admin-summary"
          element={
            <RequireAuth>
              <AdminSummary />
            </RequireAuth>
          }
        />

        {/* <Route path="/endOfDaySales" element={<EndOfSales />} /> */}
      </Routes>
    </div>
  );
}