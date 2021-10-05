// @ts-nocheck
import {
    Box,
    CircularProgress,
    Container,
    Grid,
    Card,
    CardContent,
    styled,
    Typography,
} from '@mui/material';
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { auth, db, dynamicApiKey } from '../config/firebase';
import { coordinateMatch, getCoordinateObj } from '../helper/helper';
import { Calendar } from '@nivo/calendar';
import { Line } from '@nivo/line';
import AutoSizer from 'react-virtualized-auto-sizer';

function Home() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const user = auth.currentUser;

    useEffect(() => {
        //fetchLogs();
        //TODO: remove
        const obj = [
            {
                date: {
                    seconds: 1633593178,
                    nanoseconds: 0,
                },
                note: 'Niente di che',
                'dive-time': '56',
                stops: [
                    {
                        meter: '3',
                        time: '3',
                    },
                ],
                'max-depth': '12',
                place: 'Home',
                id: 'CZVw6TNMvxX8yGnPHHv3',
            },
            {
                stops: [
                    {
                        time: '4',
                        meter: '16',
                    },
                    {
                        time: '7',
                        meter: '3',
                    },
                ],
                coordinate: '44.246621,9.398363',
                place: 'Cargo armato',
                'max-depth': '36',
                note: 'Bella immersione, figa davvero! \n44.246621, 9.398363\nBella immersione, figa davvero! \nBella immersione, figa davvero! ',
                date: {
                    seconds: 1632594637,
                    nanoseconds: 0,
                },
                'dive-time': '38',
                id: 'EhfUwQm8HCAAmoNIRvSd',
            },
            {
                coordinate: 'ddsada',
                stops: [],
                'dive-time': 'vasvcs',
                place: 'aaaa',
                date: {
                    seconds: 1630749262,
                    nanoseconds: 0,
                },
                'max-depth': 'fasfasd',
                id: 'FgoeRCaT6tVDJJ6inIDi',
            },
            {
                date: {
                    seconds: 1633334258,
                    nanoseconds: 0,
                },
                'dive-time': '3',
                'max-depth': '90',
                place: 'Miao',
                stops: [
                    {
                        meter: '6',
                        time: '45',
                    },
                ],
                coordinate: '45.160, 8.969',
                id: 'TTStmA74vzfmH38wWOgh',
            },
            {
                'dive-time': '55',
                coordinate: 'aaaa',
                date: {
                    seconds: 1632945010,
                    nanoseconds: 0,
                },
                'max-depth': '33',
                place: 'CIao',
                stops: [],
                id: 'a3DtBA3iywnTTBPC61eK',
            },
            {
                place: 'Home',
                'max-depth': '123',
                stops: [
                    {
                        time: '3',
                        meter: '3',
                    },
                ],
                note: 'Niente di che',
                date: {
                    seconds: 1633593178,
                    nanoseconds: 0,
                },
                'dive-time': '56',
                id: 'gGeOVTLzvJPofIltbktG',
            },
            {
                'max-depth': '33',
                coordinate: 'aaaa',
                'dive-time': '44',
                date: {
                    seconds: 1632945010,
                    nanoseconds: 0,
                },
                stops: [],
                place: 'aaaa',
                id: 'luGhT2CTOMnBZwRLK3fe',
            },
            {
                'max-depth': '45',
                coordinate: '44.18487166821108,8.423145470062341',
                place: 'Test 123',
                stops: [],
                'dive-time': '32',
                date: {
                    seconds: 1633531403,
                    nanoseconds: 0,
                },
                id: 'xO0HMFucUlWmAXV8Bw4z',
            },
        ];
        console.log(obj);
        setData(obj);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        getAllCoordinate();
    }, [data]);

    const fetchLogs = () => {
        const userUid = user.uid;
        const logCollection = collection(db, 'user', userUid, 'log');

        getDocs(logCollection)
            .then((response) => {
                console.log(response);
                const logsList = [];
                response.forEach((doc) => {
                    const data = { ...doc.data(), id: doc.id };
                    logsList.push(data);
                });
                console.log(logsList);
                if (logsList && logsList.length) setData(logsList);
            })
            .then(() => {
                setIsLoading(false);
            });
    };

    const getAllCoordinate = () => {
        if (
            data &&
            data.some((element) => element.hasOwnProperty('coordinate'))
        ) {
            const allCoordinates = data
                .filter(
                    (element) =>
                        element.hasOwnProperty('coordinate') &&
                        coordinateMatch(element.coordinate)
                )
                .map((element) => element.coordinate);
            return allCoordinates;
        }
        return null;
    };

    if (isLoading) return <CircularProgress />;
    return (
        <Container component='main' maxWidth='xl'>
            <Box
                sx={{
                    mt: 1,
                    width: '100%',
                    marginTop: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                    <Grid
                        item
                        xs={12}
                        sm={12}
                        md={9}
                        sx={{ minHeight: '50vh' }}
                    >
                        <Card sx={{ height: '100%' }}>
                            <CardContent
                                sx={{
                                    height: '100%',
                                }}
                            >
                                <HeatMap getAllCoordinate={getAllCoordinate} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={12} md={3}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }}
                            >
                                <Info />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
            <Box
                sx={{
                    mt: 2,
                    width: '100%',
                    marginTop: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                    <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        lg={6}
                        sx={{ height: 'auto', minHeight: '50vh' }}
                    >
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ height: '100%' }}>
                                <DivingTimeChart />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        lg={6}
                        sx={{ height: 'auto', minHeight: '50vh' }}
                    >
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ height: '100%' }}>
                                <DivingDepthChart />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}

