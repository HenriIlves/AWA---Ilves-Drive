import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

interface SettingsControlsProps {
    theme: 'light' | 'dark'
    onThemeChange: () => void
    variant?: 'menu' | 'popover' // 'menu' for inside menu, 'popover' for standalone
}

const SettingsControls = ({ theme, onThemeChange, variant = 'menu' }: SettingsControlsProps) => {
    const { t, i18n } = useTranslation()
    const currentLanguage = i18n.language

    const handleThemeChange = (_: React.MouseEvent<HTMLElement>, value: 'light' | 'dark' | null) => {
        if (value && value !== theme) {
            onThemeChange()
        }
    }

    const handleLanguageChange = (_: React.MouseEvent<HTMLElement>, value: 'en' | 'fi' | null) => {
        if (value && value !== currentLanguage) {
            i18n.changeLanguage(value)
        }
    }

    const containerSx = variant === 'menu' 
        ? { px: 2, py: 1 }
        : { p: 2, minWidth: 200 }

    return (
        <>
            {/* Theme toggle */}
            <Box sx={containerSx}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}>
                    {t('Theme')}
                </Typography>
                <ToggleButtonGroup fullWidth exclusive value={theme} onChange={handleThemeChange} size="small">
                    <ToggleButton value="light">
                        <Brightness7 fontSize="small" sx={{ mr: 1 }} />
                        {t('Light')}
                    </ToggleButton>
                    <ToggleButton value="dark">
                        <Brightness4 fontSize="small" sx={{ mr: 1 }} />
                        {t('Dark')}
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Language toggle */}
            <Box sx={containerSx}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}>
                    {t('Language')}
                </Typography>
                <ToggleButtonGroup fullWidth exclusive value={currentLanguage} onChange={handleLanguageChange} size="small">
                    <ToggleButton value="en">EN</ToggleButton>
                    <ToggleButton value="fi">FI</ToggleButton>
                </ToggleButtonGroup>
            </Box>
        </>
    )
}

export default SettingsControls