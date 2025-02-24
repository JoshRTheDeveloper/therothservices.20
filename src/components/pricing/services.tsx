import React, { useState, useEffect } from 'react';
import './services.css';
import tower from '../../assets/tower.png';
import front from '../../assets/phonea.png';
import robot from '../../assets/robot.png';

const Pricing: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Function to check screen size
  const updateScreenSize = () => {
    setIsMobile(window.innerWidth <= 870); 
  };

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return (
    <div className='pricing-background'>
      {isMobile ? (
        // Mobile View
        <div className='mobile-container-services'>
          <h2>Our Services</h2>
          <div className='msplit'>
            <div className='mobile-service'>
              <div className='services-image-box'>
                <img className="image-size" src={front} alt="Frontend development" />
              </div>
              <h3>Frontend</h3>
              <p>Creating the parts of the website that people see and use, making sure everything looks good and works smoothly on all devices.</p>
            </div>

            <div className='mobile-service center'>
              <div className='services-image-box'>
                <img className="image-size" src={robot} alt="Live support" />
              </div>
              <h3>Live Support</h3>
              <p>Never talk to a robot,</p>
              <p>human support only</p>
            </div>

            <div className='mobile-service right'>
              <div className='services-image-box'>
                <img className="image-size flip-horizontal" src={tower} alt="Backend development" />
              </div>
              <h3>Backend</h3>
              <p>Developing the parts of the website that handle data, like logging in or storing information, and ensuring everything runs securely and efficiently.</p>
            </div>
          </div>
        </div>
      ) : (
        // Desktop View
        <div className='pricing-main-container'>
          <h2>Our Services</h2>
          <div className='three-split'>
            <div className='one-third left'>
              <div>
                <div className='services-image-box'>
                  <img className="image-size" src={front} alt="Frontend development" />
                </div>
                <h3>Frontend</h3>
                <p>Creating the parts of the website that people see and use, making sure everything looks good and works smoothly on all devices.</p>
              </div>
            </div>

            <div className='one-third'>
              <div className='services-image-box'>
                <img className="image-size" src={robot} alt="Live support" />
              </div>
              <h3>Live Support</h3>
              <p className='center'>Never talk to a robot,</p>
              <p className='center'>human support only</p>
            </div>

            <div className='one-third right'>
              <div className='services-image-box'>
                <img className="image-size flip-horizontal" src={tower} alt="Backend development" />
              </div>
              <h3>Backend</h3>
              <p>Developing the parts of the website that handle data, like logging in or storing information, and ensuring everything runs securely and efficiently.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing; 
