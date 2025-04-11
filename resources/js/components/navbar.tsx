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

type PropsAppBar = {
    pages: string[];
    backgroundColor?: boolean;
    username?: string;
};

function ResponsiveAppBar({ pages, backgroundColor,username }: PropsAppBar) {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    // Función para redirigir a una URL
    const handleRedirect = (url: string) => {
        window.location.href = url;
    };

    return (
        <AppBar position="fixed" sx={{ backgroundColor: backgroundColor ? 'bg-primary' : 'transparent' }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* LogoTexto: Visible en pantallas grandes (md y arriba) */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', height: '100px' }}>
                        <LogoTexto Primary="bg-white" Secundary="bg-secundary" />
                    </Box>

                    {/* LogoSimple: Visible en pantallas pequeñas y medianas (xs, sm) */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', height: '100px' }}>
                        <LogoSimple Primary="bg-white" Secundary="bg-secundary" />
                    </Box>

                    {/* Menú para pantallas pequeñas */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, fontFamily: 'Poppins' }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            sx={{color:'white'}}

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
                            sx={{ display: { xs: 'block', md: 'none' } , backgroundColor: backgroundColor ? 'bg-primary' : 'transparent'  }}
                        >
                            {pages.map((page) => (
                                <MenuItem
                                    key={page}
                                    onClick={() => {
                                        handleRedirect(`/${page.toLowerCase()}`); // Redirige a la URL
                                        handleCloseNavMenu(); // Cierra el menú
                                    }}
                                    sx={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <Typography variant="body1">
                                        {page}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    {/* Menú para pantallas grandes */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page}
                                onClick={() => handleRedirect(`/${page.toLowerCase()}`)} // Redirige a la URL
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                {page}
                            </Button>
                        ))}
                    </Box>

                    {/* Icono de Facebook */}
                    <Box sx={{ flexGrow: 0 }}>
                        <IconButton
                            onClick={() => handleRedirect('https://www.facebook.com')} // Redirige a Facebook
                            sx={{ color: 'white' }} // Aplica color blanco al IconButton
                        >
                            <FacebookIcon sx={{ color: 'inherit' }} /> {/* Hereda el color del IconButton */}
                        </IconButton>
                        <IconButton 
                        sx={{ color: 'white' }} 
                        onClick={() => handleRedirect('/login')}
                        >
                            {username ? username : <AccountCircleOutlinedIcon/>}
                        </IconButton>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default ResponsiveAppBar;