import React from 'react';
// import { Link } from 'react-router-dom';
import './nav.css';
import Logo from '../../assets/rothserviceslogoMaster-04.png'

const Nav: React.FC = () => {
    return (
        <nav>
      <div>
      <img className="navbar-brand" src={Logo} alt=""  />
      </div>
            {/* <ul> */}
                {/* <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li> */}
            {/* </ul> */}
        </nav>
    );
};

export default Nav;
