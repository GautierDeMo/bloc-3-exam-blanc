import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Send } from 'lucide-react';
import CommentItem from './CommentItem';

const getComments = async (articleId) => {
    const { data } = await API.get(`/articles/${articleId}/comments`);
    return data;
};

const CommentSection = ({ articleId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadComments = async () => {
            try {
                setComments(await getComments(articleId));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadComments();
    }, [articleId]);

    const refreshComments = async () => {
        setComments(await getComments(articleId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedContent = content.trim();
        if (!trimmedContent) return;

        setSubmitting(true);
        setError('');

        try {
            await API.post(`/articles/${articleId}/comments`, { content: trimmedContent });
            setContent('');
            await refreshComments();
        } catch (err) {
            console.error(err);
            setError('Impossible de publier le commentaire.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section style={{ marginTop: '50px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <MessageCircle size={22} style={{ color: 'var(--primary)' }} />
                Commentaires ({comments.length})
            </h2>

            {user ? (
                <form onSubmit={handleSubmit} className="glass" style={{ padding: '20px', marginBottom: '30px' }}>
                    <textarea
                        placeholder="Écrivez votre commentaire..."
                        rows="4"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        style={{ fontFamily: 'inherit', resize: 'vertical' }}
                    />
                    {error && (
                        <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '15px' }}>{error}</p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting || !content.trim()}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: submitting || !content.trim() ? 0.6 : 1 }}
                        >
                            <Send size={16} /> {submitting ? 'Envoi...' : 'Commenter'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="glass" style={{ padding: '20px', marginBottom: '30px', color: 'var(--text-muted)' }}>
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Connectez-vous</Link>
                    {' '}pour laisser un commentaire.
                </div>
            )}

            {loading ? (
                <div>Chargement...</div>
            ) : comments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Aucun commentaire pour le moment. Soyez le premier !</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            articleId={articleId}
                            onChange={refreshComments}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default CommentSection;
