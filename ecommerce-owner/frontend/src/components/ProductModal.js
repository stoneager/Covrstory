import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { productsAPI, uploadAPI } from '../services/api';

const ProductModal = ({ product, collections, onClose, onSave }) => {
	const [formData, setFormData] = useState({
		collection: '',
		type: 'top',
		gender: 'm',
		activity: '',
		name: '',
		description: '',
		variants: [{
			colour: '',
			price: '',
			sizes: [{ size: 's', qty: 0 }],
			images: []
		}]
	});
	const [quantities, setQuantities] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);

	useEffect(() => {
		if (product) {
			setIsEditMode(true);
			setFormData({
				collection: product.collection._id,
				type: product.type,
				gender: product.gender,
				activity: product.activity,
				name: product.name,
				description: product.description,
				variants: []
			});
			fetchProductQuantities();
		}
	}, [product]);

	const fetchProductQuantities = async () => {
		try {
			const response = await productsAPI.getById(product._id);
			setQuantities(response.data.quantities);
			// Group quantities by color for editing
			const variants = groupQuantitiesByColor(response.data.quantities);
			setFormData(prev => ({ ...prev, variants }));
		} catch (error) {
			console.error('Error fetching product quantities:', error);
		}
	};

	const groupQuantitiesByColor = (quantities) => {
		const grouped = {};
		quantities.forEach(qty => {
			if (!grouped[qty.colour]) {
				grouped[qty.colour] = {
					colour: qty.colour,
					price: qty.price,
					sizes: [],
					images: qty.images || []
				};
			}
			grouped[qty.colour].sizes.push({
				_id: qty._id,
				size: qty.size,
				qty: qty.qty
			});
		});
		return Object.values(grouped);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleVariantChange = (index, field, value) => {
		const newVariants = [...formData.variants];
		newVariants[index][field] = value;
		setFormData(prev => ({ ...prev, variants: newVariants }));
	};

	const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
		const newVariants = [...formData.variants];
		newVariants[variantIndex].sizes[sizeIndex][field] = value;
		setFormData(prev => ({ ...prev, variants: newVariants }));
	};

	const addVariant = () => {
		setFormData(prev => ({
			...prev,
			variants: [...prev.variants, {
				colour: '',
				price: '',
				sizes: [{ size: 's', qty: 0 }],
				images: []
			}]
		}));
	};

	const removeVariant = (index) => {
		const newVariants = formData.variants.filter((_, i) => i !== index);
		setFormData(prev => ({ ...prev, variants: newVariants }));
	};

	const addSize = (variantIndex) => {
		const newVariants = [...formData.variants];
		newVariants[variantIndex].sizes.push({ size: 's', qty: 0 });
		setFormData(prev => ({ ...prev, variants: newVariants }));
	};

	const removeSize = (variantIndex, sizeIndex) => {
		const newVariants = [...formData.variants];
		newVariants[variantIndex].sizes = newVariants[variantIndex].sizes.filter((_, i) => i !== sizeIndex);
		setFormData(prev => ({ ...prev, variants: newVariants }));
	};

	const handleImageUpload = async (variantIndex, files) => {
		try {
			const productName = formData.name;
			const color = formData.variants[variantIndex].colour;
			const uploadedUrls = [];
			for (const file of Array.from(files)) {
				// Request presigned URL from backend
				const presignedRes = await uploadAPI.productPresigned(productName, color, file.name, file.type);
				const { url, key } = presignedRes.data;
				// Upload file to S3
				const s3Response = await fetch(url, {
					method: 'PUT',
					headers: {
						'Content-Type': file.type
					},
					body: file
				});
				if (s3Response.ok) {
					const s3Url = `https://${process.env.REACT_APP_S3_BUCKET}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/${key}`;
					uploadedUrls.push(s3Url);
				} else {
					alert('Image upload to S3 failed. Please try again.');
				}
			}
			const newVariants = [...formData.variants];
			newVariants[variantIndex].images = [
				...newVariants[variantIndex].images,
				...uploadedUrls
			];
			setFormData(prev => ({ ...prev, variants: newVariants }));
		} catch (error) {
			console.error('Error uploading images:', error);
			alert('Image upload failed. Please try again.');
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (isEditMode) {
				// Update quantities for existing product
				const updatedQuantities = [];
				formData.variants.forEach(variant => {
					variant.sizes.forEach(size => {
						updatedQuantities.push({
							_id: size._id,
							qty: parseInt(size.qty),
							price: parseFloat(variant.price),
							images: variant.images
						});
					});
				});
				await productsAPI.updateQuantities(product._id, updatedQuantities);
			} else {
				// Create new product
				await productsAPI.create({
					...formData,
					variants: formData.variants.map(variant => ({
						...variant,
						price: parseFloat(variant.price),
						sizes: variant.sizes.map(size => ({
							...size,
							qty: parseInt(size.qty)
						}))
					}))
				});

				console.log('Product created:', formData);
			}
			onSave();
		} catch (error) {
			console.error('Error saving product:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="modal-overlay">
			<div className="modal">
				<div className="modal-header">
					<h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
					<button className="btn btn-secondary" onClick={onClose}>
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>
        
				<form onSubmit={handleSubmit}>
					<div className="modal-body">
						<div className="form-group">
							<label className="form-label">Collection</label>
							<select
								name="collection"
								className="form-control"
								value={formData.collection}
								onChange={handleInputChange}
								required
								disabled={isEditMode}
							>
								<option value="">Select Collection</option>
								{collections.map(collection => (
									<option key={collection._id} value={collection._id}>
										{collection.name}
									</option>
								))}
							</select>
						</div>

						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
							<div className="form-group">
								<label className="form-label">Type</label>
								<select
									name="type"
									className="form-control"
									value={formData.type}
									onChange={handleInputChange}
									required
									disabled={isEditMode}
								>
									<option value="top">Top</option>
									<option value="bottom">Bottom</option>
								</select>
							</div>

							<div className="form-group">
								<label className="form-label">Gender</label>
								<select
									name="gender"
									className="form-control"
									value={formData.gender}
									onChange={handleInputChange}
									required
									disabled={isEditMode}
								>
									<option value="m">Male</option>
									<option value="f">Female</option>
								</select>
							</div>
						</div>

						<div className="form-group">
							<label className="form-label">Activity</label>
							<input
								type="text"
								name="activity"
								className="form-control"
								value={formData.activity}
								onChange={handleInputChange}
								required
								disabled={isEditMode}
							/>
						</div>

						<div className="form-group">
							<label className="form-label">Product Name</label>
							<input
								type="text"
								name="name"
								className="form-control"
								value={formData.name}
								onChange={handleInputChange}
								required
								disabled={isEditMode}
							/>
						</div>

						<div className="form-group">
							<label className="form-label">Description</label>
							<textarea
								name="description"
								className="form-control"
								rows="3"
								value={formData.description}
								onChange={handleInputChange}
								required
								disabled={isEditMode}
							/>
						</div>

						<div className="form-group">
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
								<label className="form-label">Product Variants</label>
								{!isEditMode && (
									<button type="button" className="btn btn-success" onClick={addVariant}>
										<FontAwesomeIcon icon={faPlus} />
										Add Variant
									</button>
								)}
							</div>

							{formData.variants.map((variant, variantIndex) => (
								<div key={variantIndex} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
										<h4>Variant {variantIndex + 1}</h4>
										{!isEditMode && formData.variants.length > 1 && (
											<button type="button" className="btn btn-danger" onClick={() => removeVariant(variantIndex)}>
												<FontAwesomeIcon icon={faTimes} />
											</button>
										)}
									</div>

									<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
										<div className="form-group">
											<label className="form-label">Color</label>
											<input
												type="text"
												className="form-control"
												value={variant.colour}
												onChange={(e) => handleVariantChange(variantIndex, 'colour', e.target.value)}
												required
												disabled={isEditMode}
											/>
										</div>

										<div className="form-group">
											<label className="form-label">Price (₹)</label>
											<input
												type="number"
												className="form-control"
												value={variant.price}
												onChange={(e) => handleVariantChange(variantIndex, 'price', e.target.value)}
												required
											/>
										</div>
									</div>

									<div className="form-group">
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
											<label className="form-label">Sizes & Quantities</label>
											{!isEditMode && (
												<button type="button" className="btn btn-success" onClick={() => addSize(variantIndex)}>
													<FontAwesomeIcon icon={faPlus} />
													Add Size
												</button>
											)}
										</div>

										{variant.sizes.map((size, sizeIndex) => (
											<div key={sizeIndex} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
												<select
													className="form-control"
													value={size.size}
													onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'size', e.target.value)}
													required
													disabled={isEditMode}
												>
													<option value="xs">XS</option>
													<option value="s">S</option>
													<option value="m">M</option>
													<option value="l">L</option>
													<option value="xl">XL</option>
													<option value="xxl">XXL</option>
												</select>
												<input
													type="number"
													className="form-control"
													placeholder="Quantity"
													value={size.qty}
													onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'qty', e.target.value)}
													min="0"
													required
												/>
												{!isEditMode && variant.sizes.length > 1 && (
													<button type="button" className="btn btn-danger" onClick={() => removeSize(variantIndex, sizeIndex)}>
														<FontAwesomeIcon icon={faMinus} />
													</button>
												)}
											</div>
										))}
									</div>

									<div className="form-group">
										<label className="form-label">Images</label>
										<input
											type="file"
											className="form-control"
											multiple
											accept="image/*"
											onChange={(e) => handleImageUpload(variantIndex, e.target.files)}
											disabled={isEditMode}
										/>
										{variant.images.length > 0 && (
											<div className="image-preview">
												{variant.images.map((image, imgIndex) => (
													<img key={imgIndex} src={image} alt={`${variant.colour} ${imgIndex + 1}`} />
												))}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="modal-footer">
						<button type="button" className="btn btn-secondary" onClick={onClose}>
							Cancel
						</button>
						<button type="submit" className="btn btn-primary" disabled={loading}>
							{loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ProductModal;
