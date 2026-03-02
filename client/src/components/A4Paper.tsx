import { Box, Paper, Typography, useTheme } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface A4PaperProps {
    children: React.ReactNode
    isEmpty?: boolean
}

const A4Paper: React.FC<A4PaperProps> = ({ children, isEmpty = false }) => {
    const theme = useTheme()
    const { t } = useTranslation()

    return (
        <Paper
            elevation={3}
            sx={{
                backgroundColor: '#ffffff', // Always white
                minHeight: '297mm', // Always maintain full A4 page height
                width: '100%',
                maxWidth: '210mm', // A4 width
                mx: 'auto',
                py: '25mm',                                  // Always 25mm top/bottom
                px: { xs: '12px', sm: '16px', md: '20mm' }, // Scaled left/right per screen size
                boxShadow: theme.palette.mode === 'dark'
                    ? '0 0 20px rgba(0,0,0,0.5)'
                    : '0 0 10px rgba(0,0,0,0.1)'
            }}
        >
            <Box
                sx={{
                    fontFamily: '"Times New Roman", Times, serif',
                    fontSize: '12pt',
                    lineHeight: 1.8,
                    color: '#202124', // Always dark text 
                    minHeight: '247mm', // Always maintain full A4 content area height
                }}
            >
                {isEmpty ? (
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            fontStyle: 'italic',
                            textAlign: 'center',
                            py: 8,
                            color: '#5f6368',
                        }}
                    >
                        {t('emptyDocument')}
                    </Typography>
                ) : (
                    children
                )}
            </Box>
        </Paper>
    )
}

export default A4Paper