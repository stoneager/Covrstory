import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';
import { productsAPI, collectionsAPI } from '../services/api';
import ProductModal from '../components/ProductModal';

const ProductManagement = () => {
	const [products, setProducts] = useState([]);
	const [collections, setCollections] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		fetchProducts();
		fetchCollections();
	}, []);

	useEffect(() => {
		const delayedSearch = setTimeout(() => {
			if (searchTerm !== '') {
				fetchProducts();
			}
		}, 500);

		return () => clearTimeout(delayedSearch);
	}, [searchTerm]);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const response = await productsAPI.getAll(searchTerm);
			setProducts(response.data);
			console.log('Fetched products:', response.data);
			console.log('Variants : ', response.data.variants);
		} catch (error) {
			console.error('Error fetching products:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchCollections = async () => {
		try {
			const response = await collectionsAPI.getAll();
			setCollections(response.data);
		} catch (error) {
			console.error('Error fetching collections:', error);
		}
	};

	const handleAddProduct = () => {
		setSelectedProduct(null);
		setShowModal(true);
	};
	const handleEditProduct = (product) => {
		setSelectedProduct(product);
		setShowModal(true);
	};

	const handleDeleteProduct = async (productId) => {
		if (window.confirm('Are you sure you want to delete this product?')) {
			try {
				await productsAPI.delete(productId);
				fetchProducts();
			} catch (error) {
				console.error('Error deleting product:', error);
			}
		}
	};
	const handleModalClose = () => {
		setShowModal(false);
		setSelectedProduct(null);
	};

	const handleModalSave = () => {
		fetchProducts();
		handleModalClose();
	};
	return (
		<div>
			<div className="card-header">
				<h1 className="card-title">Product Management</h1>
				<button className="btn btn-primary" onClick={handleAddProduct}>
					<FontAwesomeIcon icon={faPlus} />
					Add Product
				</button>
			</div>
			<div className="card">
				<div className="filters">
					<div className="form-group" style={{ marginBottom: '0', flex: 1 }}>
						<div style={{ position: 'relative' }}>
							<input type="text" className="form-control" placeholder="Search products..."
							    value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								style={{ paddingLeft: '35px' }}
							/>
							<FontAwesomeIcon 
								icon={faSearch} 
								style={{ 
									position: 'absolute', 
				  left: '10px', 
				  top: '50%', 
				  transform: 'translateY(-50%)',
									color: '#666'
								}} 
							/>
						</div>
					</div>
				</div>
				{loading ? (
					<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
				) : (
					<div className="product-grid">
						{products.map(product => (
							<div key={product._id} className="product-card">
								{/* Image previews grouped by color/variant */}
								{product.variants && product.variants.length > 0 && (
									<div style={{ marginBottom: '10px' }}>
										{product.variants.map((variant, vIdx) => (
											<div key={vIdx} style={{ marginBottom: '8px' }}>
												<div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '3px' }}>
													Color: {variant.colour}
												</div>
												<div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
													{variant.images && variant.images.length > 0 ? (
														variant.images.map((img, imgIdx) => (
															<img
																key={imgIdx}
																src={img}
																alt={`${product.name} ${variant.colour} ${imgIdx + 1}`}
																style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee' }}
															/>
														))
													) : (
														<span style={{ color: '#aaa', fontSize: '12px' }}>No images</span>
													)}
												</div>
											</div>
										))}
									</div>
								)}
								<div className="product-info">
									<h3 className="product-name">{product.name}</h3>
									<p className="product-description">{product.description}</p>
									<div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
										<div>Collection: {product.collection?.name}</div>
										<div>Type: {product.type} | Gender: {product.gender}</div>
										<div>Activity: {product.activity}</div>
									</div>
									<div className="product-actions">
										<button 
											className="btn btn-primary"
											onClick={() => handleEditProduct(product)}
										>
											<FontAwesomeIcon icon={faEdit} />
											Edit
										</button>
										<button 
											className="btn btn-danger"
											onClick={() => handleDeleteProduct(product._id)}
										>
											<FontAwesomeIcon icon={faTrash} />
											Delete
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{!loading && products.length === 0 && (
					<div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
						{searchTerm ? 'No products found matching your search.' : 'No products available. Add your first product!'}
					</div>
				)}
			</div>

			{showModal && (
				<ProductModal
					product={selectedProduct}
					collections={collections}
					onClose={handleModalClose}
					onSave={handleModalSave}
				/>
			)}
		</div>
	);
};

export default ProductManagement;