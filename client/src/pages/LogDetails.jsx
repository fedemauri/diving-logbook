import { getDoc, doc } from '@firebase/firestore';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db, dynamicApiKey } from '../config/firebase';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Container,
    createTheme,
    Grid,
    ThemeProvider,
    Typography,
} from '@mui/material';
import { coordinateMatch, getCoordinateObj } from '../helper/helper';
import { LogForm } from './InsertLog';
import { fromUnixTime } from 'date-fns';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.min.css';
import 'swiper/swiper.min.css';
import SwiperCore, {
    Navigation,
    Pagination,
    Mousewheel,
    Keyboard,
} from 'swiper';
import { FormattedMessage, injectIntl } from 'react-intl';
SwiperCore.use([Navigation, Pagination, Mousewheel, Keyboard]);

const theme = createTheme();

function LogDetails({ intl }) {
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
                        setPhotos={() => {}}
                        readOnly={true}
                        intl={intl}
                    />
                    {data?.photosUrl && data.photosUrl.length !== 0 && (
                        <Card sx={{ width: '100%', marginTop: '2rem' }}>
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid
                                        item
                                        xs={12}
                                        sx={{ marginBottom: '1rem' }}
                                    >
                                        <Typography
                                            component='h1'
                                            variant='h4'
                                            sx={{
                                                marginBottom: '2rem',
                                            }}
                                        >
                                            <FormattedMessage
                                                id='image gallery'
                                                defaultMessage='Image gallery'
                                            />
                                        </Typography>
                                        <Swiper
                                            navigation={true}
                                            pagination={true}
                                            keyboard={true}
                                            className='mySwiper'
                                            autoHeight={true}
                                            spaceBetween={20}
                                            loop={true}
                                        >
                                            {data.photosUrl.map((element) => {
                                                return (
                                                    <SwiperSlide>
                                                        <img src={element} />
                                                    </SwiperSlide>
                                                );
                                            })}
                                        </Swiper>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    )}
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

export default injectIntl(LogDetails);
