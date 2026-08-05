import heroImage from "../assets/laptop.png";
import "./Home.css";

const services = [
  {
    index: "01",
    title: "Websites",
    copy: "Clear, fast sites that put your brand first and convert visitors into clients.",
  },
  {
    index: "02",
    title: "Client applications",
    copy: "Custom tools and dashboards built for how your business actually works.",
  },
  {
    index: "03",
    title: "Mail for clients",
    copy: "Professional email setup and support so your business communications stay reliable.",
  },
];

export default function Home() {
  return (
    <div className="home">
      <section className="hero" aria-label="Introduction">
        <div className="container hero__layout">
          <div className="hero__content">
            <p className="hero__brand">
              <span>The Roth</span>
              <span>Services</span>
            </p>
            <div className="hero__rule" aria-hidden="true" />
            <h1>Sites, apps, and mail — built to run your business.</h1>
            <p className="hero__lede">
              One partner for the presence people see, the tools they use, and the inbox you rely on.
            </p>
            <a
              className="btn btn-primary"
              href="mailto:therothservices@gmail.com?subject=Project inquiry"
            >
              Start a project
            </a>
          </div>
          <div className="hero__media">
            <img
              src={heroImage}
              alt="Laptop showcasing web services"
              width={762}
              height={705}
            />
          </div>
        </div>
      </section>

      <section className="services" aria-labelledby="services-heading">
        <div className="container">
          <div className="services__head">
            <h2 id="services-heading">What I deliver</h2>
            <p>Three offers. One relationship.</p>
          </div>

          <ul className="services__list">
            {services.map((service) => (
              <li key={service.title}>
                <span className="services__index">{service.index}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="contact-strip" aria-labelledby="contact-heading">
        <div className="container contact-strip__inner">
          <div>
            <p className="contact-strip__label">Next step</p>
            <h2 id="contact-heading">Tell me what you need built.</h2>
          </div>
          <a
            className="btn btn-primary"
            href="mailto:therothservices@gmail.com?subject=Project inquiry"
          >
            Email Roth Services
          </a>
        </div>
      </section>
    </div>
  );
}
