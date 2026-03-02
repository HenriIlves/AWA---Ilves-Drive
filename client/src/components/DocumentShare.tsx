import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, IconButton, InputAdornment, InputLabel, MenuItem, Select, Switch, TextField, Tooltip, Typography } from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

interface DocumentShareProps {
    documentId?: string
    isPublicReadOnly?: boolean
    onPublicLinkToggle?: () => void
}

const DocumentShare: React.FC<DocumentShareProps> = ({
    documentId,
    isPublicReadOnly = false,
    onPublicLinkToggle,
}) => {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [username, setUsername] = useState('')
    const [permissionType, setPermissionType] = useState<'view' | 'edit'>('view')
    const [shareError, setShareError] = useState<string | null>(null)
    const [shareSuccess, setShareSuccess] = useState<string | null>(null)
    const [sharing, setSharing] = useState(false)
    const [linkCopied, setLinkCopied] = useState(false)

    const handleOpen = () => {
        setOpen(true)
        setShareError(null)
        setShareSuccess(null)
        setUsername('')
        setPermissionType('view')
    }

    const handleClose = () => {
        setOpen(false)
        setShareError(null)
        setShareSuccess(null)
        setUsername('')
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/public/${documentId}`)
            .then(() => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000) })
    }

    const handleSubmit = async () => {
        if (!username.trim()) {
            setShareError(t('usernameRequired'))
            return
        }

        setSharing(true)
        setShareError(null)
        setShareSuccess(null)

        try {
            const token = localStorage.getItem('token') || ''
            const response = await fetch(`http://localhost:3000/api/document/${documentId}/permissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username: username.trim(),
                    permissionType,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || t('shareError'))
            }

            setShareSuccess(t('shareSuccess', { username: username.trim() }))
            setUsername('')

            setTimeout(() => {
                handleClose()
            }, 2000)
        } catch (error: unknown) {
            setShareError(error instanceof Error ? error.message : t('shareError'))
        } finally {
            setSharing(false)
        }
    }

    return (
        <>
            <Tooltip title={t('share')}>
                <IconButton onClick={handleOpen}>
                    <ShareIcon />
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{t('shareDocument')}</DialogTitle>
                <DialogContent>
                    {shareSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {shareSuccess}
                        </Alert>
                    )}

                    {shareError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {shareError}
                        </Alert>
                    )}

                    <TextField
                        autoFocus
                        margin="dense"
                        label={t('username')}
                        type="text"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={sharing}
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth>
                        <InputLabel>{t('permission')}</InputLabel>
                        <Select
                            value={permissionType}
                            label={t('permission')}
                            onChange={(e) => setPermissionType(e.target.value as 'view' | 'edit')}
                            disabled={sharing}
                        >
                            <MenuItem value="view">{t('canView')}</MenuItem>
                            <MenuItem value="edit">{t('canEdit')}</MenuItem>
                        </Select>
                    </FormControl>

                    <Divider sx={{ my: 3 }} />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={isPublicReadOnly}
                                onChange={onPublicLinkToggle}
                            />
                        }
                        label={t('anyoneWithLink')}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
                        {t('publicLinkDescription')}
                    </Typography>

                    {isPublicReadOnly && (
                        <TextField
                            fullWidth
                            value={`${window.location.origin}/public/${documentId}`}
                            InputProps={{
                                readOnly: true,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title={linkCopied ? t('copied') : t('copyLink')}>
                                            <IconButton onClick={handleCopyLink} edge="end">
                                                <ContentCopyIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={sharing}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={sharing}>
                        {sharing ? t('sharing') : t('shareButton')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default DocumentShare
