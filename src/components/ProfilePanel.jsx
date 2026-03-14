export default function ProfilePanel({ member, isOpen, onClose, onEdit, onDelete }) {
    if (!isOpen || !member) return null;

    return (
        <div className="profile-overlay open" id="profileOverlay" onClick={onClose}>
            <div className="profile-panel" id="profilePanel" onClick={(e) => e.stopPropagation()}>
                <button className="panel-close" id="panelClose" onClick={onClose}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M1 1l14 14M15 1L1 15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
                <div className="panel-inner">
                    <div className="panel-photo-wrap">
                        <img
                            className="panel-photo"
                            id="panelPhoto"
                            src={member.photo}
                            alt={member.name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    member.name
                                )}&background=22262d&color=c8a96e&size=256`;
                            }}
                        />
                        <div className="panel-photo-ring"></div>
                    </div>
                    <div className="panel-content">
                        <div className="panel-role" id="panelRole">
                            {member.role}
                        </div>
                        <h2 className="panel-name" id="panelName">
                            {member.name}
                        </h2>
                        <p className="panel-bio" id="panelBio">
                            {member.bio}
                        </p>
                        <blockquote className="panel-quote" id="panelQuote">
                            "{member.funFact}"
                        </blockquote>
                        <div className="panel-links">
                            <a
                                className="panel-link"
                                id="panelLinkedIn"
                                href={member.linkedInUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                LinkedIn
                            </a>
                            <a
                                className="panel-link"
                                id="panelTwitter"
                                href={member.xUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.84L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                X / Twitter
                            </a>
                        </div>
                        <div className="panel-links">
                            <button
                                className="panel-link"
                                style={{ color: '#c8a96e', borderColor: 'rgba(200,169,110,0.5)' }}
                                onClick={() => onEdit(member)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Edit
                            </button>
                            <button
                                className="panel-link"
                                style={{ color: '#e57373', borderColor: 'rgba(229,115,115,0.5)' }}
                                onClick={() => onDelete(member.id)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
                <div className="panel-readout">
                    <span>
                        MODULE ID: <span id="panelId">{member.id}</span>
                    </span>
                    <span>
                        STATUS: <span className="readout-green">INSPECTED</span>
                    </span>
                    <span>CLEARANCE: FULL</span>
                </div>
            </div>
        </div>
    );
}
