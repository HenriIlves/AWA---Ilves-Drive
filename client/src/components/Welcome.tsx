import { Container, Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const Welcome = () => {
    const { t } = useTranslation()
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                    {t('welcomeTitle')}
                </Typography>
                <Typography color="text.secondary">
                    {t('welcomeSubtitle')}
                </Typography>
            </Box>
        </Container>
    )
}

export default Welcome