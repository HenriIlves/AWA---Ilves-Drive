import { Container, Box, Typography, Button, Fab, useMediaQuery, useTheme, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import DocumentList from './DocumentList'
import { useTranslation } from 'react-i18next'

const HomePage = () => {
    const navigate = useNavigate()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const { t } = useTranslation()

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {t('documents')}
                    </Typography>
                </Box>

                {!isMobile && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/document/new')} sx={{ textTransform: 'none', fontWeight: 600, px: 3, flexShrink: 0 }}>
                        {t('newDocument')}
                    </Button>
                )}
            </Box>

            <DocumentList />

            {isMobile && (
                <Tooltip title={t('newDocument')}>
                    <Fab color="primary" onClick={() => navigate('/document/new')} sx={{ position: 'fixed', bottom: 24, right: 24 }}>
                        <AddIcon />
                    </Fab>
                </Tooltip>
            )}
        </Container>
    )
}

export default HomePage
