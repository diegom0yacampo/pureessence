import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const logo = "https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/assets/logo.png";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>

          <div className={styles.brand}>
            <div className={styles.brandHeader}>
              <img src={logo} alt="Pure Essence" className={styles.logo} />
              <span className={styles.brandName}>Pure Essence</span>
            </div>
            <p className={styles.brandDesc}>
              Hand-blown glass. Raw botanical matter. Silence.
              The technical atelier for bespoke olfactory identities.
            </p>
          </div>

          <div className={styles.column}>
            <h4 className={styles.colTitle}>Experience</h4>
            <div className={styles.colLinks}>
              <Link to="/">Home</Link>
              <Link to="/personalizar">Customize</Link>
              <Link to="/coleccion">Collection</Link>
              <Link to="/intranet">Maison Monitor</Link>
            </div>
          </div>

          <div className={styles.column}>
            <h4 className={styles.colTitle}>Atelier</h4>
            <div className={styles.colLinks}>
              <p>Zaragoza, Spain</p>
              <p>Process No. 42</p>
              <p>Ingredients Lab</p>
              <p>Hand-blown Atelier</p>
            </div>
          </div>

          <div className={styles.column}>
            <h4 className={styles.colTitle}>Identity</h4>
            <div className={styles.colLinks}>
              <p>Privacy Policy</p>
              <p>Legal Terms</p>
              <p>Sourcing Ethics</p>
              <p>Extraction Protocol</p>
            </div>
          </div>

          <div className={styles.column}>
            <h4 className={styles.colTitle}>Connect</h4>
            <div className={styles.colLinks}>
              <p>Instagram</p>
              <p>Journal</p>
              <p>Newsletter</p>
              <p>Private Atelier</p>
            </div>
          </div>

        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            Copyright © 2026 CustomLab Studio Inc. All rights reserved. Zaragoza, Spain.
          </p>
          <div className={styles.legalLinks}>
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
            <span>Sales Policy</span>
            <span>Legal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
