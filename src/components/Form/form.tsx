import React, { useState, useEffect, useRef } from 'react';
import './form.css'; // Import the CSS file for styling

const Form = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const formInfoRef = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log('Form data:', formData);
        // Add logic to send data to AWS services
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (formInfoRef.current) {
            observer.observe(formInfoRef.current);
        }

        return () => {
            if (formInfoRef.current) {
                observer.unobserve(formInfoRef.current);
            }
        };
    }, []);

    return (
        <div className='form-container'>
            <div className='split-2'>
                <div
                    className={`form-info ${isVisible ? 'animate' : ''}`}
                    ref={formInfoRef}
                >
                    <h2>Let's Talk.</h2>
                    <h2>What are you building?</h2>
                    <p>We would love to work with you!</p>
                    <br></br>
                    <p>Email me at <a href="mailto:therothservices@gmail.com">therothservices@gmail.com</a></p>
                </div>
                <form onSubmit={handleSubmit} className="form-box">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full name*"
                        required
                        className="form-input"
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email address*"
                        required
                        className="form-input"
                    />
                     <input
                        type="text"
                        name="phone"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        className="form-input"
                    />
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Subject"
                        className="form-input"
                    />
                    
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your project*"
                        required
                        className="form-textarea"
                    />
                    <button type="submit" className="form-button">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default Form;
