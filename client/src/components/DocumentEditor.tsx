import React from 'react'
import { Box, TextField, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import A4Paper from './A4Paper'

interface DocumentEditorProps {
    title: string
    content: string
    onTitleChange: (title: string) => void
    onContentChange: (content: string) => void
    disabled?: boolean
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({
    title,
    content,
    onTitleChange,
    onContentChange,
    disabled = false,
}) => {
    const theme = useTheme()
    const { t } = useTranslation()

    return (
        <A4Paper>
            <Box sx={{ mb: 4 }}>
                <TextField
                    placeholder={t('untitledDocument')}
                    variant="standard"
                    fullWidth
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    disabled={disabled}
                    autoFocus
                    InputProps={{
                        disableUnderline: false,
                        style: {
                            fontFamily: '"Times New Roman", Times, serif',
                            fontSize: '24pt',
                            fontWeight: 600,
                            color: '#202124',
                        },
                    }}
                    sx={{
                        '& .MuiInput-root': {
                            '&:before': {
                                borderBottom: '2px solid #dadce0',
                            },
                            '&:hover:not(.Mui-disabled):before': {
                                borderBottom: '2px solid #202124',
                            },
                            '&:after': {
                                borderBottom: `2px solid ${theme.palette.primary.main}`,
                            },
                        },
                    }}
                />
            </Box>

            <TextField
                placeholder={t('startTyping')}
                fullWidth
                multiline
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                disabled={disabled}
                variant="standard"
                InputProps={{
                    disableUnderline: true,
                    style: {
                        fontFamily: '"Times New Roman", Times, serif',
                        fontSize: '12pt',
                        lineHeight: 1.8,
                        color: '#202124',
                    },
                }}
                sx={{
                    '& .MuiInputBase-root': {
                        alignItems: 'flex-start',
                    },
                    '& textarea': {
                        minHeight: '180mm !important',
                        overflow: 'auto !important',
                    },
                }}
            />
        </A4Paper>
    )
}

export default DocumentEditor