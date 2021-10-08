import React, { useState } from 'react';
import { auth, storage } from '../config/firebase';
import { sendPasswordResetEmail, signOut, updateProfile } from 'firebase/auth';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    Input,
    Snackbar,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Container } from '@nivo/core';
import { getDownloadURL, ref, uploadBytes } from '@firebase/storage';

function Account() {
    const [openSnackBar, setOpenSnackBar] = useState({
        open: false,
        message: '',
    });
    const user = auth.currentUser;
    const theme = createTheme();

    const signOutHandler = () => {
        signOut(auth)
            .then(() => {
                window.location.replace('/');
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const sendPasswordReset = () => {
        sendPasswordResetEmail(auth, user.email)
            .then(() => {
                setOpenSnackBar({
                    open: true,
                    message: 'Password reset email sent!',
                });
            })
            .catch((error) => {
                const errorMessage = error.message;
                console.error(errorMessage);
            });
    };

    const updateProfileImage = (imageUrl) => {
        updateProfile(auth.currentUser, {
            photoURL: imageUrl,
        })
            .then(() => {
                window.location.reload();
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const uploadPhoto = (image) => {
        if (image) {
            const storageRef = ref(storage, `profile-images/${image.name}`);

            uploadBytes(storageRef, image).then((snapshot) => {
                getDownloadURL(storageRef).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    updateProfileImage(downloadURL);
                });
            });
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component='main' maxWidth='xl'>
                <Box
                    sx={{
                        marginTop: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Card>
                        <CardContent>
                            <div
                                style={{
                                    marginBottom: '3rem',
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                }}
                            >
                                <label htmlFor='contained-button-file'>
                                    <Input
                                        accept='image/*'
                                        id='contained-button-file'
                                        type='file'
                                        sx={{ display: 'none' }}
                                        onChange={(e) =>
                                            uploadPhoto(e.target.files[0])
                                        }
                                    />
                                    <IconButton
                                        color='primary'
                                        aria-label='upload picture'
                                        component='span'
                                    >
                                        <Avatar
                                            src={user?.photoURL}
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                marginLeft: 'auto',
                                                marginRight: 'auto',
                                            }}
                                        />
                                    </IconButton>
                                </label>
                            </div>
                            <b>{user.displayName}</b>
                            <p>{user.email}</p>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Button
                                    variant='outlined'
                                    sx={{ mt: 3 }}
                                    onClick={sendPasswordReset}
                                >
                                    Reset/change password
                                </Button>
                                <Button
                                    variant='contained'
                                    sx={{ mt: 3 }}
                                    onClick={signOutHandler}
                                >
                                    Sign Out
                                </Button>
                            </Box>
                            {openSnackBar && (
                                <Snackbar
                                    open={openSnackBar.open}
                                    autoHideDuration={3000}
                                    onClose={() => {
                                        setOpenSnackBar({
                                            ...openSnackBar,
                                            open: false,
                                        });
                                    }}
                                    message={openSnackBar.message}
                                />
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Container>
        </ThemeProvider>
    );
}

export default Account;
