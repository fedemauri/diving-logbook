import React, { useEffect, useState } from 'react';
import { auth, db, staticMapKey } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { format, fromUnixTime } from 'date-fns';
import {
    Card,
    CardContent,
    Typography,
    CardActions,
    Button,
    Container,
    Grid,
    Box,
    Link,
    CircularProgress,
    Avatar,
    CardHeader,
    CardMedia,
    styled,
} from '@mui/material';
import { coordinateMatch } from '../helper/helper';
import staticMap from './../images/staticmap.png';

function DivingResume() {
    const [logs, setLogs] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const user = auth.currentUser;

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
                    console.log(data);
                });
                if (logsList && logsList.length) setLogs(logsList);
            })
            .then(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    if (isLoading) return <CircularProgress />;
    return (
        <div>
            <h1>Diving resume</h1>
            <Container component='main' maxWidth='xl'>
                <Box
                    sx={{
                        mt: 1,
                        width: '100%',
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Grid container spacing={2}>
                        {logs.map((element, index) => {
                            return (
                                <LogCard
                                    key={element.id}
                                    data={element}
                                    index={index}
                                />
                            );
                        })}
                    </Grid>
                </Box>
            </Container>
        </div>
    );
}

const LogCard = ({ data, index }) => {
    const date = fromUnixTime(data.date.seconds);
    const printableDate = format(date, 'dd MMMM yyyy - HH:mm');
    let coordinate = data.coordinate;
    let coordinateLink = staticMap;
    if (coordinate) {
        coordinate = coordinate.replace(/\s+/g, '');
        if (coordinateMatch(coordinate))
            coordinateLink = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinate}&zoom=13&size=400x400&key=${staticMapKey}`;
    }

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
        <Grid item xs={12} sm={12} md={4}>
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                <CardHeader
                    avatar={
                        <Avatar sx={{ bgcolor: '#f43648cc' }} aria-label='log'>
                            {index + 1}
                        </Avatar>
                    }
                    title={data.place}
                    subheader={printableDate}
                />

                <CardMedia
                    component='img'
                    height='194'
                    image={coordinateLink}
                    alt='Paella dish'
                />

                <CardContent>
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
                                        <ValueContainer>
                                            {data['max-depth']}
                                        </ValueContainer>
                                        <MeasureContainer>
                                            Depth
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
                                        <ValueContainer>
                                            {data['dive-time']}
                                        </ValueContainer>
                                        <MeasureContainer>
                                            Time
                                        </MeasureContainer>
                                    </InfoContainer>
                                </Typography>
                            </InfoExtContainer>
                        </Grid>
                    </Grid>
                    {data.note ? (
                        <Typography
                            variant='body2'
                            sx={{
                                display: 'block',
                                textOverflow: 'ellipsis',
                                wordWrap: 'break-word',
                                overflow: 'hidden',
                                maxHeight: '3em',
                                lineHeight: '1.5em',
                                textAlign: 'justify',
                                fontSize: '0.8rem',
                            }}
                        >
                            {data.note}
                        </Typography>
                    ) : (
                        <Typography
                            variant='subtitle1'
                            sx={{
                                display: 'block',
                                textOverflow: 'ellipsis',
                                wordWrap: 'break-word',
                                overflow: 'hidden',
                                maxHeight: '3em',
                                lineHeight: '1.5em',
                                textAlign: 'center',
                                fontSize: '0.8rem',
                                color: '#afafaf',
                            }}
                        >
                            {'- No description -'}
                        </Typography>
                    )}
                </CardContent>
                <CardActions>
                    <Link href={`/details/${data.id}`} underline='hover'>
                        <Button size='small'>Details</Button>
                    </Link>
                </CardActions>
            </Card>
        </Grid>
    );
};

export default DivingResume;
