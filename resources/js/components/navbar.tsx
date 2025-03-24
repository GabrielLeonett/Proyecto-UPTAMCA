import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import LogoTexto from './ui/logoTexto';
import LogoSimple from './ui/logoSimple';

const pages = ['Products', 'Pricing', 'Blog'];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* LogoTexto: Visible en pantallas grandes (md y arriba) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', height: '100px' }}>
            <LogoTexto Primary='bg-white' Secundary='bg-secundary' />
          </Box>

          {/* LogoSimple: Visible en pantallas pequeñas y medianas (xs, sm) */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', height: '100px' }}>
            <LogoSimple Primary='bg-white' Secundary='bg-secundary' />
          </Box>

          {/* Menú para pantallas pequeñas */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, fontFamily: 'Poppins' }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
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
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography variant='body1'>{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Menú para pantallas grandes */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>

          {/* Icono de Facebook */}
          <Box sx={{ flexGrow: 0 }}>
            <IconButton onClick={() => { window.location.href = 'https://www.facebook.com'; }}>
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;