const HeatMap = ({ getAllCoordinate }) => {
    const containerStyle = {
        width: '100%',
        height: '400px',
    };
    const allCoordinate = getAllCoordinate();
    const markers = allCoordinate.map((element) => getCoordinateObj(element));
    const position = getCoordinateObj(allCoordinate[0]);
    console.log(markers);
    return <h1>mappa</h1>;
    return (
        <LoadScript googleMapsApiKey={dynamicApiKey}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={position}
                zoom={6}
            >
                {markers.map((element) => {
                    return <Marker position={element} />;
                })}
            </GoogleMap>
        </LoadScript>
    );
};

const Info = ({}) => {
    const InfoExtContainer = styled('div')(({ theme }) => ({
        display: 'flex',
        justifyContent: 'center',
    }));

    const InfoContainer = styled('div')(({ theme }) => ({
        textDecoration: 'none',
        padding: '0.8rem',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '0.8rem',
        transition: 'background-color 100ms ease-in-out',
    }));

    const ValueContainer = styled('div')(({ theme }) => ({
        color: '#1c9eff',
        fontWeight: 'bold',
        transformOrigin: 'bottom',
        transform: 'scaleY(1.3)',
        transition: 'color 100ms ease-in-out',
    }));

    const MeasureContainer = styled('div')(({ theme }) => ({
        color: '#afafaf',
        fontSize: '0.85rem',
        fontWeight: 'normal',
    }));

    return (
        <Grid container>
            <Grid item xs={6}>
                <InfoExtContainer>
                    <Typography
                        variant='h4'
                        sx={{
                            textAlign: 'center',
                            width: '50%',
                            margin: '0',
                            boxSizing: 'border-box',
                        }}
                    >
                        <InfoContainer>
                            <ValueContainer>30</ValueContainer>
                            <MeasureContainer>Max Depth</MeasureContainer>
                        </InfoContainer>
                    </Typography>
                </InfoExtContainer>
            </Grid>
            <Grid item xs={6}>
                <InfoExtContainer>
                    <Typography
                        variant='h4'
                        sx={{
                            textAlign: 'center',
                            width: '50%',
                            margin: '0',
                            boxSizing: 'border-box',
                        }}
                    >
                        <InfoContainer>
                            <ValueContainer>50</ValueContainer>
                            <MeasureContainer>Max Time</MeasureContainer>
                        </InfoContainer>
                    </Typography>
                </InfoExtContainer>
            </Grid>
            <Grid item xs={6}>
                <InfoExtContainer>
                    <Typography
                        variant='h4'
                        sx={{
                            textAlign: 'center',
                            width: '50%',
                            margin: '0',
                            boxSizing: 'border-box',
                        }}
                    >
                        <InfoContainer>
                            <ValueContainer>50</ValueContainer>
                            <MeasureContainer>
                                Total Diving Time
                            </MeasureContainer>
                        </InfoContainer>
                    </Typography>
                </InfoExtContainer>
            </Grid>
            <Grid item xs={6}>
                <InfoExtContainer>
                    <Typography
                        variant='h4'
                        sx={{
                            textAlign: 'center',
                            width: '50%',
                            margin: '0',
                            boxSizing: 'border-box',
                        }}
                    >
                        <InfoContainer>
                            <ValueContainer>50</ValueContainer>
                            <MeasureContainer>Diving Count</MeasureContainer>
                        </InfoContainer>
                    </Typography>
                </InfoExtContainer>
            </Grid>
        </Grid>
    );
};

