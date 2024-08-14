import React, { useState, useEffect } from 'react';
import Header from './Header';
import NavigationButtons from './NavigationButtons';
import fetchRSS from '../utils/fetchRSS';

const DEFAULT_IMAGE = '/trending-news-placeholder.png';

const Frame = () => {
    const [headlineData, setHeadlineData] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState('top');

    useEffect(() => {
        fetchData(category);
    }, [category]);

    const fetchData = async (cat) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchRSS(cat);
            setHeadlineData(data);
            setCurrentIndex(0);
        } catch (err) {
            setError('Failed to fetch news. Please try again.');
            setHeadlineData([{ title: "Error loading news", imageUrl: DEFAULT_IMAGE, url: "#" }]);
        }
        setLoading(false);
    };

    const handleCategoryClick = (newCategory) => {
        setCategory(newCategory);
    };

    const handleNavigation = (direction) => {
        if (direction === 'next' && currentIndex < headlineData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else if (direction === 'back' && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const currentHeadline = headlineData && headlineData[currentIndex];

    return (
        <div className="frame">
            <Header 
                headline={currentHeadline ? currentHeadline.title : "Trending News"} 
                imageUrl={currentHeadline ? currentHeadline.imageUrl : DEFAULT_IMAGE} 
            />
            <div className="categories">
                {['top', 'world', 'us', 'biz'].map(cat => (
                    <button key={cat} onClick={() => handleCategoryClick(cat)}>{cat}</button>
                ))}
            </div>
            <NavigationButtons 
                onBack={() => handleNavigation('back')} 
                onNext={() => handleNavigation('next')} 
                articleUrl={currentHeadline ? currentHeadline.url : "#"} 
                onHome={() => setCategory('top')} 
            />
        </div>
    );
};

export default Frame;