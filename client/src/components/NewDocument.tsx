import { useState } from 'react'
import { Container, Box, Alert, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DocumentEditor from './DocumentEditor'
import DocumentToolbar from './DocumentToolbar'

const NewDocument = () => {
    const navigate = useNavigate()
    const theme = useTheme()
    const { t } = useTranslation()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    const token = localStorage.getItem('token') || ''
    
    const createDocument = async () => {
        if (!title.trim() || !content.trim()) {
            setError(t('titleContentRequired'))
            return
        }
        
        setLoading(true)
        setError(null)
        
        try {
            const response = await fetch('http://localhost:3000/api/document', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, content }),
            })
            
            if (!response.ok) {
                throw new Error(t('createError'))
            }
            
            const data = await response.json()

            navigate(`/document/${data.document._id}`, { state: { document: data.document } })
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : t('errorOccurred'))
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () => {
        navigate('/dashboard')
    }
    
    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
            <DocumentToolbar
                title={title}
                onBack={handleBack}
                mode="create"
                onSave={createDocument}
                saving={loading}
            />

            {/* Error Message */}
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
                    disabled={loading}
                />
            </Container>
        </Box>
    )
}

export default NewDocument