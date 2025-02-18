import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
    const [url, setUrl] = useState('');
    const [seoResults, setSeoResults] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCrawl = async () => {
        if (!url) return;
        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:5000/crawl', { url });
            setSeoResults(response.data.seo_results);
            setSummary(response.data.summary);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };

    return (
        <div className="container">
            <h1 className="header">SEO Analyzer Chatbot</h1>
            <div className="input-section">
                <input
                    type="text"
                    className="url-input"
                    placeholder="https://www.example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <button className="crawl-button" onClick={handleCrawl} disabled={loading}>
                    {loading ? 'Analyzing...' : 'Crawl'}
                </button>
            </div>
            {summary && (
                <div className="summary">
                    <h2>Crawl Summary</h2>
                    <p><strong>Total Pages:</strong> {summary.total_pages}</p>
                    <p><strong>Missing Meta Descriptions:</strong> {summary.missing_meta_descriptions}</p>
                </div>
            )}
            {seoResults.length > 0 && (
                <div className="results">
                    <h2>SEO Analyzer Results</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>URL</th>
                                <th>Title</th>
                                <th>Meta Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {seoResults.map((result, index) => (
                                <tr key={index}>
                                    <td><a href={result.url} target="_blank" rel="noopener noreferrer">{result.url}</a></td>
                                    <td>{result.title}</td>
                                    <td>{result.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default App;