const DivingTimeChart = ({}) => {
    const data = [
        {
            value: 330,
            day: '2016-02-15',
        },
        {
            value: 325,
            day: '2015-10-02',
        },
        {
            value: 346,
            day: '2016-11-12',
        },
        {
            value: 116,
            day: '2016-03-27',
        },
        {
            value: 257,
            day: '2017-11-09',
        },
        {
            value: 65,
            day: '2017-08-19',
        },
        {
            value: 277,
            day: '2015-07-10',
        },
        {
            value: 234,
            day: '2016-09-20',
        },
        {
            value: 380,
            day: '2015-12-17',
        },
        {
            value: 390,
            day: '2016-04-25',
        },
        {
            value: 95,
            day: '2017-07-22',
        },
        {
            value: 375,
            day: '2017-01-03',
        },
        {
            value: 126,
            day: '2016-12-01',
        },
        {
            value: 200,
            day: '2015-06-29',
        },
        {
            value: 154,
            day: '2017-09-25',
        },
        {
            value: 161,
            day: '2018-02-12',
        },
        {
            value: 322,
            day: '2018-07-13',
        },
        {
            value: 339,
            day: '2015-10-29',
        },
        {
            value: 28,
            day: '2018-08-10',
        },
        {
            value: 241,
            day: '2018-07-24',
        },
        {
            value: 111,
            day: '2017-04-05',
        },
        {
            value: 128,
            day: '2016-01-16',
        },
        {
            value: 175,
            day: '2015-06-10',
        },
        {
            value: 257,
            day: '2016-09-30',
        },
        {
            value: 142,
            day: '2016-07-17',
        },
        {
            value: 127,
            day: '2015-05-22',
        },
        {
            value: 266,
            day: '2017-08-17',
        },
        {
            value: 333,
            day: '2017-08-22',
        },
        {
            value: 270,
            day: '2017-06-25',
        },
        {
            value: 398,
            day: '2018-07-02',
        },
        {
            value: 191,
            day: '2018-04-18',
        },
        {
            value: 146,
            day: '2015-04-03',
        },
        {
            value: 262,
            day: '2016-04-16',
        },
        {
            value: 377,
            day: '2016-03-07',
        },
        {
            value: 163,
            day: '2016-07-19',
        },
        {
            value: 298,
            day: '2016-01-11',
        },
        {
            value: 112,
            day: '2016-02-04',
        },
        {
            value: 87,
            day: '2015-07-27',
        },
        {
            value: 395,
            day: '2015-04-05',
        },
        {
            value: 226,
            day: '2018-06-04',
        },
        {
            value: 226,
            day: '2018-06-05',
        },
    ];

    return (
        <>
            <AutoSizer style={{ width: '100%' }}>
                {({ height, width }) => (
                    <>
                        <Typography
                            variant='h5'
                            sx={{
                                textAlign: 'center',
                                margin: '0',
                                boxSizing: 'border-box',
                            }}
                        >
                            Last 2 years divings
                        </Typography>
                        <Calendar
                            height={height}
                            width={width}
                            data={data}
                            from='2015-03-01'
                            to='2016-07-12'
                            emptyColor='#eeeeee'
                            colors={[
                                '#61cdbb',
                                '#97e3d5',
                                '#e8c1a0',
                                '#f47560',
                            ]}
                            margin={{
                                top: 40,
                                right: 40,
                                bottom: 40,
                                left: 40,
                            }}
                            yearSpacing={40}
                            monthBorderColor='#ffffff'
                            dayBorderWidth={2}
                            dayBorderColor='#ffffff'
                            legends={[
                                {
                                    anchor: 'bottom-right',
                                    direction: 'row',
                                    translateY: 36,
                                    itemCount: 4,
                                    itemWidth: 42,
                                    itemHeight: 36,
                                    itemsSpacing: 14,
                                    itemDirection: 'right-to-left',
                                },
                            ]}
                        />
                    </>
                )}
            </AutoSizer>
        </>
    );
};

const DivingDepthChart = ({}) => {
    //https://codesandbox.io/s/nivoline-off-values-z5hm9
    //https://nivo.rocks/storybook/?path=/story/line--stacked-lines
    const data = [
        {
            id: 'norway',
            color: 'hsl(26, 70%, 50%)',
            data: [
                {
                    x: 'plane',
                    y: 266,
                },
                {
                    x: 'helicopter',
                    y: 85,
                },
                {
                    x: 'boat',
                    y: 255,
                },
                {
                    x: 'train',
                    y: 143,
                },
                {
                    x: 'subway',
                    y: 20,
                },
                {
                    x: 'bus',
                    y: 239,
                },
                {
                    x: 'car',
                    y: 251,
                },
                {
                    x: 'moto',
                    y: 261,
                },
                {
                    x: 'bicycle',
                    y: 93,
                },
                {
                    x: 'horse',
                    y: 155,
                },
                {
                    x: 'skateboard',
                    y: 230,
                },
                {
                    x: 'others',
                    y: 268,
                },
            ],
        },
    ];
    return (
        <AutoSizer style={{ width: '100%' }}>
            {({ height, width }) => (
                <>
                    <Typography
                        variant='h5'
                        sx={{
                            textAlign: 'center',
                            margin: '0',
                            boxSizing: 'border-box',
                        }}
                    >
                        Deep
                    </Typography>
                    <Line
                        data={data}
                        height={height - 20}
                        width={width}
                        margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                        xScale={{ type: 'point' }}
                        yScale={{
                            type: 'linear',
                            min: 'auto',
                            max: 'auto',
                            stacked: true,
                            reverse: false,
                        }}
                        yFormat=' >-.2f'
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            orient: 'bottom',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'transportation',
                            legendOffset: 36,
                            legendPosition: 'middle',
                        }}
                        axisLeft={{
                            orient: 'left',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'count',
                            legendOffset: -40,
                            legendPosition: 'middle',
                        }}
                        pointSize={10}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        pointLabelYOffset={-12}
                        useMesh={true}
                        legends={[]}
                    />
                </>
            )}
        </AutoSizer>
    );
};

export default Home;
export { HeatMap, Info, DivingTimeChart, DivingDepthChart };
