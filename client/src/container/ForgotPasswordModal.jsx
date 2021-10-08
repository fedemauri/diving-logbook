import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

export default function ForgotPasswordModal({
    open,
    handleClose,
    sendPasswordReset,
}) {
    const [email, setEmail] = React.useState('');

    const handleCloseModal = () => {
        handleClose(false);
    };

    return (
        <Dialog open={open} maxWidth={'sm'} fullWidth>
            <DialogTitle>Reset password</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin='dense'
                    id='name'
                    label='Email Address'
                    type='email'
                    fullWidth
                    variant='standard'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseModal}>Close</Button>
                <Button
                    onClick={() => {
                        if (email) sendPasswordReset(email);
                        handleCloseModal();
                    }}
                >
                    Send
                </Button>
            </DialogActions>
        </Dialog>
    );
}
