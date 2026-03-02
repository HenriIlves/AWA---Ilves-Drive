import { createTheme, Theme } from '@mui/material/styles'

export const lightTheme: Theme = createTheme({
    palette: {
        mode: 'light',

        primary: {
            main: '#7C4E7E',
            contrastText: '#FFFFFF',
        },

        secondary: {
            main: '#6C586A',
            contrastText: '#FFFFFF',
        },

        background: {
            default: '#FFF7FA',
            paper: '#FFFFFF',
        },

        text: {
            primary: '#1F1A1F',
            secondary: '#4D444C',
        },

        error: {
            main: '#BA1A1A',
            contrastText: '#FFFFFF',
        },

        divider: '#D0C3CC',
    },
})

export const darkTheme: Theme = createTheme({
    palette: {
        mode: 'dark',

        primary: {
            main: '#EDB4EB',
            contrastText: '#49204D',
        },

        secondary: {
            main: '#D8BFD4',
            contrastText: '#3C2B3B',
        },

        background: {
            default: '#171216',
            paper: '#1F1A1F',
        },

        text: {
            primary: '#EBDFE6',
            secondary: '#D0C3CC',
        },

        error: {
            main: '#FFB4AB',
            contrastText: '#690005',
        },

        divider: '#4D444C',
    },
})

export const getTheme = (mode: 'light' | 'dark'): Theme =>
    mode === 'light' ? lightTheme : darkTheme