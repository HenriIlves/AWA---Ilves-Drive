import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Alert, Container, Paper, IconButton, Tooltip, Typography, useTheme } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DescriptionIcon from '@mui/icons-material/Description'
import { useTranslation } from 'react-i18next'
import A4Paper from './A4Paper'

interface PublicDocument {
    _id: string
    title: string
    content: string
    ownerUsername: string
    lastEditedAt: string
}

const PublicDocumentView = () => {
    const { documentId } = useParams<{ documentId: string }>()
    const navigate = useNavigate()
    const theme = useTheme()
    const { t } = useTranslation()

    const [document, setDocument] = useState<PublicDocument | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!documentId) return
        fetch(`http://localhost:3000/api/public/${documentId}`)
            .then(async (res) => {
                if (!res.ok) throw new Error(t('notFound'))
                return res.json()
            })
            .then((data) => setDocument(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [documentId])

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
            {/* Public toolbar */}
            <Paper
                elevation={0}
                sx={{
                    backgroundColor: theme.palette.background.paper,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <Tooltip title={t('backToHome')}>
                            <IconButton onClick={() => navigate('/')} sx={{ color: theme.palette.text.primary, flexShrink: 0 }}>
                                <ArrowBackIcon />
                            </IconButton>
                        </Tooltip>
                        <DescriptionIcon sx={{ color: theme.palette.primary.main, fontSize: 28, ml: 1, flexShrink: 0, display: { xs: 'none', sm: 'block' } }} />
                        <Typography
                            variant="body1"
                            sx={{
                                color: theme.palette.text.primary,
                                fontWeight: 500,
                                maxWidth: { xs: 130, sm: 220, md: 300 },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {document?.title || t('untitledDocument')}
                        </Typography>
                    </Box>
                </Container>
            </Paper>

            <Container maxWidth="md" sx={{ py: 4 }}>
                {error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <A4Paper isEmpty={!document?.content}>
                        {document?.content && (
                            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {document.content}
                            </div>
                        )}
                    </A4Paper>
                )}
            </Container>
        </Box>
    )
}

export default PublicDocumentView
