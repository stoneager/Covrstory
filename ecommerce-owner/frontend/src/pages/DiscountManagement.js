import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { discountsAPI, productsAPI } from '../services/api';

const DiscountManagement = () => {
	const [discounts, setDiscounts] = useState([]);
	const [products, setProducts] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [selectedDiscount, setSelectedDiscount] = useState(null);
	const [formData, setFormData] = useState({
		productIds: [],
		discount_percent: '',
		applyToAll: true
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchDiscounts();
		fetchProducts();
	}, []);

	const fetchDiscounts = async () => {
		try {
			const response = await discountsAPI.getAll();
			setDiscounts(response.data);
		} catch (error) {
			console.error('Error fetching discounts:', error);
		}
	};

	const fetchProducts = async () => {
		try {
			const response = await productsAPI.getAll();
			setProducts(response.data);
		} catch (error) {
			console.error('Error fetching products:', error);
		}
	};

	const handleAddDiscount = () => {
		setSelectedDiscount(null);
		setFormData({
			productIds: [],
			discount_percent: '',
			applyToAll: true
		});
		setShowModal(true);
	};

	const handleEditDiscount = (discount) => {
		setSelectedDiscount(discount);
		setFormData({
			productIds: discount.products.map(p => p._id || p),
			discount_percent: discount.discount_percent,
			applyToAll: discount.products.length === 0
		});
		setShowModal(true);
	};

	const handleDeleteDiscount = async (discountId) => {
		if (window.confirm('Are you sure you want to delete this discount?')) {
			try {
				await discountsAPI.delete(discountId);
				fetchDiscounts();
			} catch (error) {
				console.error('Error deleting discount:', error);
			}
		}
	};

	const handleProductToggle = (productId) => {
		if (formData.applyToAll) return;

		setFormData(prev => {
			const isSelected = prev.productIds.includes(productId);
			return {
				...prev,
				productIds: isSelected
					? prev.productIds.filter(id => id !== productId)
					: [...prev.productIds, productId]
			};
		});
	};

	const handleSelectAll = () => {
		if (formData.applyToAll) {
			setFormData(prev => ({ ...prev, productIds: products.map(p => p._id) }));
		} else {
			setFormData(prev => ({ ...prev, productIds: [] }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const submitData = {
				productIds: formData.applyToAll ? [] : formData.productIds,
				discount_percent: parseFloat(formData.discount_percent)
			};

			if (selectedDiscount) {
				await discountsAPI.update(selectedDiscount._id, submitData);
			} else {
				await discountsAPI.create(submitData);
			}
      
			fetchDiscounts();
			setShowModal(false);
		} catch (error) {
			console.error('Error saving discount:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div className="card-header">
				<h1 className="card-title">Discount Management</h1>
				<button className="btn btn-primary" onClick={handleAddDiscount}>
					<FontAwesomeIcon icon={faPlus} />
					Add Discount
				</button>
			</div>

			<div className="card">
				<div className="table-responsive">
					<table className="table">
						<thead>
							<tr>
								<th>Discount %</th>
								<th>Applied To</th>
								<th>Products Count</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{discounts.map(discount => (
								<tr key={discount._id}>
									<td>{discount.discount_percent}%</td>
									<td>
										{discount.products.length === 0 ? 'All Products' : 'Selected Products'}
									</td>
									<td>
										{discount.products.length === 0 ? products.length : discount.products.length}
									</td>
									<td>
										<span className={`badge badge-${discount.isActive ? 'success' : 'danger'}`}>
											{discount.isActive ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td>
										<button 
											className="btn btn-primary"
											onClick={() => handleEditDiscount(discount)}
											style={{ marginRight: '10px' }}
										>
											<FontAwesomeIcon icon={faEdit} />
										</button>
										<button 
											className="btn btn-danger"
											onClick={() => handleDeleteDiscount(discount._id)}
										>
											<FontAwesomeIcon icon={faTrash} />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{discounts.length === 0 && (
					<div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
						No discounts available. Create your first discount!
					</div>
				)}
			</div>

			{showModal && (
				<div className="modal-overlay">
					<div className="modal">
						<div className="modal-header">
							<h2>{selectedDiscount ? 'Edit Discount' : 'Add New Discount'}</h2>
							<button className="btn btn-secondary" onClick={() => setShowModal(false)}>
								<FontAwesomeIcon icon={faTrash} />
							</button>
						</div>
            
						<form onSubmit={handleSubmit}>
							<div className="modal-body">
								<div className="form-group">
									<label className="form-label">Discount Percentage</label>
									<input
										type="number"
										className="form-control"
										value={formData.discount_percent}
										onChange={(e) => setFormData(prev => ({ ...prev, discount_percent: e.target.value }))}
										min="0"
										max="100"
										step="0.01"
										required
									/>
								</div>

								<div className="form-group">
									<label className="form-label">Apply To</label>
									<div style={{ marginBottom: '15px' }}>
										<label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
											<input
												type="checkbox"
												checked={formData.applyToAll}
												onChange={(e) => setFormData(prev => ({ 
													...prev, 
													applyToAll: e.target.checked,
													productIds: e.target.checked ? [] : prev.productIds
												}))}
											/>
											Apply to All Products
										</label>
									</div>

									{!formData.applyToAll && (
										<div>
											<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
												<span>Select Products:</span>
												<button 
													type="button" 
													className="btn btn-secondary"
													onClick={handleSelectAll}
												>
													{formData.productIds.length === products.length ? 'Deselect All' : 'Select All'}
												</button>
											</div>
                      
											<div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
												{products.map(product => (
													<label key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}>
														<input
															type="checkbox"
															checked={formData.productIds.includes(product._id)}
															onChange={() => handleProductToggle(product._id)}
														/>
														<span>{product.name} ({product.collection?.name})</span>
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
									{loading ? 'Saving...' : (selectedDiscount ? 'Update Discount' : 'Create Discount')}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default DiscountManagement;
