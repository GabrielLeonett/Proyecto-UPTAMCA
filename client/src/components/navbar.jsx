import FacebookIcon from '@mui/icons-material/Facebook';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import LogoSimple from './ui/logoSimple';
import LogoTexto from './ui/logoTexto';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

function ResponsiveAppBar({ pages, backgroundColor }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const [anchorElNav, setAnchorElNav] = React.useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleRedirect = (url) => {
        window.location.href = url;
    };

    const handleNavigation = (url) => {
        navigate(url);
        handleCloseNavMenu();
    };

    return (
        <AppBar position="fixed" color={backgroundColor ? 'primary' : 'transparent'} enableColorOnDark>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* LogoTexto: Visible en pantallas grandes (md y arriba) */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', height: '100px' }}>
                        <LogoTexto />
                    </Box>

                    {/* LogoSimple: Visible en pantallas pequeñas y medianas (xs, sm) */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', height: '100px' }}>
                        <LogoSimple />
                    </Box>

                    {/* Menú para pantallas pequeñas */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, fontFamily: 'Poppins' }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            sx={{ color: theme.palette.primary.contrastText }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{ display: { xs: 'block', md: 'none' } }}
                        >
                            {pages.map((page) => (
                                page.submenu ? (
                                    <div key={page.name}>
                                        <Typography variant="subtitle1" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
                                            {page.name}
                                        </Typography>
                                        {page.submenu.map((subPage) => (
                                            <MenuItem
                                                key={subPage.name}
                                                onClick={() => handleNavigation(subPage.url)}
                                            >
                                                {subPage.name}
                                            </MenuItem>
                                        ))}
                                    </div>
                                ) : (
                                    <MenuItem
                                        key={page.name}
                                        onClick={() => handleNavigation(page.url)}
                                    >
                                        {page.name}
                                    </MenuItem>
                                )
                            ))}
                        </Menu>
                    </Box>

                    {/* Menú para pantallas grandes */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            page.submenu ? (
                                <Box key={page.name} sx={{ position: 'relative' }}>
                                    {/* Botón principal que activa el dropdown */}
                                    <Button
                                        onClick={(e) => {
                                            // Solo abre el menú si no estamos en un dispositivo táctil
                                            if (!('ontouchstart' in window)) {
                                                setAnchorElNav(e.currentTarget);
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            // Para dispositivos no táctiles, abre el menú al hacer hover
                                            if (!('ontouchstart' in window)) {
                                                setAnchorElNav(e.currentTarget);
                                            }
                                        }}
                                        sx={{
                                            my: 2,
                                            color: theme.palette.primary.contrastText,
                                            display: 'block',
                                            '&:hover': {
                                                backgroundColor: theme.palette.primary.dark
                                            }
                                        }}
                                    >
                                        {page.name}
                                    </Button>

                                    {/* Menú desplegable */}
                                    <Menu
                                        anchorEl={anchorElNav}
                                        open={Boolean(anchorElNav && anchorElNav.textContent === page.name)}
                                        onClose={handleCloseNavMenu}
                                        MenuListProps={{
                                            onMouseLeave: handleCloseNavMenu,
                                            sx: {
                                                py: 0,
                                                minWidth: 200,
                                                backgroundColor: theme.palette.primary.main
                                            }
                                        }}
                                        PaperProps={{
                                            elevation: 0,
                                            sx: {
                                                overflow: 'visible',
                                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                                mt: 1.5,
                                                '&:before': {
                                                    content: '""',
                                                    display: 'block',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 14,
                                                    width: 10,
                                                    height: 10,
                                                    bgcolor: 'background.paper',
                                                    transform: 'translateY(-50%) rotate(45deg)',
                                                    zIndex: 0
                                                }
                                            }
                                        }}
                                        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                                        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                                    >
                                        {page.submenu.map((subPage) => (
                                            <MenuItem
                                                key={subPage.name}
                                                onClick={() => {
                                                    handleNavigation(subPage.url);
                                                    handleCloseNavMenu();
                                                }}
                                                sx={{
                                                    color: theme.palette.primary.contrastText,
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.primary.dark
                                                    }
                                                }}
                                            >
                                                {subPage.name}
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </Box>
                            ) : (
                                <Button
                                    key={page.name}
                                    onClick={() => handleNavigation(page.url)}
                                    sx={{
                                        my: 2,
                                        color: theme.palette.primary.contrastText,
                                        display: 'block',
                                        '&:hover': {
                                            backgroundColor: theme.palette.primary.dark
                                        }
                                    }}
                                >
                                    {page.name}
                                </Button>
                            )
                        ))}
                    </Box>

                    {/* Iconos de Facebook y cuenta */}
                    <Box sx={{ flexGrow: 0 }}>
                        {/* Notificaciones */}
                        <IconButton sx={{ color: 'white' }}>
                            <Badge badgeContent={3} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <IconButton
                            onClick={() => handleRedirect('https://www.facebook.com')}
                            sx={{ color: theme.palette.primary.contrastText }}
                        >
                            <FacebookIcon sx={{ color: 'inherit' }} />
                        </IconButton>
                        <IconButton 
                        sx={{ color: 'white' }} 
                        onClick={() => handleRedirect('/Inicio-session')}
                        >
                            <AccountCircleOutlinedIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default ResponsiveAppBar;