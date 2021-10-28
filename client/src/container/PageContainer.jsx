import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { auth } from '../config/firebase';
import { Link } from 'react-router-dom';
import { Avatar, FormControl, MenuItem, Select } from '@mui/material';
import LangContext from './LangContext';
import { FormattedMessage, injectIntl } from 'react-intl';

const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(9)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
    // @ts-ignore
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open',
})(
    // @ts-ignore
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    })
);

function PageContainer({ intl, children }) {
    const theme = useTheme();
    const lang = React.useContext(LangContext);
    const [open, setOpen] = React.useState(false);

    const user = auth.currentUser;

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const menu = [
        {
            title: intl.formatMessage({ id: 'home' }),
            icon: <HomeIcon />,
            link: '/',
        },
        {
            title: intl.formatMessage({ id: 'resume' }),
            icon: <AssignmentIcon />,
            link: '/resume',
        },
        {
            title: intl.formatMessage({ id: 'insert' }),
            icon: <AddIcon />,
            link: '/create-log',
        },
        {
            title: intl.formatMessage({ id: 'account' }),
            icon: (
                <Avatar src={user?.photoURL} sx={{ width: 24, height: 24 }} />
            ),
            link: user ? '/account' : '/login',
        },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position='fixed'
                // @ts-ignore
                open={open}
            >
                <Toolbar>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'start',
                            }}
                        >
                            <IconButton
                                color='inherit'
                                aria-label='open drawer'
                                onClick={handleDrawerOpen}
                                edge='start'
                                sx={{
                                    marginRight: '36px',
                                    ...(open && { display: 'none' }),
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography variant='h6' noWrap component='div'>
                                <FormattedMessage
                                    id='diving logbook'
                                    defaultMessage='Diving LogBook'
                                />
                            </Typography>
                        </Box>
                        <FormControl variant='standard' sx={{ color: 'white' }}>
                            <Select
                                labelId='lang-select-label'
                                id='lang-select'
                                value={lang.lang}
                                onChange={(value) => {
                                    lang.setLang(value.target.value);
                                }}
                                sx={{ color: 'white' }}
                            >
                                <MenuItem value={'it'}>Italiano</MenuItem>
                                <MenuItem value={'en'}>English</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer variant='permanent' open={open}>
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? (
                            <ChevronRightIcon />
                        ) : (
                            <ChevronLeftIcon />
                        )}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <List>
                    {menu.map((item) => (
                        <Link
                            to={item.link}
                            style={{ textDecoration: 'none', color: 'unset ' }}
                            key={item.title}
                        >
                            <ListItem button key={item.title}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.title} />
                            </ListItem>
                        </Link>
                    ))}
                </List>
            </Drawer>
            <Box component='main' sx={{ flexGrow: 1, p: 1, overflow: 'auto' }}>
                <DrawerHeader />
                {children}
            </Box>
        </Box>
    );
}

export default injectIntl(PageContainer);
