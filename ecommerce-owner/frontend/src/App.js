import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import CollectionManagement from './pages/CollectionManagement';
import DiscountManagement from './pages/DiscountManagement';
import CouponManagement from './pages/CouponManagement';
import OrderTracking from './pages/OrderTracking';
import './App.css';

function App() {
	return (
		<Router>
			<div className="App">
				<Header />
				<div className="app-body">
					<Sidebar />
					<main className="main-content">
						<Routes>
							<Route path="/" element={<Dashboard />} />
							<Route path="/products" element={<ProductManagement />} />
							<Route path="/collections" element={<CollectionManagement />} />
							<Route path="/discounts" element={<DiscountManagement />} />
							<Route path="/coupons" element={<CouponManagement />} />
                                <Route path="/order-tracking" element={<OrderTracking />} />
						</Routes>
					</main>
				</div>
			</div>
		</Router>
	);
}

export default App;
