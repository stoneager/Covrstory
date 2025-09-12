import React, { useEffect, useState } from 'react';
import { packagesAPI, ordersAPI } from '../services/api';

const statusOptions = [
  'Created',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const OrderTracking = () => {
  const [packages, setPackages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPackages();
    fetchOrders();
  }, []);

  const fetchPackages = async () => {
    const res = await packagesAPI.getAll();
    setPackages(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const fetchOrders = async () => {
    const res = await ordersAPI.getAll();
    // Sort orders by createdAt descending (latest first)
    setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const handleStatusChange = async (pkgId, status) => {
    await packagesAPI.updateStatus(pkgId, status);
    fetchPackages();
  };

  const handleCreatePackage = async () => {
    setCreating(true);
    await packagesAPI.create({ orderIds: selectedOrders });
    setShowCreateModal(false);
    setSelectedOrders([]);
    setCreating(false);
    fetchPackages();
  };

  return (
    <div className="order-tracking-page">
      <h1>Order Tracking</h1>
      <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
        Create Package
      </button>
      <div className="package-list">
        {packages.map(pkg => (
          <div key={pkg._id} className="package-card">
            <div><strong>Package ID:</strong> {pkg._id}</div>
            <div>
              <strong>Status:</strong>
              <select
                value={pkg.stages}
                onChange={e => handleStatusChange(pkg._id, e.target.value)}
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <strong>Orders:</strong>
              <ul>
                {pkg.orders && pkg.orders.length > 0 ? (
                  pkg.orders.map(order => (
                    <li key={order._id}>
                      <div><strong>Order ID:</strong> {order._id}</div>
                      <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</div>
                      <div><strong>Status:</strong> {order.stages}</div>
                      <div><strong>Total MRP:</strong> ₹{order.total_mrp}</div>
                      {/* Add more order details as needed */}
                    </li>
                  ))
                ) : <li>No orders in this package.</li>}
              </ul>
            </div>
          </div>
        ))}
      </div>
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Package</h2>
            <div>
              <label>Select Orders (sorted by date):</label>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '8px' }}>
                {orders.map(order => (
                  <div key={order._id} style={{ marginBottom: '6px' }}>
                    <input
                      type="checkbox"
                      id={`order-checkbox-${order._id}`}
                      value={order._id}
                      checked={selectedOrders.includes(order._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedOrders([...selectedOrders, order._id]);
                        } else {
                          setSelectedOrders(selectedOrders.filter(id => id !== order._id));
                        }
                      }}
                    />
                    <label htmlFor={`order-checkbox-${order._id}`} style={{ marginLeft: '6px' }}>
                      {order._id} - {new Date(order.createdAt).toLocaleString()} - ₹{order.total_mrp} - {order.stages}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn btn-success" onClick={handleCreatePackage} disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
