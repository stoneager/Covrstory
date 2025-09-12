import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { collectionsAPI, uploadAPI } from '../services/api';

const CollectionManagement = () => {
	const [collections, setCollections] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [selectedCollection, setSelectedCollection] = useState(null);
	const [formData, setFormData] = useState({ name: '', image: '' });
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);

	useEffect(() => {
		fetchCollections();
	}, []);

	const fetchCollections = async () => {
		try {
			const response = await collectionsAPI.getAll();
			setCollections(response.data);
		} catch (error) {
			console.error('Error fetching collections:', error);
		}
	};

	const handleAddCollection = () => {
		setSelectedCollection(null);
		setFormData({ name: '', image: '' });
		setShowModal(true);
	};

	const handleEditCollection = (collection) => {
		setSelectedCollection(collection);
		setFormData({ name: collection.name, image: collection.image });
		setShowModal(true);
	};

	const handleDeleteCollection = async (collectionId) => {
		if (window.confirm('Are you sure you want to delete this collection?')) {
			try {
				await collectionsAPI.delete(collectionId);
				fetchCollections();
			} catch (error) {
				console.error('Error deleting collection:', error);
			}
		}
	};

	const handleImageUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		try {
			setUploading(true);
			
			// Step 1: Get presigned URL from backend
			const collectionName = formData.name || 'collection';
			const filename = file.name; // Don't encode here, let backend handle it
			const contentType = file.type;
			
			console.log('Requesting presigned URL for:', { collectionName, filename, contentType });
			
			const presignedRes = await uploadAPI.collectionPresigned(collectionName, filename, contentType);
			const { url, key } = presignedRes.data;
			
			console.log('Received presigned URL:', url);
			console.log('S3 Key:', key);

			// Step 2: Upload file directly to S3
			const s3Response = await fetch(url, {
				method: 'PUT',
				headers: {
					'Content-Type': contentType
				},
				body: file
			});

			console.log('S3 Response status:', s3Response.status);
			console.log('S3 Response headers:', Object.fromEntries(s3Response.headers.entries()));

			if (s3Response.ok) {
				// Step 3: Construct the public S3 URL
				// Use the bucket name from your .env file
				const bucketName = 'covrstory'; // From your .env: S3_BUCKET_NAME=covrstory
				const region = 'us-east-1'; // From your .env: AWS_REGION=us-east-1
				const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
				
				console.log('Constructed S3 URL:', s3Url);
				setFormData(prev => ({ ...prev, image: s3Url }));
			} else {
				const errorText = await s3Response.text();
				console.error('S3 upload failed:', errorText);
				alert(`Image upload to S3 failed: ${s3Response.status} ${s3Response.statusText}`);
			}
		} catch (error) {
			console.error('Error uploading image:', error);
			alert(`Image upload failed: ${error.message}`);
		} finally {
			setUploading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const payload = {
				name: formData.name,
				image: formData.image
			};
			
			// Better validation for image URL
			if (!payload.image || !payload.image.startsWith('https://')) {
				alert('Please upload a valid image before saving the collection.');
				setLoading(false);
				return;
			}
			
			if (selectedCollection) {
				await collectionsAPI.update(selectedCollection._id, payload);
			} else {
				await collectionsAPI.create(payload);
			}
			fetchCollections();
			setShowModal(false);
		} catch (error) {
			console.error('Error saving collection:', error);
			alert(`Error saving collection: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div className="card-header">
				<h1 className="card-title">Collection Management</h1>
				<button className="btn btn-primary" onClick={handleAddCollection}>
					<FontAwesomeIcon icon={faPlus} />
					Add Collection
				</button>
			</div>

			<div className="product-grid">
				{collections.map(collection => (
					<div key={collection._id} className="product-card">
						{collection.image && (
							<img 
								src={collection.image} 
								alt={collection.name} 
								className="product-image"
							/>
						)}
						<div className="product-info">
							<h3 className="product-name">{collection.name}</h3>
							<div className="product-actions">
								<button 
									className="btn btn-primary"
									onClick={() => handleEditCollection(collection)}
								>
									<FontAwesomeIcon icon={faEdit} />
									Edit
								</button>
								<button 
									className="btn btn-danger"
									onClick={() => handleDeleteCollection(collection._id)}
								>
									<FontAwesomeIcon icon={faTrash} />
									Delete
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{collections.length === 0 && (
				<div className="card">
					<div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
						No collections available. Create your first collection!
					</div>
				</div>
			)}

			{showModal && (
				<div className="modal-overlay">
					<div className="modal">
						<div className="modal-header">
							<h2>{selectedCollection ? 'Edit Collection' : 'Add New Collection'}</h2>
							<button className="btn btn-secondary" onClick={() => setShowModal(false)}>
								<FontAwesomeIcon icon={faTrash} />
							</button>
						</div>
            
						<form onSubmit={handleSubmit}>
							<div className="modal-body">
								<div className="form-group">
									<label className="form-label">Collection Name</label>
									<input
										type="text"
										className="form-control"
										value={formData.name}
										onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
										required
									/>
								</div>

								<div className="form-group">
									<label className="form-label">Collection Image</label>
									<input
										type="file"
										className="form-control"
										accept="image/*"
										onChange={handleImageUpload}
									/>
									{uploading && <div style={{ color: '#007bff', marginTop: '10px' }}>Uploading image...</div>}
									{formData.image && !uploading && (
										<div style={{ marginTop: '10px' }}>
											<img 
												src={formData.image} 
												alt="Preview" 
												style={{ width: '200px', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
											/>
											<div style={{ color: '#28a745', fontSize: '12px', marginTop: '5px' }}>
												✓ Image uploaded successfully
											</div>
										</div>
									)}
								</div>
							</div>

							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
									Cancel
								</button>
								<button type="submit" className="btn btn-primary" disabled={loading || uploading}>
									{loading ? 'Saving...' : (selectedCollection ? 'Update Collection' : 'Create Collection')}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default CollectionManagement;