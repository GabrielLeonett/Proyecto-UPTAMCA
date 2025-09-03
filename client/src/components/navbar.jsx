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

  useEffect(() => {
    if (user && user.roles) {
      setUserRoles(user.roles);
    }
  }, [user]);

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenSubmenu = (event, menuName) => {
    setAnchorElSubmenu({ ...anchorElSubmenu, [menuName]: event.currentTarget });
  };

  const handleCloseSubmenu = (menuName) => {
    setAnchorElSubmenu({ ...anchorElSubmenu, [menuName]: null });
  };

  const handleRedirect = (url) => {
    window.open(url, "_blank");
  };

  const handleNavigation = (url) => {
    navigate(url);
    handleCloseNavMenu();
    setAnchorElSubmenu({});
    handleCloseUserMenu();
  };

  // Verificar si el usuario tiene acceso a una página/subpágina
  const hasAccess = (requiredRoles) => {
    if (!userRoles || userRoles.length === 0) return false;
    return requiredRoles.some((role) => userRoles.includes(role));
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const pages = [
    {
      name: "Inicio",
      url: "/",
      roles: [
        "publico",
        "Vicerrector",
        "Profesor",
        "Coordinador",
        "Director General de Gestión Curricular",
        "SuperAdmin",
      ],
    },
    {
      name: "Profesor",
      roles: [
        "Vicerrector",
        "Coordinador",
        "Director General de Gestión Curricular",
        "SuperAdmin",
      ],
      submenu: [
        {
          name: "Ver",
          url: "/Profesores",
          roles: [
            "Vicerrector",
            "Coordinador",
            "Director General de Gestión Curricular",
            "SuperAdmin",
          ],
        },
        {
          name: "Registrar",
          url: "/registerProfesor",
          roles: [
            "Coordinador",
            "Director General de Gestión Curricular",
            "SuperAdmin",
          ],
        },
      ],
    },
    {
      name: "PNF",
      roles: [
        "Vicerrector",
        "Coordinador",
        "Director General de Gestión Curricular",
        "SuperAdmin",
      ],
      submenu: [
        {
          name: "Ver",
          url: "/PNF",
          roles: [
            "Vicerrector",
            "Coordinador",
            "Director General de Gestión Curricular",
            "SuperAdmin",
          ],
        },
        {
          name: "Registrar",
          url: "/registerPNF",
          roles: ["Director General de Gestión Curricular", "SuperAdmin"],
        },
      ],
    },
    {
      name: "Horarios",
      url: "/Horarios",
      roles: [
        "Vicerrector",
        "Profesor",
        "Coordinador",
        "Director General de Gestión Curricular",
        "SuperAdmin",
      ],
    },
    {
      name: "Administración",
      roles: ["SuperAdmin"],
      submenu: [
        { name: "Usuarios", url: "/admin/users", roles: ["SuperAdmin"] },
        {
          name: "Configuración",
          url: "/admin/settings",
          roles: ["SuperAdmin"],
        },
        { name: "Auditoría", url: "/admin/audit", roles: ["SuperAdmin"] },
      ],
    },
  ];

  // Filtrar páginas según los roles del usuario
  const filteredPages = pages.filter(
    (page) =>
      hasAccess(page.roles) ||
      (page.submenu && page.submenu.some((subItem) => hasAccess(subItem.roles)))
  );

  return (
    <AppBar
      position="fixed"
      color={backgroundColor ? "primary" : "transparent"}
      enableColorOnDark
      elevation={backgroundColor ? 4 : 0}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* LogoTexto: Visible en pantallas grandes (md y arriba) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              height: "100px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <LogoTexto />
          </Box>

          {/* LogoSimple: Visible en pantallas pequeñas y medianas (xs, sm) */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              height: "100px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <LogoSimple />
          </Box>

          {/* Menú para pantallas pequeñas */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              fontFamily: "Poppins",
            }}
          >
            <IconButton
              size="large"
              aria-label="menu principal"
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
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {filteredPages.map((page) => (
                <div key={page.name}>
                  {page.submenu ? (
                    <div>
                      <MenuItem
                        onClick={(e) => handleOpenSubmenu(e, page.name)}
                        aria-haspopup="true"
                        aria-controls={`${page.name}-menu`}
                      >
                        <Typography textAlign="center">{page.name}</Typography>
                      </MenuItem>
                      <Menu
                        id={`${page.name}-menu`}
                        anchorEl={anchorElSubmenu[page.name]}
                        open={Boolean(anchorElSubmenu[page.name])}
                        onClose={() => handleCloseSubmenu(page.name)}
                        MenuListProps={{
                          "aria-labelledby": `${page.name}-button`,
                        }}
                      >
                        {page.submenu
                          .filter((subItem) => hasAccess(subItem.roles))
                          .map((subItem) => (
                            <MenuItem
                              key={subItem.name}
                              onClick={() => handleNavigation(subItem.url)}
                            >
                              <Typography textAlign="center">
                                {subItem.name}
                              </Typography>
                            </MenuItem>
                          ))}
                      </Menu>
                    </div>
                  ) : (
                    <MenuItem onClick={() => handleNavigation(page.url)}>
                      <Typography textAlign="center">{page.name}</Typography>
                    </MenuItem>
                  )}
                </div>
              ))}
            </Menu>
          </Box>

          {/* Menú para pantallas grandes */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            {filteredPages.map((page) => (
              <div key={page.name}>
                {page.submenu ? (
                  <div>
                    <Button
                      id={`${page.name}-button`}
                      aria-controls={Boolean(anchorElSubmenu[page.name]) ? `${page.name}-menu` : undefined}
                      aria-haspopup="true"
                      aria-expanded={Boolean(anchorElSubmenu[page.name]) ? "true" : undefined}
                      onClick={(e) => handleOpenSubmenu(e, page.name)}
                      sx={{
                        my: 2,
                        color: "white",
                        display: "block",
                        mx: 0.5,
                      }}
                    >
                      {page.name}
                    </Button>
                    <Menu
                      id={`${page.name}-menu`}
                      anchorEl={anchorElSubmenu[page.name]}
                      open={Boolean(anchorElSubmenu[page.name])}
                      onClose={() => handleCloseSubmenu(page.name)}
                      MenuListProps={{
                        "aria-labelledby": `${page.name}-button`,
                      }}
                    >
                      {page.submenu
                        .filter((subItem) => hasAccess(subItem.roles))
                        .map((subItem) => (
                          <MenuItem
                            key={subItem.name}
                            onClick={() => handleNavigation(subItem.url)}
                          >
                            <Typography textAlign="center">
                              {subItem.name}
                            </Typography>
                          </MenuItem>
                        ))}
                    </Menu>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleNavigation(page.url)}
                    sx={{
                      my: 2,
                      color: "white",
                      display: "block",
                      mx: 1,
                    }}
                  >
                    {page.name}
                  </Button>
                )}
              </div>
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