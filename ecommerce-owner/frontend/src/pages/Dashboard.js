import React, { useState, useEffect } from 'react';
import { 
	Chart as ChartJS, 
	CategoryScale, 
	LinearScale, 
	BarElement, 
	Title, 
	Tooltip, 
	Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ordersAPI } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
	const [stats, setStats] = useState([]);
	const [orders, setOrders] = useState([]);
	const [filter, setFilter] = useState('day');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchData();
	}, [filter]);

	const fetchData = async () => {
		try {
			setLoading(true);
			const response = await ordersAPI.getStats(filter);
			setStats(response.data.stats);
			setOrders(response.data.orders);
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
		} finally {
			setLoading(false);
		}
	};

	const chartData = {
		labels: stats.map(stat => stat._id || 'Unknown'),
		datasets: [
			{
				label: 'Order Count',
				data: stats.map(stat => stat.count),
				backgroundColor: 'rgba(54, 162, 235, 0.6)',
			},
			{
				label: 'Total Revenue (₹)',
				data: stats.map(stat => stat.total),
				backgroundColor: 'rgba(255, 99, 132, 0.6)',
			}
		]
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'top',
			},
			title: {
				display: true,
				text: `Orders Statistics - ${filter.charAt(0).toUpperCase() + filter.slice(1)}`,
			},
		},
	};

	const getTotalStats = () => {
		const totalOrders = stats.reduce((sum, stat) => sum + stat.count, 0);
		const totalRevenue = stats.reduce((sum, stat) => sum + stat.total, 0);
		const pendingOrders = stats.find(stat => stat._id === 'pending')?.count || 0;
		const deliveredOrders = stats.find(stat => stat._id === 'delivered')?.count || 0;

		return { totalOrders, totalRevenue, pendingOrders, deliveredOrders };
	};

	const { totalOrders, totalRevenue, pendingOrders, deliveredOrders } = getTotalStats();

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<div className="card-header">
				<h1 className="card-title">Dashboard</h1>
				<div className="filters">
					<label className="filter-item">
						<span>Filter:</span>
						<select 
							className="form-control"
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
						>
							<option value="day">Today</option>
							<option value="week">This Week</option>
							<option value="month">This Month</option>
						</select>
					</label>
				</div>
			</div>

			<div className="stats-grid">
				<div className="stat-card">
					<div className="stat-value">{totalOrders}</div>
					<div className="stat-label">Total Orders</div>
				</div>
				<div className="stat-card">
					<div className="stat-value">₹{totalRevenue.toLocaleString()}</div>
					<div className="stat-label">Total Revenue</div>
				</div>
				<div className="stat-card">
					<div className="stat-value">{pendingOrders}</div>
					<div className="stat-label">Pending Orders</div>
				</div>
				<div className="stat-card">
					<div className="stat-value">{deliveredOrders}</div>
					<div className="stat-label">Delivered Orders</div>
				</div>
			</div>

			<div className="card">
				<div className="chart-container">
					<Bar data={chartData} options={chartOptions} />
				</div>
			</div>

			<div className="card">
				<div className="card-header">
					<h3 className="card-title">Recent Orders</h3>
				</div>
				<div className="table-responsive">
					<table className="table">
						<thead>
							<tr>
								<th>Order ID</th>
								<th>Customer</th>
								<th>Total</th>
								<th>Status</th>
								<th>Date</th>
							</tr>
						</thead>
						<tbody>
							{orders.map(order => (
								<tr key={order._id}>
									<td>#{order._id.slice(-8)}</td>
									<td>{order.user?.name || 'N/A'}</td>
									<td>₹{order.total_mrp.toLocaleString()}</td>
									<td>
										<span className={`badge badge-${getStatusColor(order.stages)}`}>
											{order.stages}
										</span>
									</td>
									<td>{new Date(order.createdAt).toLocaleDateString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

const getStatusColor = (status) => {
	const colors = {
		pending: 'warning',
		confirmed: 'info',
		shipped: 'primary',
		delivered: 'success',
		cancelled: 'danger'
	};
	return colors[status] || 'secondary';
};

export default Dashboard;
