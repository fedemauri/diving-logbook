import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { FormattedMessage } from 'react-intl';

export default function ConfirmationModal({
    button,
    text,
    title,
    handleConfirm,
    isOpen,
    handleClose,
    id,
}) {
    const handleCloseModal = () => {
        handleClose(false);
    };

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle id='alert-dialog-title'>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id='alert-dialog-description'>
                    {text}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        handleConfirm(id);
                        handleCloseModal();
                    }}
                >
                    {' '}
                    {button}{' '}
                </Button>
                <Button onClick={handleCloseModal}>
                    <FormattedMessage id='close' defaultMessage='Close' />
                </Button>
            </DialogActions>
        </Dialog>
    );
}
