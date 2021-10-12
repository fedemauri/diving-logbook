import React, { useEffect, useState } from 'react';
import { auth, db, staticMapKey } from '../config/firebase';
import { doc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
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
import ConfirmationModal from '../components/ConfirmationModal';
import { FormattedMessage } from 'react-intl';

function DivingResume() {
    const [logs, setLogs] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [deleteModalId, setDeleteModalId] = useState(null);
    const user = auth.currentUser;
    const userUid = user.uid;

    const fetchLogs = () => {
        const logCollection = collection(db, 'user', userUid, 'log');

        onSnapshot(logCollection, (response) => {
            const logsList = [];
            response.forEach((doc) => {
                const data = { ...doc.data(), id: doc.id };
                logsList.push(data);
            });
            if (logsList && logsList.length) setLogs(logsList);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const deleteLog = (id) => {
        if (id)
            deleteDoc(doc(db, 'user', userUid, 'log', id)).catch((e) => {
                console.error(e);
            });
    };

    if (isLoading) return <CircularProgress />;
    if (!logs)
        return (
            <Typography variant='h4'>
                <FormattedMessage
                    id='no data to display'
                    defaultMessage='No data to display'
                />
            </Typography>
        );
    return (
        <div>
            <h1>
                <FormattedMessage
                    id='diving resume'
                    defaultMessage='Diving resume'
                />
            </h1>
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
                                    setOpenDeleteModal={setOpenDeleteModal}
                                    setDeleteModalId={setDeleteModalId}
                                />
                            );
                        })}
                    </Grid>
                </Box>
            </Container>
            {openDeleteModal && (
                <ConfirmationModal
                    button={
                        <FormattedMessage
                            id='Delete log'
                            defaultMessage='Delete log'
                        />
                    }
                    text={
                        <FormattedMessage
                            id='are you sure you want to delete the log?'
                            defaultMessage='Are you sure you want to delete the log?'
                        />
                    }
                    title={
                        <FormattedMessage
                            id='Delete log'
                            defaultMessage='Delete log'
                        />
                    }
                    handleConfirm={() => {
                        deleteLog(deleteModalId);
                    }}
                    isOpen={openDeleteModal}
                    id={deleteModalId}
                    handleClose={setOpenDeleteModal}
                />
            )}
        </div>
    );
}

const LogCard = ({ data, index, setOpenDeleteModal, setDeleteModalId }) => {
    const date = fromUnixTime(data.date.seconds);
    const printableDate = format(date, 'dd MMMM yyyy - HH:mm');
    let coordinate = data.coordinate;
    let coordinateLink = staticMap;
    if (coordinate) {
        coordinate = coordinate.replace(/\s+/g, '');
        if (coordinateMatch(coordinate))
            coordinateLink = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinate}&zoom=12&size=400x400&markers=color:red|size:mid|${coordinate}&key=${staticMapKey}`;
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
                                            <FormattedMessage
                                                id='depth'
                                                defaultMessage='Depth'
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
                                        <ValueContainer>
                                            {data['dive-time']}
                                        </ValueContainer>
                                        <MeasureContainer>
                                            <FormattedMessage
                                                id='Time'
                                                defaultMessage='Time'
                                            />
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
                <CardActions
                    sx={{
                        display: 'flex',
                        flex: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <Link href={`/details/${data.id}`} underline='hover'>
                        <Button size='small'>
                            <FormattedMessage
                                id='details'
                                defaultMessage='Details'
                            />
                        </Button>
                    </Link>

                    <Button
                        size='small'
                        onClick={() => {
                            setOpenDeleteModal(true);
                            setDeleteModalId(data.id);
                        }}
                    >
                        <FormattedMessage id='delete' defaultMessage='Delete' />
                    </Button>
                </CardActions>
            </Card>
        </Grid>
    );
};

export default DivingResume;
