import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__brand">The Roth Services</p>
        <a href="mailto:therothservices@gmail.com?subject=Project inquiry">
          therothservices@gmail.com
        </a>
        <p className="site-footer__copy">© {year}</p>
      </div>
    </footer>
  );
}
