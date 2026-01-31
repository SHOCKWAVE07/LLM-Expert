import { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { Upload, X, AlertCircle } from 'lucide-react';
import './index.css';

// Styles for components defined here for simplicity in a single-file component approach for now
// Ideally, these would be separate files or use Tailwind
const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'row',
    },
    sidebar: {
        width: '320px',
        backgroundColor: 'var(--secondary-bg-color)',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        borderRight: '1px solid var(--border-color)',
    },
    main: {
        flex: 1,
        padding: '3rem 4rem',
        overflowY: 'auto',
    },
    header: {
        marginBottom: '2.5rem',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '700',
        marginBottom: '0.5rem',
    },
    description: {
        color: 'var(--secondary-text-color)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    card: {
        backgroundColor: 'var(--bg-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
    },
    dropZone: {
        border: '1px dashed var(--border-color)',
        borderRadius: '6px',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
    },
    dropZoneHover: {
        borderColor: 'var(--accent-color)',
    },
    previewImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    removeBtn: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        background: 'rgba(0,0,0,0.6)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        padding: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputGroup: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: '600',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: 'var(--bg-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        color: 'var(--text-color)',
        fontSize: '1rem',
    },
    select: {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: 'var(--bg-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        color: 'var(--text-color)',
        fontSize: '1rem',
    },
    button: {
        backgroundColor: 'var(--accent-color)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        opacity: 1,
        transition: 'opacity 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
    },
    results: {
        marginTop: '3rem',
        backgroundColor: 'var(--secondary-bg-color)',
        padding: '2rem',
        borderRadius: '8px',
    },
};

function App() {
    const [apiKey, setApiKey] = useState('');
    const [modelName, setModelName] = useState('gemini-2.5-flash');
    const [files, setFiles] = useState({ ref: null, a: null, b: null });
    const [previews, setPreviews] = useState({ ref: null, a: null, b: null });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (key, event) => {
        const file = event.target.files[0];
        if (file) {
            setFiles((prev) => ({ ...prev, [key]: file }));

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews((prev) => ({ ...prev, [key]: e.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeFile = (key, e) => {
        e.stopPropagation(); // prevent triggering click on parent
        setFiles((prev) => ({ ...prev, [key]: null }));
        setPreviews((prev) => ({ ...prev, [key]: null }));
        // Reset file input value if needed (not easily doable without ref, but ok for now)
    };

    const fileToGenerativePart = async (file) => {
        const base64EncodedDataPromise = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: {
                data: await base64EncodedDataPromise,
                mimeType: file.type,
            },
        };
    };

    const runAnalysis = async () => {
        setError('');
        setResult('');

        if (!apiKey) {
            setError('Please enter your Gemini API Key in the sidebar.');
            return;
        }
        if (!files.ref || !files.a || !files.b) {
            setError('Please upload all three images (Reference, Image A, Image B).');
            return;
        }

        setLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `
        You are a Senior Radiologist and Medical Imaging Forensic Expert. 
        You are given three images:
        1. REFERENCE: A known real medical image.
        2. IMAGE A: A test image.
        3. IMAGE B: A test image.

        One of the test images (A or B) is a REAL medical scan, and the other is an AI-GENERATED (synthetic) version designed to look like the Reference.

        TASK:
        - Compare Image A and B against the Reference.
        - Identify which one is REAL and which one is GENERATED.
        - Provide a detailed 'Verdict' clearly stating: "Image [X] is Real, Image [Y] is Generated."
        - Provide 'Expert Reasoning' focusing on:
            a) Pixel-level artifacts (e.g., GAN checkerboarding, smoothing).
            b) Anatomical accuracy (e.g., vessel branching logic, tissue density consistency).
            c) Sensor noise (Real images have natural stochastic noise; AI often has artificial or 'too clean' noise).
      `;

            const parts = [
                prompt,
                await fileToGenerativePart(files.ref),
                await fileToGenerativePart(files.a),
                await fileToGenerativePart(files.b),
            ];

            const result = await model.generateContent(parts);
            const response = await result.response;
            setResult(response.text());
        } catch (err) {
            console.error(err);
            setError(`Analysis Failed: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container} className="app-container">
            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={styles.header}>
                    <h2>Authentication</h2>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label} htmlFor="api-key">Gemini API Key</label>
                    <input
                        id="api-key"
                        type="password"
                        style={styles.input}
                        placeholder="Enter key..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                    <p style={{ ...styles.description, fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        Your key is used locally and not stored.
                    </p>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label} htmlFor="model">Model</label>
                    <select
                        id="model"
                        style={styles.select}
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                    >
                        <option value="gemini-2.5-flash">gemini-2.5-flash (Fast)</option>
                        <option value="gemini-2.5-pro">gemini-2.5-pro (Accurate)</option>
                    </select>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text-color)' }}>
                        Developed for Anti-Gravity
                    </p>
                </div>
            </aside>

            {/* Main Content */}
            <main style={styles.main}>
                <header style={styles.header}>
                    <h1 style={styles.title}>🩻 LLM: Forensic Expert</h1>
                    <p style={styles.description}>Medical Image Authenticity Verifier using Gemini Vision</p>
                </header>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(255, 75, 75, 0.1)',
                        border: '1px solid var(--accent-color)',
                        padding: '1rem',
                        borderRadius: '6px',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <AlertCircle size={20} color="var(--accent-color)" />
                        <span style={{ color: 'var(--accent-color)' }}>{error}</span>
                    </div>
                )}

                {/* Upload Grid */}
                <div style={styles.grid}>
                    {[
                        { id: 'ref', label: '1. Reference (Real)' },
                        { id: 'a', label: '2. Image A' },
                        { id: 'b', label: '3. Image B' },
                    ].map((item) => (
                        <div key={item.id} style={styles.card}>
                            <h3 style={{ marginBottom: '0.8rem', fontSize: '1.1rem' }}>{item.label}</h3>
                            <div
                                style={styles.dropZone}
                                onClick={() => document.getElementById(`file-${item.id}`).click()}
                            >
                                {previews[item.id] ? (
                                    <>
                                        <img src={previews[item.id]} alt="Preview" style={styles.previewImg} />
                                        <button
                                            style={styles.removeBtn}
                                            onClick={(e) => removeFile(item.id, e)}
                                            title="Remove image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                                        <Upload size={24} color="var(--secondary-text-color)" style={{ marginBottom: '0.5rem' }} />
                                        <span style={{ display: 'block', color: 'var(--secondary-text-color)', fontSize: '0.9rem' }}>Click to Upload</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id={`file-${item.id}`}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleFileChange(item.id, e)}
                                    onClick={(e) => e.target.value = null} // allow re-uploading same file
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={runAnalysis}
                        style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Analyzing...' : '🔍 Run Forensic Analysis'}
                    </button>
                    {loading && <span style={{ color: 'var(--secondary-text-color)' }}>Processing visual artifacts...</span>}
                </div>

                {/* Results */}
                {result && (
                    <div style={styles.results}>
                        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>📋 Forensic Report</h2>
                        <div className="markdown-body">
                            <ReactMarkdown>{result}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
