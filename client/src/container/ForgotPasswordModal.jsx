import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { FormattedMessage, injectIntl } from 'react-intl';

function ForgotPasswordModal({ open, handleClose, sendPasswordReset, intl }) {
    const [email, setEmail] = React.useState('');

    const handleCloseModal = () => {
        handleClose(false);
    };

    return (
        <Dialog
            open={open}
            maxWidth={'sm'}
            onClose={handleCloseModal}
            fullWidth
        >
            <DialogTitle>
                <FormattedMessage
                    id='reset password'
                    defaultMessage='Reset password'
                />
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin='dense'
                    id='name'
                    label={intl.formatMessage({ id: 'email address' })}
                    type='email'
                    fullWidth
                    variant='standard'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseModal}>
                    <FormattedMessage id='close' defaultMessage='Close' />
                </Button>
                <Button
                    onClick={() => {
                        if (email) sendPasswordReset(email);
                        handleCloseModal();
                    }}
                >
                    <FormattedMessage id='send' defaultMessage='Send' />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default injectIntl(ForgotPasswordModal);
