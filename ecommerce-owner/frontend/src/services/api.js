
import axios from 'axios';

// ...existing code...

// Packages API
export const packagesAPI = {
	getAll: () => api.get('/packages'),
	create: (data) => api.post('/packages', data),
	updateStatus: (id, status) => api.put(`/packages/${id}/status`, { status }),
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Orders API
export const ordersAPI = {
	getStats: (filter) => api.get(`/orders/stats?filter=${filter}`),
	getAll: () => api.get('/orders'),
};

// Products API
export const productsAPI = {
	getAll: (search = '') => api.get(`/products?search=${search}`),
	getById: (id) => api.get(`/products/${id}`),
	create: (data) => api.post('/products', data),
	updateQuantities: (id, quantities) => api.put(`/products/${id}/quantities`, { quantities }),
	delete: (id) => api.delete(`/products/${id}`),
};

// Collections API
export const collectionsAPI = {
	getAll: () => api.get('/collections'),
	create: (data) => api.post('/collections', data),
	update: (id, data) => api.put(`/collections/${id}`, data),
	delete: (id) => api.delete(`/collections/${id}`),
};

// Coupons API
export const couponsAPI = {
	getAll: () => api.get('/coupons'),
	create: (data) => api.post('/coupons', data),
	update: (id, data) => api.put(`/coupons/${id}`, data),
	delete: (id) => api.delete(`/coupons/${id}`),
};

// Discounts API
export const discountsAPI = {
	getAll: () => api.get('/discounts'),
	create: (data) => api.post('/discounts', data),
	update: (id, data) => api.put(`/discounts/${id}`, data),
	delete: (id) => api.delete(`/discounts/${id}`),
};

// Users API
export const usersAPI = {
	getAll: () => api.get('/users'),
};

// Upload API
export const uploadAPI = {
	productImages: (formData) => api.post('/upload/product', formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	}),
	collectionImage: (formData) => api.post('/upload/collection', formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	}),
	collectionPresigned: (collectionName, filename, contentType) =>
		api.post('/upload/collection-presigned', { collectionName, filename, contentType }),
	productPresigned: (productName, color, filename, contentType) =>
		api.post('/upload/product-presigned', { productName, color, filename, contentType }),
};

export default api;
