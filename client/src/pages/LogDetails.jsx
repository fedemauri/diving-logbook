import { getDoc, doc } from '@firebase/firestore';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db, dynamicApiKey } from '../config/firebase';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import {
    Box,
    CircularProgress,
    Container,
    createTheme,
    ThemeProvider,
    Typography,
} from '@mui/material';
import { coordinateMatch, getCoordinateObj } from '../helper/helper';
import { LogForm } from './InsertLog';
import { fromUnixTime, format } from 'date-fns';

const theme = createTheme();

function LogDetails() {
    let { id } = useParams();
    const user = auth.currentUser;

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) fetchData();
    }, []);

    const fetchData = () => {
        const userUid = user.uid;
        const logCollection = doc(db, 'user', userUid, 'log', id);

        getDoc(logCollection)
            .then((response) => {
                console.log(response.data());
                const fetchedData = response.data();
                const date = fromUnixTime(fetchedData.date.seconds);
                fetchedData.date = date;
                setData(fetchedData);
            })
            .then(() => {
                setIsLoading(false);
            });
    };

    if (isLoading) return <CircularProgress />;

    return (
        <ThemeProvider theme={theme}>
            <Container component='main' maxWidth='xl' id={'log-details'}>
                <Box
                    sx={{
                        marginTop: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography
                        component='h1'
                        variant='h4'
                        sx={{ marginBottom: '1rem' }}
                    >{`${data.place}`}</Typography>
                    {data?.coordinate && coordinateMatch(data.coordinate) && (
                        <DiveMap coordinate={data.coordinate} />
                    )}
                    <LogForm
                        handleSubmit={() => {}}
                        handleChange={() => {}}
                        values={data}
                        setOpenMapModal={() => {}}
                        stops={data?.stops ?? []}
                        setStops={() => {}}
                        readOnly={true}
                    />
                </Box>
            </Container>
        </ThemeProvider>
    );
}

const DiveMap = ({ coordinate }) => {
    const containerStyle = {
        width: '100%',
        height: '400px',
    };

    const position = getCoordinateObj(coordinate);

    return (
        <LoadScript googleMapsApiKey={dynamicApiKey}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={position}
                zoom={13}
            >
                <Marker position={position} />
            </GoogleMap>
        </LoadScript>
    );
};

export default LogDetails;
