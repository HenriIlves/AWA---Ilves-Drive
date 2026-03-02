import { AppBar, Toolbar, Button, Typography, Box, IconButton, Popover, Tooltip, useMediaQuery, useTheme as useMuiTheme } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { Login as LoginIcon, PersonAdd, Settings } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import HeaderMenu from './HeaderMenu'
import SettingsControls from './SettingsControls'

interface HeaderProps {
    theme: 'light' | 'dark'
    onThemeChange: () => void
}

const Header = ({ theme, onThemeChange }: HeaderProps) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const muiTheme = useMuiTheme()
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'))
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState('')
    const [profilePicture, setProfilePicture] = useState('')
    const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        setIsLoggedIn(!!token)
        if (token) fetchProfile()
    }, [])

    const fetchProfile = async () => {
        const token = localStorage.getItem('token')
        const res = await fetch(`http://localhost:3000/api/user/profile`, {
            headers: { 
                Authorization: `Bearer ${token}` 
            }
        })
        const data = await res.json()
        if (data.success) {
            setUsername(data.user.username)
            setProfilePicture(
                data.user.profilePicture ? `http://localhost:3000${data.user.profilePicture}` : ''
            )
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        setIsLoggedIn(false)
        navigate('/')
    }

    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Typography variant="h6" component={Link} to={isLoggedIn ? '/dashboard' : '/'} sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }} >
                    Ilves Drive
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {isLoggedIn ? ( /* When logged in */
                        <HeaderMenu
                            username={username}
                            profilePicture={profilePicture}
                            theme={theme}
                            onThemeChange={onThemeChange}
                            onLogout={handleLogout}
                            onProfilePictureUpdate={setProfilePicture}
                        />
                    ) : ( /* When logged out */
                        <>
                            <Tooltip title={t('Theme')}>
                                <IconButton color="inherit" onClick={(e) => setSettingsAnchor(e.currentTarget)} sx={{ mr: 1 }}>
                                    <Settings />
                                </IconButton>
                            </Tooltip>
                            {isMobile ? (
                                <>
                                    <Tooltip title={t('Login')}>
                                        <IconButton color="inherit" component={Link} to="/login">
                                            <LoginIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('Sign Up')}>
                                        <IconButton sx={{ bgcolor: 'background.paper', color: 'text.primary', '&:hover': { bgcolor: 'background.default' } }} component={Link} to="/register">
                                            <PersonAdd />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            ) : (
                                <>
                                    <Button variant="outlined" color="inherit" component={Link} to="/login" startIcon={<LoginIcon />}>
                                        {t('Login')}
                                    </Button>
                                    <Button variant="contained" sx={{ bgcolor: 'background.paper', color: 'text.primary', '&:hover': { bgcolor: 'background.default' } }} component={Link} to="/register" startIcon={<PersonAdd />}>
                                        {t('Sign Up')}
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </Box>

                {/* Settings Popover for non-logged-in users */}
                <Popover
                    open={Boolean(settingsAnchor)}
                    anchorEl={settingsAnchor}
                    onClose={() => setSettingsAnchor(null)}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                >
                    <SettingsControls theme={theme} onThemeChange={onThemeChange} variant="popover" />
                </Popover>
            </Toolbar>
        </AppBar>
    )
}

export default Header