import React, { useState } from 'react';

const Frame = ({ initialData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const defaultImage = '/trending-news-placeholder.png';

  const handleNavigation = (direction) => {
    if (direction === 'next' && currentIndex < initialData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'back' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentItem = initialData[currentIndex] || {};
  const imageUrl = currentItem.imageUrl || defaultImage;

  return (
    <div>
      <h1>{currentItem.title || 'No title available'}</h1>
      <img src={imageUrl} alt={currentItem.title || 'News image'} style={{ width: '100%', height: 'auto' }} />
      <div>
        <button onClick={() => handleNavigation('back')} disabled={currentIndex === 0}>Back</button>
        <button onClick={() => handleNavigation('next')} disabled={currentIndex === initialData.length - 1}>Next</button>
        <a href={currentItem.url || '#'} target="_blank" rel="noopener noreferrer">
          <button>Read</button>
        </a>
      </div>
    </div>
  );
};

export default Frame;