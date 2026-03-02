/* import { IconButton, Menu, MenuItem, Avatar, Divider, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions,
        Button, Box, Typography, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { ExitToApp, Brightness4, Brightness7, PhotoCamera, Delete } from '@mui/icons-material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface HeaderMenuProps {
    username: string
    profilePicture: string
    theme: 'light' | 'dark'
    onThemeChange: () => void
    onLogout: () => void
    onProfilePictureUpdate: (url: string) => void
}

const HeaderMenu = ({ username, profilePicture, theme, onThemeChange, onLogout, onProfilePictureUpdate }: HeaderMenuProps) => {
    const { t, i18n } = useTranslation()
    const currentLanguage = i18n.language

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const open = Boolean(anchorEl)

    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleUploadProfilePicture = async () => {
        if (!selectedFile) return

        setUploading(true)
        try {
            const token = localStorage.getItem('token')
            const formData = new FormData()
            formData.append('profilePicture', selectedFile)

            const res = await fetch(`http://localhost:3000/api/user/profile-picture`, {
                method: 'POST',
                headers: { 
                    Authorization: `Bearer ${token}` 
                },
                body: formData
            })

            const data = await res.json()

            if (data.success) {
                onProfilePictureUpdate(`http://localhost:3000${data.profilePicture}`)
                setUploadDialogOpen(false)
                setSelectedFile(null)
            }
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteProfilePicture = async () => {
        const token = localStorage.getItem('token')

        await fetch(`http://localhost:3000/api/user/profile-picture`, {
            method: 'DELETE',
            headers: { 
                Authorization: `Bearer ${token}` 
            }
        })

        onProfilePictureUpdate('')
        handleMenuClose()
    }

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

    return (
        <>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                <Avatar src={profilePicture} sx={{ width: 40, height: 40 }}>
                    {username.charAt(0).toUpperCase()}
                </Avatar>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            >
                <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={profilePicture} />
                    <Typography fontWeight={600}>{username}</Typography>
                </Box>

                <Divider />

                <MenuItem onClick={() => setUploadDialogOpen(true)}>
                    <ListItemIcon><PhotoCamera /></ListItemIcon>
                    <ListItemText>{t('Change Picture')}</ListItemText>
                </MenuItem>

                {profilePicture && (
                    <MenuItem onClick={handleDeleteProfilePicture}>
                        <ListItemIcon><Delete /></ListItemIcon>
                        <ListItemText>{t('Remove Picture')}</ListItemText>
                    </MenuItem>
                )}

                <Divider />

                <Box sx={{ px: 2, py: 1 }}>
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

                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                        {t('Language')}
                    </Typography>
                    <ToggleButtonGroup fullWidth exclusive value={currentLanguage} onChange={handleLanguageChange} size="small">
                        <ToggleButton value="en">EN</ToggleButton>
                        <ToggleButton value="fi">FI</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Divider />

                <MenuItem onClick={onLogout}>
                    <ListItemIcon><ExitToApp /></ListItemIcon>
                    <ListItemText>{t('Logout')}</ListItemText>
                </MenuItem>
            </Menu>

            <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
                <DialogTitle>{t('Change Profile Picture')}</DialogTitle>
                <DialogContent>
                    <Button component="label" startIcon={<PhotoCamera />}>
                        {selectedFile?.name ?? t('Select Image')}
                        <input hidden type="file" accept="image/*" onChange={handleFileSelect} />
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUploadDialogOpen(false)}>
                        {t('Cancel')}
                    </Button>
                    <Button variant="contained" disabled={!selectedFile || uploading} onClick={handleUploadProfilePicture}>
                        {uploading ? <CircularProgress size={20} /> : t('Upload')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default HeaderMenu */

import { IconButton, Menu, MenuItem, Avatar, Divider, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions,
        Button, Box, Typography, CircularProgress } from '@mui/material'
import { ExitToApp, PhotoCamera, Delete } from '@mui/icons-material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SettingsControls from './SettingsControls'

interface HeaderMenuProps {
    username: string
    profilePicture: string
    theme: 'light' | 'dark'
    onThemeChange: () => void
    onLogout: () => void
    onProfilePictureUpdate: (url: string) => void
}

const HeaderMenu = ({ username, profilePicture, theme, onThemeChange, onLogout, onProfilePictureUpdate }: HeaderMenuProps) => {
    const { t } = useTranslation()

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const open = Boolean(anchorEl)

    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleUploadProfilePicture = async () => {
        if (!selectedFile) return

        setUploading(true)
        try {
            const token = localStorage.getItem('token')
            const formData = new FormData()
            formData.append('profilePicture', selectedFile)

            const res = await fetch(`http://localhost:3000/api/user/profile-picture`, {
                method: 'POST',
                headers: { 
                    Authorization: `Bearer ${token}` 
                },
                body: formData
            })

            const data = await res.json()

            if (data.success) {
                onProfilePictureUpdate(`http://localhost:3000${data.profilePicture}`)
                setUploadDialogOpen(false)
                setSelectedFile(null)
            }
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteProfilePicture = async () => {
        const token = localStorage.getItem('token')

        await fetch(`http://localhost:3000/api/user/profile-picture`, {
            method: 'DELETE',
            headers: { 
                Authorization: `Bearer ${token}` 
            }
        })

        onProfilePictureUpdate('')
        handleMenuClose()
    }

    return (
        <>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                <Avatar src={profilePicture} sx={{ width: 40, height: 40 }}>
                    {username.charAt(0).toUpperCase()}
                </Avatar>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            >
                {/* Profile */}
                <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={profilePicture} />
                    <Typography fontWeight={600}>{username}</Typography>
                </Box>

                <Divider />

                <MenuItem onClick={() => setUploadDialogOpen(true)}>
                    <ListItemIcon><PhotoCamera /></ListItemIcon>
                    <ListItemText>{t('Change Picture')}</ListItemText>
                </MenuItem>

                {profilePicture && (
                    <MenuItem onClick={handleDeleteProfilePicture}>
                        <ListItemIcon><Delete /></ListItemIcon>
                        <ListItemText>{t('Remove Picture')}</ListItemText>
                    </MenuItem>
                )}

                <Divider />

                {/* Settings Controls */}
                <SettingsControls theme={theme} onThemeChange={onThemeChange} variant="menu" />

                <Divider />

                <MenuItem onClick={onLogout}>
                    <ListItemIcon><ExitToApp /></ListItemIcon>
                    <ListItemText>{t('Logout')}</ListItemText>
                </MenuItem>
            </Menu>

            {/* Upload dialog */}
            <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
                <DialogTitle>{t('Change Profile Picture')}</DialogTitle>
                <DialogContent>
                    <Button component="label" startIcon={<PhotoCamera />}>
                        {selectedFile?.name ?? t('Select Image')}
                        <input hidden type="file" accept="image/*" onChange={handleFileSelect} />
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUploadDialogOpen(false)}>
                        {t('Cancel')}
                    </Button>
                    <Button variant="contained" disabled={!selectedFile || uploading} onClick={handleUploadProfilePicture}>
                        {uploading ? <CircularProgress size={20} /> : t('Upload')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default HeaderMenu