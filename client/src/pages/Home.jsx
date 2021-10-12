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
import React, { useEffect, useState, useCallback } from 'react';
import { auth, db, dynamicApiKey } from '../config/firebase';
import { coordinateMatch, getCoordinateObj } from '../helper/helper';
import { Calendar } from '@nivo/calendar';
import { Line } from '@nivo/line';
import AutoSizer from 'react-virtualized-auto-sizer';
import { formatDate, groupCount, getMax } from './../helper/helper';
import { FormattedMessage, injectIntl } from 'react-intl';

function Home({ intl }) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const user = auth.currentUser;

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        getAllCoordinate();
    }, [data]);

    const fetchLogs = () => {
        const userUid = user.uid;
        const logCollection = collection(db, 'user', userUid, 'log');

        getDocs(logCollection)
            .then((response) => {
                const logsList = [];
                response.forEach((doc) => {
                    const formattedDate = formatDate(
                        doc.data().date.seconds,
                        'yyyy-MM-dd'
                    );
                    const data = {
                        ...doc.data(),
                        id: doc.id,
                        formattedDate: formattedDate,
                    };
                    logsList.push(data);
                });
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
    if (!data)
        return (
            <Typography variant='h4'>
                <FormattedMessage
                    id='no data to display'
                    defaultMessage='No data to display'
                />
            </Typography>
        );
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
                                <Info data={data} />
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
                                <DivingTimeChart data={data} />
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
                                <DivingDepthChart data={data} />
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

const Info = ({ data }) => {
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

    const getDivingNumber = useCallback(() => {
        return data.length;
    }, [data]);

    const getMaxDepth = useCallback(() => {
        return getMax(data, 'max-depth');
    }, [data]);

    const getMaxTime = useCallback(() => {
        return getMax(data, 'dive-time');
    }, [data]);

    const getTotalDivingTime = useCallback(() => {
        return data.reduce((accumulator, next) => {
            if (isNaN(parseInt(next['dive-time']))) return accumulator;
            return accumulator + parseInt(next['dive-time']);
        }, 0);
    }, [data]);

    const divingNumber = getDivingNumber();
    const maxDepth = getMaxDepth();
    const maxTime = getMaxTime();
    const totalDivingTime = getTotalDivingTime();

    return (
        <Grid container rowSpacing={{ xs: 1, sm: 2, md: 3 }}>
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
                            <ValueContainer>{maxDepth}</ValueContainer>
                            <MeasureContainer>
                                <FormattedMessage
                                    id='max depth'
                                    defaultMessage='Max Depth (m)'
                                />
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
                            <ValueContainer>{maxTime}</ValueContainer>
                            <MeasureContainer>
                                <FormattedMessage
                                    id='max time'
                                    defaultMessage='Max Time (min)'
                                />
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
                            <ValueContainer>{totalDivingTime}</ValueContainer>
                            <MeasureContainer>
                                <FormattedMessage
                                    id='total diving time'
                                    defaultMessage='Total Diving Time (min)'
                                />
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
                            <ValueContainer>{divingNumber}</ValueContainer>
                            <MeasureContainer>
                                <FormattedMessage
                                    id='diving count'
                                    defaultMessage='Diving Count'
                                />
                            </MeasureContainer>
                        </InfoContainer>
                    </Typography>
                </InfoExtContainer>
            </Grid>
        </Grid>
    );
};

const DivingTimeChart = ({ data }) => {
    const getGroupedData = useCallback(() => {
        const groupedData = groupCount(data, (item) => item.formattedDate);
        const groupedDataList = [];
        for (const property in groupedData) {
            if (groupedData.hasOwnProperty(property))
                groupedDataList.push({
                    value: groupedData[property],
                    day: property,
                });
        }
        return groupedDataList;
    }, [data]);

    const calendarData = getGroupedData();
    const currentYear = new Date().getFullYear() + '';
    const lastYear = new Date().getFullYear() - 1 + '';

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
                            <FormattedMessage
                                id='last 2 years divings'
                                defaultMessage='Last 2 years divings'
                            />
                        </Typography>
                        <Calendar
                            height={height}
                            width={width}
                            data={calendarData}
                            from={lastYear}
                            to={currentYear}
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

const DivingDepthChart = ({ data }) => {
    //Sort by date filter for invalid date and map values
    const getGroupedData = useCallback(() => {
        return data
            .sort(
                (a, b) =>
                    parseFloat(a.date.seconds) - parseFloat(b.date.seconds)
            )
            .filter((element) => !isNaN(parseInt(element['max-depth'])))
            .map((element) => {
                return { x: element.formattedDate, y: element['max-depth'] };
            });
    }, [data]);

    const calendarData = getGroupedData();
    const deepDaysData = [
        {
            id: 'depth',
            color: 'hsl(26, 70%, 50%)',
            data: calendarData,
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
                        <FormattedMessage id='deep' defaultMessage='Deep' />
                    </Typography>
                    <Line
                        data={deepDaysData}
                        height={height - 20}
                        width={width}
                        margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                        xScale={{ type: 'point' }}
                        xScale={{
                            type: 'time',
                            format: '%Y-%m-%d',
                            useUTC: false,
                            precision: 'day',
                        }}
                        xFormat='time:%Y-%m-%d'
                        yScale={{
                            type: 'linear',
                        }}
                        axisLeft={{
                            legend: 'meter',
                            legendOffset: 12,
                        }}
                        axisBottom={{
                            format: '%b %d',
                            tickValues: 'every 2 days',
                            legend: 'days',
                            legendOffset: -12,
                        }}
                        enablePointLabel={true}
                        useMesh={true}
                        enableSlices={false}
                    />
                </>
            )}
        </AutoSizer>
    );
};

export default injectIntl(Home);
export { HeatMap, Info, DivingTimeChart, DivingDepthChart };
