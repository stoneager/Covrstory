import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
	faHome, 
	faBoxes, 
	faLayerGroup, 
	faPercent, 
	faTicketAlt 
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
	const location = useLocation();

	const menuItems = [
		{ path: '/', label: 'Dashboard', icon: faHome },
		{ path: '/products', label: 'Product Management', icon: faBoxes },
		{ path: '/collections', label: 'Collections', icon: faLayerGroup },
		{ path: '/discounts', label: 'Discounts', icon: faPercent },
		{ path: '/coupons', label: 'Coupons', icon: faTicketAlt },
		{ path: '/order-tracking', label: 'Order Tracking', icon: faBoxes }
	];

	return (
		<div className="sidebar">
			<ul className="sidebar-menu">
				{menuItems.map((item) => (
					<li 
						key={item.path} 
						className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
					>
						<Link to={item.path}>
							<FontAwesomeIcon icon={item.icon} />
							<span>{item.label}</span>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

export default Sidebar;
