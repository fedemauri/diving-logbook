import { getDoc, doc } from '@firebase/firestore';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db, dynamicApiKey } from '../config/firebase';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { CircularProgress } from '@mui/material';
import { coordinateMatch, getCoordinateObj } from '../helper/helper';

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
                setData(response.data());
            })
            .then(() => {
                setIsLoading(false);
            });
    };

    if (isLoading) return <CircularProgress />;

    return (
        <div>
            <h1>{`${data.place} - Details`}</h1>
            {data?.coordinate && coordinateMatch(data.coordinate) && (
                <DiveMap coordinate={data.coordinate} />
            )}
        </div>
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
