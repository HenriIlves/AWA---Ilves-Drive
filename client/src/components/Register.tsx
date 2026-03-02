import { useState } from 'react'
import { Container, Box, TextField, Button, Typography, Alert, Paper, CircularProgress } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface FormData {
    email: string
    username: string
    password: string
}

interface FormErrors {
    [key: string]: string
}

interface BackendError {
    path?: string
    param?: string
    msg: string
}

const Register = () => {
    const [formData, setFormData] = useState<FormData>({
        email: '',
        username: '',
        password: '',
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [loading, setLoading] = useState<boolean>(false)
    const { t } = useTranslation()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        setLoading(true)
        setErrors({})

        try {
            const response = await fetch('http://localhost:3000/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json();

            if (!response.ok) {
                if (data.errors && Array.isArray(data.errors)) {
                    const backendErrors: FormErrors = {}
                    data.errors.forEach((error: BackendError) => {
                        backendErrors[error.path || error.param || 'general'] = error.msg
                    })
                    setErrors(backendErrors)
                } if (data.email) {
                    setErrors({ email: data.email })
                } else {
                    setErrors({ general: data.error || 'Registration failed' })
                }
                return;
            }

            window.location.href = '/login'

        } catch (error) {
            setErrors({ general: 'Network error. Please try again.' })
            
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ marginTop: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography component="h1" variant="h4" align="center" sx={{ mb: 3 }}>
                        {t('Sign Up')}
                    </Typography>

                    {errors.general && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errors.general}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label={t('Email')}
                            name="email"
                            type="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.email}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            disabled={loading}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label={t('Username')}
                            name="username"
                            autoComplete="username"
                            value={formData.username}
                            onChange={handleChange}
                            error={!!errors.username}
                            helperText={errors.username}
                            disabled={loading}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label={t('Password')}
                            type="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                            error={!!errors.password}
                            helperText={errors.password}
                            disabled={loading}
                        />

                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : t('Sign Up')}
                        </Button>

                        <Typography variant="body2" align="center" color="text.secondary">
                           {t('account')}? <a href="/login">{t('Login')}</a>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;