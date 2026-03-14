export default function Hero({ memberCount }) {
    return (
        <section className="hero">
            <div className="hero-label">INSPECTION UNIT · PERSONNEL MODULE</div>
            <h1 className="hero-title">
                The Engineering<br />
                <em>Intelligence</em>
            </h1>
            <p className="hero-sub">
                Every great machine is built by exceptional people. Our team operates like
                a precision system — each member a critical component in the architecture
                of tomorrow.
            </p>
            <div className="hero-stats">
                <div className="stat">
                    <span className="stat-num" id="statCount">
                        {memberCount}
                    </span>
                    <span className="stat-label">Engineers</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat">
                    <span className="stat-num">12</span>
                    <span className="stat-label">Patents</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat">
                    <span className="stat-num">8</span>
                    <span className="stat-label">Countries</span>
                </div>
            </div>
        </section>
    );
}
