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
import React, { useRef } from 'react';
import { dynamicApiKey } from '../config/firebase';

function MapCoordinateModal({ handleClose, open, setCoordinate }) {
    const markerRef = useRef(null);
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
        markerRef.current = coordinate;
        setCoordinate(`${coordinate.lat},${coordinate.lng}`);
    };

    return (
        <Dialog
            fullWidth={true}
            maxWidth={'md'}
            open={!!open}
            onClose={() => handleClose(false)}
        >
            <DialogTitle>Select coordinate point</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Double click on map to select a point
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
                            onDblClick={handleMapClick}
                        >
                            {markerRef && markerRef.current && (
                                <Marker position={markerRef.current} />
                            )}
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
