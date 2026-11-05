import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Edit, Trash2, Check, X } from 'lucide-react';

const smallButtonStyle = { padding: '6px 10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' };

const CommentItem = ({ comment, articleId, onChange }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const isAuthor = user && user.id === comment.user_id;
    const commentUrl = `/articles/${articleId}/comments/${comment.id}`;

    const startEditing = () => {
        setEditContent(comment.content);
        setError('');
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setError('');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const trimmedContent = editContent.trim();
        if (!trimmedContent) return;

        setSaving(true);
        setError('');

        try {
            await API.put(commentUrl, { content: trimmedContent });
            setIsEditing(false);
            await onChange();
        } catch (err) {
            console.error(err);
            setError('Impossible de modifier le commentaire.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce commentaire ?')) return;

        setSaving(true);
        setError('');

        try {
            await API.delete(commentUrl);
            await onChange();
        } catch (err) {
            console.error(err);
            setError('Impossible de supprimer le commentaire.');
            setSaving(false);
        }
    };

    return (
        <div className="glass" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {comment.avatar ? (
                        <img
                            src={`http://localhost:5000${comment.avatar}`}
                            alt={comment.username}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : <User size={20} />}
                    <div>
                        <Link to={`/profile/${comment.user_id}`} style={{ fontWeight: 'bold' }}>
                            {comment.username}
                        </Link>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Calendar size={12} /> {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {isAuthor && !isEditing && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={startEditing} disabled={saving} className="btn glass" style={{ ...smallButtonStyle, color: 'var(--text)' }}>
                            <Edit size={14} /> Modifier
                        </button>
                        <button onClick={handleDelete} disabled={saving} className="btn" style={{ ...smallButtonStyle, background: '#ef4444', color: 'white' }}>
                            <Trash2 size={14} /> Supprimer
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleUpdate}>
                    <textarea
                        rows="4"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        required
                        style={{ fontFamily: 'inherit', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button type="button" onClick={cancelEditing} disabled={saving} className="btn glass" style={{ ...smallButtonStyle, color: 'var(--text)' }}>
                            <X size={14} /> Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !editContent.trim()}
                            className="btn btn-primary"
                            style={{ ...smallButtonStyle, opacity: saving || !editContent.trim() ? 0.6 : 1 }}
                        >
                            <Check size={14} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            ) : (
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{comment.content}</p>
            )}

            {error && (
                <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '10px' }}>{error}</p>
            )}
        </div>
    );
};

export default CommentItem;
