import React from 'react';

const Header = () => {
	const companyName = process.env.REACT_APP_COMPANY_NAME || 'Your Store';
	const companyLogo = process.env.REACT_APP_COMPANY_LOGO_URL || 'https://via.placeholder.com/150x50?text=LOGO';

	return (
		<header className="header">
			<div className="logo">
				<img src={companyLogo} alt={`${companyName} Logo`} />
				<span>{companyName} - Owner Panel</span>
			</div>
			<div className="header-actions">
				<span>Welcome, Owner</span>
			</div>
		</header>
	);
};

export default Header;
