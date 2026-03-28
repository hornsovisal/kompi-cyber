import "./Footer.css";

export default function Footer() {
  return (
    <>
      <div className="footer-top"></div>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-col">
            <h2 className="logo">CADT</h2>
            <p>Cambodia Academy of Digital Technology</p>
            <p>📍 Russian Federation Blvd, Phnom Penh, Cambodia</p>
            <p>📞 +855 23 997 000</p>
            <p>✉️ info@cadt.edu.kh</p>
          </div>

          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li>Home</li>
              <li>Courses & Programs</li>
              <li>My Learning</li>
              <li>About CADT</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Connect With Us</h3>
            <div className="social">
              <span>f</span>
              <span>in</span>
              <span>t</span>
              <span>ig</span>
            </div>
          </div>
        </div>

        <div className="copyright">
          © 2026 Cambodia Academy of Digital Technology. All rights reserved.
        </div>
      </footer>
    </>
  );
}
