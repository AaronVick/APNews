import React from 'react';

const Header = ({ headline, imageUrl }) => {
    return (
        <div className="header" style={{ backgroundImage: `url(${imageUrl})` }}>
            <h1 className="headline">{headline}</h1>
        </div>
    );
};

export default Header;
