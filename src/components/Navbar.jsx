export default function Navbar({ onAddMember }) {
    return (
        <nav className="nav" id="nav">
            <div className="nav-logo">
                <img src="/Logo_white.png" alt="Armatrix Logo" />
            </div>
            <button className="btn-add" id="btnAddMember" onClick={onAddMember}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                        d="M7 1v12M1 7h12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
                Add Member
            </button>
        </nav>
    );
}
