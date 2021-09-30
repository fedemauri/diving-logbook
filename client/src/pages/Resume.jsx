import React, { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
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
} from '@mui/material';

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

    if (isLoading) return null;
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
                        {logs.map((element) => {
                            return <LogCard key={element.id} data={element} />;
                        })}
                    </Grid>
                </Box>
            </Container>
        </div>
    );
}
//{data.date.seconds}

const LogCard = ({ data }) => {
    const date = fromUnixTime(data.date.seconds);
    const printableDate = format(date, 'dd MMMM yyyy - HH:mm');
    let coordinate = data.coordinate;
    let coordinateLink = '';
    if (coordinate) {
        coordinate = coordinate.replace(/\s+/g, '');
        coordinateLink = `http://www.google.com/maps/place/${coordinate}`;
    }

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
                <CardContent>
                    <Typography
                        sx={{ fontSize: 14 }}
                        color='text.secondary'
                        gutterBottom
                    >
                        {printableDate}
                    </Typography>
                    <Typography variant='h5' component='div'>
                        {data.place}
                    </Typography>
                    {coordinate && (
                        <Typography sx={{ mb: 1.5 }} color='text.secondary'>
                            <Link
                                href={coordinateLink}
                                underline='hover'
                                target='_blank'
                            >
                                Map
                            </Link>
                        </Typography>
                    )}

                    {data.note && (
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
