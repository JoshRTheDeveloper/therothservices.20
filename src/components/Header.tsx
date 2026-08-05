import { Link } from "react-router-dom";
import logo from "../assets/rothserviceslogoMaster-04.png";
import "./Header.css";

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__brand" aria-label="The Roth Services home">
          <img src={logo} alt="The Roth Services" />
        </Link>
        <a
          className="site-header__contact"
          href="mailto:therothservices@gmail.com?subject=Project inquiry"
        >
          Contact
        </a>
      </div>
    </header>
  );
}
