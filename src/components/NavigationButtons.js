import React from 'react';

const NavigationButtons = ({ onBack, onNext, articleUrl, onHome }) => {
    return (
        <div className="navigation-buttons">
            <button onClick={onBack}>Back</button>
            <button onClick={onNext}>Next</button>
            <a href={articleUrl} target="_blank" rel="noopener noreferrer">
                <button>Read</button>
            </a>
            <button onClick={onHome}>Home</button>
        </div>
    );
};

export default NavigationButtons;
