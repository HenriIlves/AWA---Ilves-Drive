import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Box, CircularProgress, Alert, Container, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import DocumentToolbar from './DocumentToolbar'
import A4Paper from './A4Paper'

interface Document {
    _id: string
    title: string
    content: string
    isPublicReadOnly: boolean
    currentEditorUsername?: string
    ownerId: string
    permissions: { userId: string; username: string; type: 'view' | 'edit' }[]
}

// Decodes the JWT payload from localStorage to get the current user's ID without an API call
const getCurrentUserId = (): string | null => {
    const token = localStorage.getItem('token')
    if (!token) return null
    try {
        return JSON.parse(atob(token.split('.')[1])).id
    } catch {
        return null
    }
}

const DocumentView = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { documentId } = useParams<{ documentId: string }>()
    const theme = useTheme()
    const { t } = useTranslation()

    const [document, setDocument] = useState<Document | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lockWarning, setLockWarning] = useState<string | null>(null)
    const token = localStorage.getItem('token')  || ''

    useEffect(() => {
        // Try to use document from location state first, otherwise fetch it
        if (location.state?.document) {
            setDocument(location.state.document)
            setLoading(false)
        } else if (documentId) {
            fetchDocument()
        }
    }, [documentId, location.state])

    const fetchDocument = async () => {
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
        } catch (err) {
            setError(err instanceof Error ? err.message : t('somethingWentWrong'))
        } finally {
            setLoading(false)
        }
    }

    // Check the edit lock before navigating — stays on view page if another user holds it
    const handleEdit = async () => {
        if (!documentId) return
        setLockWarning(null)
        try {
            const response = await fetch(`http://localhost:3000/api/document/${documentId}/lock`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            })
            if (response.status === 423) {
                const data = await response.json()
                setLockWarning(data.currentEditorUsername)
                return
            }
        } catch {
            // Network error: proceed anyway (fail-open)
        }
        navigate(`/document/${documentId}/edit`, { state: { document } })
    }

    const handleBack = () => {
        navigate('/dashboard')
    }

    const userId = getCurrentUserId()
    // Only show the edit button for the owner and users with explicit edit permission
    const canEdit = document
        ? document.ownerId === userId || document.permissions.some(p => p.userId === userId && p.type === 'edit')
        : false

    const handlePublicLinkToggle = async () => {
        if (!document || !documentId) return
        const method = document.isPublicReadOnly ? 'DELETE' : 'POST'
        const response = await fetch(`http://localhost:3000/api/document/${documentId}/public-link`, {
            method,
            headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
            setDocument({ ...document, isPublicReadOnly: !document.isPublicReadOnly })
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (error || !document) {
        return (
            <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
                <DocumentToolbar
                    title=""
                    onBack={handleBack}
                    mode="view"
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
                title={document.title}
                onBack={handleBack}
                mode="view"
                onEdit={handleEdit}
                documentId={documentId}
                isPublicReadOnly={document.isPublicReadOnly}
                onPublicLinkToggle={handlePublicLinkToggle}
                canEdit={canEdit}
            />

            <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
                {lockWarning && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {t('lockedByUser', { username: lockWarning })}
                    </Alert>
                )}
                {!lockWarning && document.currentEditorUsername && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {t('beingEditedBy', { username: document.currentEditorUsername })}
                    </Alert>
                )}
                <A4Paper isEmpty={!document.content}>
                    {document.content && (
                        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {document.content}
                        </div>
                    )}
                </A4Paper>
            </Container>
        </Box>
    )
}

export default DocumentView
