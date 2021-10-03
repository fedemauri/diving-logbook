import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material';
import { Box } from '@mui/system';
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import React, { useState } from 'react';
import { dynamicApiKey } from '../config/firebase';

function MapCoordinateModal({ handleClose, open, setCoordinate }) {
    const [marker, setMarker] = useState(null);
    const containerStyle = {
        width: '100%',
        height: '400px',
    };

    const center = {
        //Liguria
        lat: 44,
        lng: 9,
    };

    const handleMapClick = (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        const coordinate = {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
        };
        setMarker(coordinate);
        setCoordinate(`${coordinate.lat},${coordinate.lng}`);
    };

    return (
        <Dialog
            fullWidth={true}
            maxWidth={'md'}
            open={!!open}
            onClose={() => handleClose(false)}
        >
            <DialogTitle>Optional sizes</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    You can set my maximum width and whether to adapt or not.
                </DialogContentText>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        m: 'auto',
                    }}
                >
                    <LoadScript googleMapsApiKey={dynamicApiKey}>
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={center}
                            zoom={8}
                            onClick={handleMapClick}
                        >
                            {marker && <Marker position={marker} />}
                        </GoogleMap>
                    </LoadScript>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose(false)}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default MapCoordinateModal;
