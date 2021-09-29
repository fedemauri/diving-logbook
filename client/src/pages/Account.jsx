import React from 'react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@mui/material';

function Account() {
    const user = auth.currentUser;

    const signOutHandler = () => {
        signOut(auth)
            .then(() => {
                window.location.replace('/');
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <div>
            <h1>Account page</h1>
            <p>{user.displayName}</p>
            <p>{user.email}</p>
            <Button
                type='submit'
                variant='contained'
                sx={{ mt: 3 }}
                onClick={signOutHandler}
            >
                Sign Out
            </Button>
        </div>
    );
}

export default Account;
