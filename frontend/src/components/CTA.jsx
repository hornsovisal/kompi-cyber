import "./CTA.css";

export default function CTA() {
  const handleCTAClick = (e, buttonType) => {
    e.preventDefault();
    const button = e.target;
    button.style.animation = "pulse 0.8s ease-in-out";
    setTimeout(() => {
      button.style.animation = "";
    }, 800);
  };

  return (
    <section className="cta">
      <h2>Ready to Start Your Learning Journey?</h2>
      <p>
        Join thousands of students advancing their careers with CADT Learning
      </p>
      <div className="cta-buttons">
        <a
          href="#"
          className="btn primary"
          onClick={(e) => handleCTAClick(e, "Get Started")}
        >
          Get Started Today
        </a>
        <a
          href="#"
          className="btn secondary"
          onClick={(e) => handleCTAClick(e, "Explore Courses")}
        >
          Explore Courses
        </a>
      </div>
    </section>
  );
}
