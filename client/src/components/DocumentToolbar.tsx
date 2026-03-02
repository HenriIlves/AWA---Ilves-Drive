import { Box, Button, Container, Divider, IconButton, Paper, Tooltip, Typography, useTheme, useMediaQuery } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DescriptionIcon from '@mui/icons-material/Description'
import SaveIcon from '@mui/icons-material/Save'
import EditIcon from '@mui/icons-material/Edit'
import { useTranslation } from 'react-i18next'
import DocumentShare from './DocumentShare'

interface DocumentToolbarProps {
    title: string
    onBack: () => void
    mode: 'view' | 'edit' | 'create'
    onEdit?: () => void
    onSave?: () => void
    saving?: boolean
    documentId?: string
    isPublicReadOnly?: boolean
    onPublicLinkToggle?: () => void
    canEdit?: boolean
}

const DocumentToolbar: React.FC<DocumentToolbarProps> = ({
    title,
    onBack,
    mode,
    onEdit,
    onSave,
    saving = false,
    documentId,
    isPublicReadOnly = false,
    onPublicLinkToggle,
    canEdit = true,
}) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const { t } = useTranslation()

    return (
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
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                    gap: 2,
                }}>
                    {/* Left section */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <Tooltip title={t('backToDocuments')}>
                            <IconButton
                                onClick={onBack}
                                sx={{ color: theme.palette.text.primary, flexShrink: 0 }}
                            >
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
                            {title || t('untitledDocument')}
                        </Typography>
                    </Box>

                    {/* Right section - Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
                        {mode === 'view' && (
                            <>
                                <DocumentShare
                                    documentId={documentId}
                                    isPublicReadOnly={isPublicReadOnly}
                                    onPublicLinkToggle={onPublicLinkToggle}
                                />

                                {canEdit && (
                                    <>
                                        <Divider orientation="vertical" flexItem sx={{ mx: 1, backgroundColor: theme.palette.divider, display: { xs: 'none', sm: 'block' } }} />

                                        {isMobile ? (
                                            <Tooltip title={t('edit')}>
                                                <IconButton
                                                    onClick={onEdit}
                                                    sx={{ color: theme.palette.primary.main }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                startIcon={<EditIcon />}
                                                onClick={onEdit}
                                                sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
                                            >
                                                {t('edit')}
                                            </Button>
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        {(mode === 'edit' || mode === 'create') && (
                            isMobile ? (
                                <Tooltip title={saving ? t('saving') : mode === 'create' ? t('createDocument') : t('saveChanges')}>
                                    <span>
                                        <IconButton onClick={onSave} disabled={saving} sx={{ color: theme.palette.primary.main }}>
                                            <SaveIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            ) : (
                                <Button variant="contained" startIcon={<SaveIcon />} onClick={onSave} disabled={saving} sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}>
                                    {saving ? t('saving') : mode === 'create' ? t('createDocument') : t('saveChanges')}
                                </Button>
                            )
                        )}
                    </Box>
                </Box>
            </Container>
        </Paper>
    )
}

export default DocumentToolbar
