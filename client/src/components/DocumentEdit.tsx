import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Box, CircularProgress, Alert, Container, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import DocumentToolbar from './DocumentToolbar'
import DocumentEditor from './DocumentEditor'

interface Document {
    _id: string
    title: string
    content: string
    createdAt?: string
    lastEditedAt?: string
    ownerId?: string
}

const DocumentEdit = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { documentId } = useParams<{ documentId: string }>()
    const theme = useTheme()
    const { t } = useTranslation()

    const [document, setDocument] = useState<Document | null>(null)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [lockChecking, setLockChecking] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [lockedBy, setLockedBy] = useState<string | null>(null)
    const [accessDenied, setAccessDenied] = useState(false)

    useEffect(() => {
        // Try to use document from location state first, otherwise fetch it
        if (location.state?.document) {
            const doc = location.state.document
            setDocument(doc)
            setTitle(doc.title)
            setContent(doc.content)
            setLoading(false)
        } else if (documentId) {
            fetchDocument()
        }
    }, [documentId, location.state])

    // Acquire the edit lock on mount; release it on unmount or tab close (keepalive fetch)
    useEffect(() => {
        if (!documentId) {
            setLockChecking(false)
            return
        }

        const releaseLock = () => {
            const token = localStorage.getItem('token') || ''
            fetch(`http://localhost:3000/api/document/${documentId}/lock`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
                keepalive: true,
            })
        }

        const acquireLock = async () => {
            const token = localStorage.getItem('token') || ''
            try {
                const response = await fetch(`http://localhost:3000/api/document/${documentId}/lock`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (response.status === 423) {
                    const data = await response.json()
                    setLockedBy(data.currentEditorUsername)
                } else if (response.status === 403) {
                    setAccessDenied(true)
                }
                // Other errors: fail-open, allow editing
            } catch {
                // Network error: fail-open
            } finally {
                setLockChecking(false)
            }
        }

        acquireLock()

        return () => {
            releaseLock()
        }
    }, [documentId])

    // Release lock on tab/window close
    useEffect(() => {
        if (!documentId) return

        const handleBeforeUnload = () => {
            const token = localStorage.getItem('token') || ''
            fetch(`http://localhost:3000/api/document/${documentId}/lock`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
                keepalive: true,
            })
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [documentId])

    const fetchDocument = async () => {
        const token = localStorage.getItem('token') || ''
        try {
            const response = await fetch(`http://localhost:3000/api/document/${documentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || t('fetchError'))
            }

            const data = await response.json()
            setDocument(data.document)
            setTitle(data.document.title)
            setContent(data.document.content)
        } catch (err) {
            setError(err instanceof Error ? err.message : t('somethingWentWrong'))
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            setError(t('titleContentRequired'))
            return
        }

        const token = localStorage.getItem('token') || ''
        setSaving(true)
        setError(null)

        try {
            const response = await fetch(`http://localhost:3000/api/document/${documentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, content }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || t('updateError'))
            }

            const data = await response.json()
            setDocument(data.document)

            // Navigate to view page after successful save
            navigate(`/document/${documentId}`, { state: { document: data.document } })
        } catch (err) {
            setError(err instanceof Error ? err.message : t('somethingWentWrong'))
        } finally {
            setSaving(false)
        }
    }

    const handleBack = () => {
        navigate(`/document/${documentId}`, { state: { document } })
    }

    if (loading || lockChecking) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (accessDenied) {
        return (
            <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
                <DocumentToolbar
                    title={document?.title || ''}
                    onBack={() => navigate(`/document/${documentId}`)}
                    mode="edit"
                />
                <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
                    <Alert severity="error">
                        {t('noEditPermission')}
                    </Alert>
                </Container>
            </Box>
        )
    }

    if (lockedBy) {
        return (
            <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
                <DocumentToolbar
                    title={document?.title || ''}
                    onBack={handleBack}
                    mode="edit"
                />
                <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
                    <Alert severity="warning">
                        {t('lockedByUser', { username: lockedBy })}
                    </Alert>
                </Container>
            </Box>
        )
    }

    if ((error && !document) || !document) {
        return (
            <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
                <DocumentToolbar
                    title=""
                    onBack={() => navigate('/dashboard')}
                    mode="edit"
                />
                <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
                    <Alert severity={error ? 'error' : 'info'}>
                        {error || t('notFound')}
                    </Alert>
                </Container>
            </Box>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
            <DocumentToolbar
                title={title}
                onBack={handleBack}
                mode="edit"
                onSave={handleSave}
                saving={saving}
            />

            {/* Messages */}
            {error && (
                <Container maxWidth="md" sx={{ pt: 2 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                </Container>
            )}

            {/* Document Editor */}
            <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
                <DocumentEditor
                    title={title}
                    content={content}
                    onTitleChange={setTitle}
                    onContentChange={setContent}
                    disabled={saving}
                />
            </Container>
        </Box>
    )
}

export default DocumentEdit
