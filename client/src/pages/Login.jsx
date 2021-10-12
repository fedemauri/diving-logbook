import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth, provider } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link as RouteLink } from 'react-router-dom';
import { useState } from 'react';
import ForgotPasswordModal from '../container/ForgotPasswordModal';
import { Snackbar } from '@mui/material';
import { FormattedMessage, injectIntl } from 'react-intl';

function Copyright(props) {
    return (
        <Typography
            variant='body2'
            color='text.secondary'
            align='center'
            {...props}
        >
            {'Copyright © '}
            <Link color='inherit' href='https://material-ui.com/'>
                Your Website
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const theme = createTheme();

function SignIn({ intl }) {
    const [error, setError] = useState('');
    const [openResetModal, setOpenResetModal] = useState(false);
    const [openSnackBar, setOpenSnackBar] = useState({
        open: false,
        message: '',
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        // eslint-disable-next-line no-console
        const formData = {
            email: data.get('email'),
            password: data.get('password'),
        };
        signInWithEmailAndPassword(auth, formData.email, formData.password)
            .then(() => {
                window.location.replace('/');
            })
            .catch((error) => {
                console.error(error);
                setError(error.message);
            });
    };

    const signInWithGoogle = () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                window.location.replace('/');
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const sendPasswordReset = (email) => {
        sendPasswordResetEmail(auth, email)
            .then(() => {
                setOpenSnackBar({
                    open: true,
                    message: 'Password reset email sent!',
                });
            })
            .catch((error) => {
                const errorMessage = error.message;
                setError(errorMessage);
            });
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component='main' maxWidth='xs'>
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component='h1' variant='h5'>
                        <FormattedMessage
                            id='sign in'
                            defaultMessage='Sign in'
                        />
                    </Typography>
                    <Box
                        component='form'
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{ mt: 1 }}
                    >
                        <TextField
                            margin='normal'
                            required
                            fullWidth
                            id='email'
                            label={intl.formatMessage({ id: 'email address' })}
                            name='email'
                            autoComplete='email'
                            autoFocus
                        />
                        <TextField
                            margin='normal'
                            required
                            fullWidth
                            name='password'
                            label={intl.formatMessage({ id: 'Password' })}
                            type='password'
                            id='password'
                            autoComplete='current-password'
                        />
                        {/* <FormControlLabel
                            control={
                                <Checkbox value='remember' color='primary' />
                            }
                            label='Remember me'
                        /> */}
                        {error && (
                            <Grid item xs={12}>
                                <Typography
                                    component='h6'
                                    style={{ color: 'red' }}
                                >
                                    {error}
                                </Typography>
                            </Grid>
                        )}
                        <Button
                            type='submit'
                            fullWidth
                            variant='contained'
                            sx={{ mt: 3 }}
                        >
                            <FormattedMessage
                                id='sign in'
                                defaultMessage='Sign In'
                            />
                        </Button>
                        <Button
                            fullWidth
                            variant='outlined'
                            sx={{ mt: 3, mb: 2 }}
                            onClick={signInWithGoogle}
                        >
                            <FormattedMessage
                                id='sign in with google'
                                defaultMessage='Sign In with Google'
                            />
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link
                                    onClick={setOpenResetModal}
                                    variant='body2'
                                >
                                    Forgot password?
                                </Link>
                            </Grid>
                            <Grid item>
                                <RouteLink to='/signup' variant='body2'>
                                    <FormattedMessage
                                        id="don't have an account? sign up"
                                        defaultMessage="Don't have an account? Sign Up"
                                    />
                                </RouteLink>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Copyright sx={{ mt: 8, mb: 4 }} />
                {openResetModal && (
                    <ForgotPasswordModal
                        open={openResetModal}
                        handleClose={setOpenResetModal}
                        sendPasswordReset={sendPasswordReset}
                    />
                )}
                {openSnackBar && (
                    <Snackbar
                        open={openSnackBar.open}
                        autoHideDuration={3000}
                        onClose={() => {
                            setOpenSnackBar({ ...openSnackBar, open: false });
                        }}
                        message={openSnackBar.message}
                    />
                )}
            </Container>
        </ThemeProvider>
    );
}

export default injectIntl(SignIn);
