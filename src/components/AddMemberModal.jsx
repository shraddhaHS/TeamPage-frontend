import { useState, useEffect, useRef } from 'react';

export default function AddMemberModal({ isOpen, onClose, onAdd, initialData = null }) {
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        bio: '',
        photo: '', // This will hold either a file object or a URL string
        linkedin: '',
        twitter: '',
        quote: '',
    });
    const [previewUrl, setPreviewUrl] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || '',
                    role: initialData.role || '',
                    bio: initialData.bio || '',
                    photo: initialData.photo || '',
                    linkedin: initialData.linkedInUrl || '',
                    twitter: initialData.xUrl || '',
                    quote: initialData.funFact || '',
                });
                setPreviewUrl(initialData.photo || '');
            } else {
                setFormData({
                    name: '',
                    role: '',
                    bio: '',
                    photo: '',
                    linkedin: '',
                    twitter: '',
                    quote: '',
                });
                setPreviewUrl('');
            }
            setErrorMsg('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setErrorMsg('');

        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrorMsg('Only image files are allowed.');
                e.target.value = ''; // Reset input
                return;
            }

            setFormData((prev) => ({ ...prev, photo: file }));
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            // Clean up old object url
            return () => URL.revokeObjectURL(objectUrl);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Use FormData logic
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('role', formData.role);
        submitData.append('bio', formData.bio);
        submitData.append('funFact', formData.quote);
        submitData.append('linkedInUrl', formData.linkedin);
        submitData.append('xUrl', formData.twitter);

        if (formData.photo instanceof File) {
            submitData.append('photo', formData.photo);
        } 
        // else if (typeof formData.photo === 'string' && formData.photo !== '') {
        //     submitData.append('photo', formData.photo); // Send existing URL if unchanged
        // }
        onAdd(submitData, initialData?.id); // Pass ID if updating
    };

    return (
        <div className="modal-overlay open" id="modalOverlay" onClick={onClose}>
            <div className="modal" id="addModal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <div className="modal-label">SYSTEM · {initialData ? 'UPDATE MODULE' : 'NEW MODULE'}</div>
                        <h3 className="modal-title">{initialData ? 'Modify Module' : 'Register Team Member'}</h3>
                    </div>
                    <button className="modal-close" id="modalClose" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                                d="M1 1l14 14M15 1L1 15"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>
                <form className="modal-form" id="addForm" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="f-name">Full Name</label>
                            <input
                                type="text"
                                id="f-name"
                                name="name"
                                placeholder="Dr. Ada Lovelace"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="f-role">Role / Title</label>
                            <input
                                type="text"
                                id="f-role"
                                name="role"
                                placeholder="Lead Roboticist"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="f-bio">Bio</label>
                        <textarea
                            id="f-bio"
                            name="bio"
                            rows={3}
                            placeholder="A brief overview of background and expertise..."
                            value={formData.bio}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="f-photo">Profile Photo</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {previewUrl && (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '1px solid var(--border)',
                                    }}
                                />
                            )}
                            <input
                                type="file"
                                id="f-photo"
                                name="photo"
                                accept="image/*"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                style={{ flex: 1 }}
                            />
                        </div>
                        {errorMsg && <div style={{ color: '#e57373', fontSize: '11px', marginTop: '4px' }}>{errorMsg}</div>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="f-linkedin">LinkedIn URL</label>
                            <input
                                type="url"
                                id="f-linkedin"
                                name="linkedin"
                                placeholder="https://linkedin.com/in/..."
                                value={formData.linkedin}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="f-twitter">Twitter / X URL</label>
                            <input
                                type="url"
                                id="f-twitter"
                                name="twitter"
                                placeholder="https://x.com/..."
                                value={formData.twitter}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="f-quote">Personal Quote</label>
                        <input
                            type="text"
                            id="f-quote"
                            name="quote"
                            placeholder="&quot;Engineering is applied creativity.&quot;"
                            value={formData.quote}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-cancel"
                            id="modalCancel"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path
                                    d="M7 1v12M1 7h12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                            {initialData ? 'Update Member' : 'Deploy Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
