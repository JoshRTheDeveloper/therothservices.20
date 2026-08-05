import bull from "../assets/bull.png";
import valwood from "../assets/valwood.png";
import purpose from "../assets/pur.png";
import antioch from "../assets/ant.png";
import four from "../assets/four.png";
import lake from "../assets/lak.png";
import mis from "../assets/mis.png";
import grac from "../assets/grac.png";
import cro from "../assets/cro.png";
import cam from "../assets/cam.png";
import "./Portfolio.css";

const projects = [
  {
    name: "Bullies of Texas",
    description: "Breeding business website",
    url: "https://www.bulliesoftexas.com",
    image: bull,
  },
  {
    name: "Valwood Park Church",
    description: "Church website",
    url: "https://www.valwoodparkchurch.com",
    image: valwood,
  },
  {
    name: "Purpose and Peace",
    description: "Christian counseling site",
    url: "https://www.purposeandpeace.com",
    image: purpose,
  },
  {
    name: "Antioch Baptist Church",
    description: "Church website",
    url: "https://www.abclovelady.com",
    image: antioch,
  },
  {
    name: "Fourth Dimension",
    description: "Product information site",
    url: "https://4di-inc.com",
    image: four,
  },
  {
    name: "Lakeview Baptist Church",
    description: "Church website",
    url: "https://www.lakeviewmbc.org",
    image: lake,
  },
  {
    name: "Mission Dorado Baptist Church",
    description: "Church website",
    url: "https://www.mdbc.church",
    image: mis,
  },
  {
    name: "Grace Wyoming Church",
    description: "Church website",
    url: "https://www.gracewyoming.org",
    image: grac,
  },
  {
    name: "First Baptist Crowley",
    description: "Church website",
    url: "https://www.fbccrowley.org",
    image: cro,
  },
  {
    name: "Southern Baptist Camping Association",
    description: "Organization website",
    url: "https://sbcamping.org",
    image: cam,
  },
];

export default function Portfolio() {
  return (
    <div className="portfolio">
      <section className="portfolio__intro container">
        <h1>Selected work</h1>
        <p>Websites built for churches, local businesses, and organizations.</p>
      </section>

      <section className="container" aria-label="Project list">
        <ul className="portfolio__grid">
          {projects.map((project) => (
            <li key={project.name} className="portfolio__item">
              <img src={project.image} alt="" loading="lazy" />
              <div className="portfolio__meta">
                <h2>{project.name}</h2>
                <p>{project.description}</p>
                <a
                  className="btn btn-ghost"
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View live
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
