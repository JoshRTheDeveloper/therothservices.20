import React, { useState, useEffect } from 'react';
import './hero.css';
import di from '../../assets/laptop.png';

const Hero: React.FC = () => {
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
        <div className='main-background'>
            {isMobile ? (
         
                <div className='mobile-container'>
                    <h1 className='m-primary-h1'>Affordable</h1>
                    <h1 className='m-primary-h2'>Web Services</h1>
     
                    <div className='msplit'>
                        <img className="mhero-image" src={di} alt="Laptop showcasing web services" />
                    </div>
                    <p>Using AWS (Amazon Web Services)</p>
                    <p>Simple websites or full stack applications</p>
                    <button className='main-button' onClick={() => window.location.href = 'mailto:therothservices@gmail.com?subject=Web Services'}>Email</button>
                </div>
                
            ) : (
            
                <div className='main-container'>
                    <div className='split'>
                        <div>
                            <h1 className='primary-h1'>Affordable </h1>
                            <h1 className='primary-h2'>Web Services </h1>
                            <p>Using AWS (Amazon Web Services)</p>
                            <p>Simple websites or full stack applications</p>
                                <div className='button-container'>
                                  <button className='main-button' onClick={() => window.location.href = 'mailto:therothservices@gmail.com?subject=Web Services'}>Contact</button>
                                </div>
                           
                        </div>
                    </div>
                    <div className='split'>
                        <img className="hero-image" src={di} alt="Laptop showcasing web services" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hero;
