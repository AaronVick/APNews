import React, { useState } from 'react';
import Header from './Header';
import NavigationButtons from './NavigationButtons';
import fetchRSS from '../utils/fetchRSS';

const Frame = () => {
    const [headlineData, setHeadlineData] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [category, setCategory] = useState(null);

    const handleCategoryClick = async (category) => {
        const data = await fetchRSS(category);
        setHeadlineData(data);
        setCurrentIndex(0);
        setCategory(category);
    };

    const handleNavigation = (direction) => {
        if (direction === 'next' && currentIndex < headlineData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else if (direction === 'back' && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div className="frame">
            <Header headline={headlineData ? headlineData[currentIndex].title : "Trending News"} 
                    imageUrl={headlineData ? headlineData[currentIndex].imageUrl : "/default-placeholder.png"} />
            <NavigationButtons 
                onBack={() => handleNavigation('back')} 
                onNext={() => handleNavigation('next')} 
                onRead={() => window.open(headlineData[currentIndex].url, '_blank')}
                onHome={() => setHeadlineData(null)} />
        </div>
    );
};

export default Frame;
