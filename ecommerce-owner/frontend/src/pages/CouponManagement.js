import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { couponsAPI, usersAPI } from '../services/api';

const CouponManagement = () => {
	const [coupons, setCoupons] = useState([]);
	const [users, setUsers] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [selectedCoupon, setSelectedCoupon] = useState(null);
	const [formData, setFormData] = useState({
		couponCode: '',
		userEmails: [],
		applyToAll: true,
		priceCondition: { low: '', up: '' },
		red_price: '',
		red_percent: '',
		reductionType: 'percent'
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchCoupons();
		fetchUsers();
	}, []);

	const fetchCoupons = async () => {
		try {
			const response = await couponsAPI.getAll();
			setCoupons(response.data);
		} catch (error) {
			console.error('Error fetching coupons:', error);
		}
	};

	const fetchUsers = async () => {
		try {
			const response = await usersAPI.getAll();
			setUsers(response.data);
		} catch (error) {
			console.error('Error fetching users:', error);
		}
	};

	const handleAddCoupon = () => {
		setSelectedCoupon(null);
		setFormData({
			couponCode: '',
			userEmails: [],
			applyToAll: true,
			priceCondition: { low: '', up: '' },
			red_price: '',
			red_percent: '',
			reductionType: 'percent'
		});
		setShowModal(true);
	};

	const handleEditCoupon = (coupon) => {
		setSelectedCoupon(coupon);
		setFormData({
			couponCode: coupon.couponCode,
			userEmails: coupon.applicable.map(u => u.email),
			applyToAll: coupon.applicable.length === 0,
			priceCondition: {
				low: coupon.price_condition?.low || '',
				up: coupon.price_condition?.up || ''
			},
			red_price: coupon.red_price || '',
			red_percent: coupon.red_percent || '',
			reductionType: coupon.red_price ? 'price' : 'percent'
		});
		setShowModal(true);
	};

	const handleDeleteCoupon = async (couponId) => {
		if (window.confirm('Are you sure you want to delete this coupon?')) {
			try {
				await couponsAPI.delete(couponId);
				fetchCoupons();
			} catch (error) {
				console.error('Error deleting coupon:', error);
			}
		}
	};

	const handleUserToggle = (userEmail) => {
		if (formData.applyToAll) return;

		setFormData(prev => {
			const isSelected = prev.userEmails.includes(userEmail);
			return {
				...prev,
				userEmails: isSelected
					? prev.userEmails.filter(email => email !== userEmail)
					: [...prev.userEmails, userEmail]
			};
		});
	};

	const handleSelectAll = () => {
		if (formData.applyToAll) {
			setFormData(prev => ({ ...prev, userEmails: users.map(u => u.email) }));
		} else {
			setFormData(prev => ({ ...prev, userEmails: [] }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const submitData = {
				couponCode: formData.couponCode.toUpperCase(),
				userEmails: formData.applyToAll ? [] : formData.userEmails,
				priceCondition: {
					low: formData.priceCondition.low ? parseFloat(formData.priceCondition.low) : null,
					up: formData.priceCondition.up ? parseFloat(formData.priceCondition.up) : null
				},
				red_price: formData.reductionType === 'price' && formData.red_price ? parseFloat(formData.red_price) : null,
				red_percent: formData.reductionType === 'percent' && formData.red_percent ? parseFloat(formData.red_percent) : null
			};

			if (selectedCoupon) {
				await couponsAPI.update(selectedCoupon._id, submitData);
			} else {
				await couponsAPI.create(submitData);
			}
      
			fetchCoupons();
			setShowModal(false);
		} catch (error) {
			console.error('Error saving coupon:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div className="card-header">
				<h1 className="card-title">Coupon Management</h1>
				<button className="btn btn-primary" onClick={handleAddCoupon}>
					<FontAwesomeIcon icon={faPlus} />
					Add Coupon
				</button>
			</div>

			<div className="card">
				<div className="table-responsive">
					<table className="table">
						<thead>
							<tr>
								<th>Coupon Code</th>
								<th>Applicable To</th>
								<th>Price Range</th>
								<th>Reduction</th>
								<th>Used/Total</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{coupons.map(coupon => (
								<tr key={coupon._id}>
									<td><strong>{coupon.couponCode}</strong></td>
									<td>
										{coupon.applicable.length === 0 ? 'All Users' : `${coupon.applicable.length} Users`}
									</td>
									<td>
										{coupon.price_condition?.low || coupon.price_condition?.up ? 
											`₹${coupon.price_condition.low || 0} - ₹${coupon.price_condition.up || '∞'}` : 
											'Any Amount'
										}
									</td>
									<td>
										{coupon.red_price ? `₹${coupon.red_price}` : `${coupon.red_percent}%`}
									</td>
									<td>{coupon.used_ids.length}/{coupon.applicable.length || 'All'}</td>
									<td>
										<span className={`badge badge-${coupon.isActive ? 'success' : 'danger'}`}>
											{coupon.isActive ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td>
										<button 
											className="btn btn-primary"
											onClick={() => handleEditCoupon(coupon)}
											style={{ marginRight: '10px' }}
										>
											<FontAwesomeIcon icon={faEdit} />
										</button>
										<button 
											className="btn btn-danger"
											onClick={() => handleDeleteCoupon(coupon._id)}
										>
											<FontAwesomeIcon icon={faTrash} />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{coupons.length === 0 && (
					<div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
						No coupons available. Create your first coupon!
					</div>
				)}
			</div>

			{showModal && (
				<div className="modal-overlay">
					<div className="modal">
						<div className="modal-header">
							<h2>{selectedCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h2>
							<button className="btn btn-secondary" onClick={() => setShowModal(false)}>
								<FontAwesomeIcon icon={faTrash} />
							</button>
						</div>
            
						<form onSubmit={handleSubmit}>
							<div className="modal-body">
								<div className="form-group">
									<label className="form-label">Coupon Code</label>
									<input
										type="text"
										className="form-control"
										value={formData.couponCode}
										onChange={(e) => setFormData(prev => ({ 
											...prev, 
											couponCode: e.target.value.toUpperCase() 
										}))}
										placeholder="e.g., SAVE20, WELCOME10"
										required
									/>
								</div>

								<div className="form-group">
									<label className="form-label">Price Conditions</label>
									<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
										<div>
											<label className="form-label">Minimum Amount (₹)</label>
											<input
												type="number"
												className="form-control"
												value={formData.priceCondition.low}
												onChange={(e) => setFormData(prev => ({ 
													...prev, 
													priceCondition: { ...prev.priceCondition, low: e.target.value }
												}))}
												placeholder="No minimum"
												min="0"
											/>
										</div>
										<div>
											<label className="form-label">Maximum Amount (₹)</label>
											<input
												type="number"
												className="form-control"
												value={formData.priceCondition.up}
												onChange={(e) => setFormData(prev => ({ 
													...prev, 
													priceCondition: { ...prev.priceCondition, up: e.target.value }
												}))}
												placeholder="No maximum"
												min="0"
											/>
										</div>
									</div>
								</div>

								<div className="form-group">
									<label className="form-label">Reduction Type</label>
									<div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
										<label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
											<input
												type="radio"
												name="reductionType"
												value="percent"
												checked={formData.reductionType === 'percent'}
												onChange={(e) => setFormData(prev => ({ 
													...prev, 
													reductionType: e.target.value,
													red_price: '',
													red_percent: prev.red_percent
												}))}
											/>
											Percentage
										</label>
										<label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
											<input
												type="radio"
												name="reductionType"
												value="price"
												checked={formData.reductionType === 'price'}
												onChange={(e) => setFormData(prev => ({ 
													...prev, 
													reductionType: e.target.value,
													red_percent: '',
													red_price: prev.red_price
												}))}
											/>
											Fixed Amount
										</label>
									</div>

									{formData.reductionType === 'percent' ? (
										<input
											type="number"
											className="form-control"
											value={formData.red_percent}
											onChange={(e) => setFormData(prev => ({ ...prev, red_percent: e.target.value }))}
											placeholder="Discount percentage"
											min="0"
											max="100"
											step="0.01"
											required
										/>
									) : (
										<input
											type="number"
											className="form-control"
											value={formData.red_price}
											onChange={(e) => setFormData(prev => ({ ...prev, red_price: e.target.value }))}
											placeholder="Discount amount (₹)"
											min="0"
											step="0.01"
											required
										/>
									)}
								</div>

								<div className="form-group">
									<label className="form-label">Applicable Users</label>
									<div style={{ marginBottom: '15px' }}>
										<label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
											<input
												type="checkbox"
												checked={formData.applyToAll}
												onChange={(e) => setFormData(prev => ({ 
													...prev, 
													applyToAll: e.target.checked,
													userEmails: e.target.checked ? [] : prev.userEmails
												}))}
											/>
											Apply to All Users
										</label>
									</div>

									{!formData.applyToAll && (
										<div>
											<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
												<span>Select Users:</span>
												<button 
													type="button" 
													className="btn btn-secondary"
													onClick={handleSelectAll}
												>
													{formData.userEmails.length === users.length ? 'Deselect All' : 'Select All'}
												</button>
											</div>
                      
											<div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
												{users.map(user => (
													<label key={user._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}>
														<input
															type="checkbox"
															checked={formData.userEmails.includes(user.email)}
															onChange={() => handleUserToggle(user.email)}
														/>
														<span>{user.name} ({user.email})</span>
													</label>
												))}
											</div>
										</div>
									)}
								</div>
							</div>

							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
									Cancel
								</button>
								<button type="submit" className="btn btn-primary" disabled={loading}>
									{loading ? 'Saving...' : (selectedCoupon ? 'Update Coupon' : 'Create Coupon')}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default CouponManagement;
