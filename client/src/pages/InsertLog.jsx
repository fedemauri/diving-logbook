import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import DateTimePicker from '@mui/lab/DateTimePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Divider,
    FormControl,
    FormHelperText,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
} from '@mui/material';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { useState } from 'react';
import {
    arrayUnion,
    collection,
    doc,
    addDoc,
    setDoc,
    updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const theme = createTheme();

function CreateLog() {
    const [values, setValue] = useState({});
    const [stops, setStops] = useState([]);

    const handleChange = (newValue, field) => {
        setValue({ ...values, [field]: newValue });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const user = auth.currentUser;
        const userUid = user.uid;

        const userCollection = collection(db, 'user', userUid, 'log');
        addDoc(userCollection, {
            ...values,
            stops: stops,
        })
            .then((response) => {
                console.log('Document written with ID: ', response);
            })
            .catch((e) => {
                console.error(e);
            });
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component='main' maxWidth='xl'>
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <ControlPointIcon />
                    </Avatar>
                    <Typography component='h1' variant='h5'>
                        Create Diving Log
                    </Typography>
                    <Box
                        component='form'
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{ mt: 1, width: '100%' }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                >
                                    <DateTimePicker
                                        label='Date & Time'
                                        name='datetime'
                                        id='datetime'
                                        value={values.date ?? null}
                                        onChange={(value) => {
                                            handleChange(value, 'date');
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                margin='normal'
                                                sx={{ width: '100%' }}
                                            />
                                        )}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    margin='normal'
                                    required
                                    fullWidth
                                    name='place'
                                    label='Place'
                                    type='text'
                                    id='place'
                                    value={values.place ?? ''}
                                    onChange={(value) => {
                                        handleChange(
                                            value.target.value,
                                            'place'
                                        );
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    margin='normal'
                                    fullWidth
                                    name='coordinate'
                                    label='Coordinate'
                                    type='text'
                                    id='coordinate'
                                    value={values.coordinate ?? ''}
                                    onChange={(value) => {
                                        handleChange(
                                            value.target.value,
                                            'coordinate'
                                        );
                                    }}
                                />
                                <FormHelperText id='component-helper-text'>
                                    Use "45.160, 8.969" format
                                </FormHelperText>
                            </Grid>
                            <DivingLog
                                values={values}
                                handleChange={handleChange}
                            />
                            <DecompressionStops
                                stops={stops}
                                setStops={setStops}
                            />
                            <DivingParams
                                values={values}
                                handleChange={handleChange}
                            />
                            <Equipments
                                values={values}
                                handleChange={handleChange}
                            />
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    sx={{ width: '100%' }}
                                    placeholder='Notes'
                                    multiline
                                    rows={3}
                                    rowsMax={6}
                                />
                            </Grid>
                        </Grid>
                        {/* <FormControlLabel
                            control={
                                <Checkbox value='remember' color='primary' />
                            }
                            label='Remember me'
                        /> */}
                        <Button
                            type='submit'
                            fullWidth
                            variant='contained'
                            sx={{ mt: 3 }}
                        >
                            Save
                        </Button>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}

const DivingLog = ({ values, handleChange }) => {
    return (
        <>
            <Grid item xs={12} sm={6}>
                <TextField
                    margin='normal'
                    fullWidth
                    name='max-depth'
                    label='Max Depth'
                    type='text'
                    id='max-depth'
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position='end'>m</InputAdornment>
                        ),
                    }}
                    value={values['max-depth'] ?? ''}
                    onChange={(value) => {
                        handleChange(value.target.value, 'max-depth');
                    }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    margin='normal'
                    fullWidth
                    name='dive-time'
                    label='Dive Time'
                    type='text'
                    id='dive-time'
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position='end'>min</InputAdornment>
                        ),
                    }}
                    value={values['dive-time'] ?? ''}
                    onChange={(value) => {
                        handleChange(value.target.value, 'dive-time');
                    }}
                />
            </Grid>
        </>
    );
};

const DecompressionStops = ({ stops, setStops }) => {
    const createNewStop = () => {
        setStops([...stops, { meter: '', time: '' }]);
    };

    const handleStopEdit = (index, type, value) => {
        console.log(index, type, value);
        const newStops = [...stops];
        const selectedStop = newStops[index];
        selectedStop[type] = value;
        newStops[index] = selectedStop;
        setStops(newStops);
    };

    const removeStop = (index) => {
        const newStops = [...stops];
        newStops.splice(index, 1);
        setStops(newStops);
    };

    const renderStops = () => {
        if (stops && stops.length)
            return stops.map((element, index) => {
                return (
                    <React.Fragment key={index}>
                        <Grid item xs={12} sm={5}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='m-stop'
                                label='Meter stop'
                                type='text'
                                id='m-stop'
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            m
                                        </InputAdornment>
                                    ),
                                }}
                                value={element.meter}
                                onChange={(value) => {
                                    console.log(
                                        'value.target.value',
                                        value.target.value
                                    );
                                    handleStopEdit(
                                        index,
                                        'meter',
                                        value.target.value
                                    );
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='min-stop'
                                label='Time stop'
                                type='text'
                                id='min-stop'
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            min
                                        </InputAdornment>
                                    ),
                                }}
                                value={element.time}
                                onChange={(value) => {
                                    console.log(
                                        'value.target.value',
                                        value.target.value
                                    );
                                    handleStopEdit(
                                        index,
                                        'time',
                                        value.target.value
                                    );
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <Button
                                variant='outline'
                                sx={{ marginTop: '1.5rem' }}
                                onClick={() => {
                                    removeStop(index);
                                }}
                            >
                                <IndeterminateCheckBoxIcon />
                            </Button>
                        </Grid>
                    </React.Fragment>
                );
            });
    };

    return (
        <Grid item xs={12} sm={12}>
            <Accordion sx={{ marginTop: '1rem' }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel1bh-content'
                    id='panel1bh-header'
                >
                    <Typography sx={{ width: '33%', flexShrink: 0 }}>
                        Decompression Stops
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                        Insert stops
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Divider light />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography
                                    variant='h5'
                                    sx={{ marginTop: '1rem' }}
                                >
                                    Insert stop
                                </Typography>{' '}
                                <Button
                                    variant='outline'
                                    sx={{ marginTop: '1rem' }}
                                    onClick={createNewStop}
                                >
                                    <ControlPointIcon />
                                </Button>
                            </Box>
                        </Grid>
                        {renderStops()}
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Grid>
    );
};

const Equipments = ({ values, handleChange }) => {
    const accessoriesOptions = [
        { name: 'Dive computer', id: 'computer' },
        { name: 'Dive Lights', id: 'lights' },
        { name: 'Compass', id: 'compass' },
        { name: 'Gloves', id: 'gloves' },
        { name: 'Surface Signaling Devices', id: 'ssd' },
        { name: 'Dive Knife', id: 'knife' },
        { name: 'Backup mask', id: 'backupmask' },
        { name: 'Camera', id: 'camera' },
    ];

    return (
        <Grid item xs={12} sm={12}>
            <Accordion sx={{ marginTop: '1rem' }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel1bh-content'
                    id='panel1bh-header'
                >
                    <Typography sx={{ width: '33%', flexShrink: 0 }}>
                        Equipments
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                        Tools and equipment
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Divider light />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <Typography variant='h5' sx={{ marginTop: '1rem' }}>
                                Scuba tank
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='capacity'
                                label='Cylinder capacity'
                                type='text'
                                id='capacity'
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            L
                                        </InputAdornment>
                                    ),
                                }}
                                value={values.capacity ?? ''}
                                onChange={(value) => {
                                    handleChange(
                                        value.target.value,
                                        'capacity'
                                    );
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='oxigen'
                                label='%O2'
                                type='text'
                                id='oxigen'
                                value={values.oxigen ?? ''}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            %
                                        </InputAdornment>
                                    ),
                                }}
                                onChange={(value) => {
                                    handleChange(value.target.value, 'oxigen');
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={12}>
                            <Typography variant='h5' sx={{ marginTop: '1rem' }}>
                                Diving suit
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='suit-type'
                                label='Suit type'
                                select
                                id='suit-type'
                                value={values.suitType ?? ''}
                                onChange={(value) => {
                                    console.log(value);
                                    handleChange(
                                        value.target.value,
                                        'suitType'
                                    );
                                }}
                                placeholder={'Select suit type'}
                            >
                                <MenuItem value='drysuit'>Dry suit</MenuItem>
                                <MenuItem value='semidrysuit'>
                                    Semi-dry suit
                                </MenuItem>
                                <MenuItem value='wetsuit'>Wet suit</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='thickness'
                                label='Thickness of the suit'
                                type='text'
                                id='thickness'
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            mm
                                        </InputAdornment>
                                    ),
                                }}
                                value={values.thickness ?? ''}
                                onChange={(value) => {
                                    handleChange(
                                        value.target.value,
                                        'thickness'
                                    );
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <Typography variant='h5' sx={{ marginTop: '1rem' }}>
                                Accessories
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <FormControl sx={{ m: 1, width: '100%' }}>
                                <InputLabel id='accessories-label'>
                                    Name
                                </InputLabel>
                                <Select
                                    fullWidth
                                    labelId='accessories-label'
                                    id='accessories'
                                    name='accessories'
                                    multiple
                                    value={values.accessories ?? []}
                                    onChange={(value) => {
                                        console.log(value);
                                        handleChange(
                                            value.target.value,
                                            'accessories'
                                        );
                                    }}
                                    input={<OutlinedInput label='Name' />}
                                >
                                    {accessoriesOptions.map((element) => (
                                        <MenuItem
                                            key={element.id}
                                            value={element.id}
                                        >
                                            {element.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Grid>
    );
};

const DivingParams = ({ values, handleChange }) => {
    return (
        <Grid item xs={12} sm={12}>
            <Accordion sx={{ marginTop: '1rem' }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel1bh-content'
                    id='panel1bh-header'
                >
                    <Typography sx={{ width: '33%', flexShrink: 0 }}>
                        Diving parameters
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                        Temperature & tank pressure
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Divider light />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <Typography variant='h5' sx={{ marginTop: '1rem' }}>
                                Tank pressure
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='tank-pressure-in'
                                label='Tank pressure on enter'
                                type='text'
                                id='tank-pressure-in'
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            PSI
                                        </InputAdornment>
                                    ),
                                }}
                                value={values['tank-pressure-in'] ?? ''}
                                onChange={(value) => {
                                    handleChange(
                                        value.target.value,
                                        'tank-pressure-in'
                                    );
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='tank-pressure-out'
                                label='Tank pressure on exit'
                                type='text'
                                id='tank-pressure-out'
                                value={values['tank-pressure-out'] ?? ''}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            PSI
                                        </InputAdornment>
                                    ),
                                }}
                                onChange={(value) => {
                                    handleChange(
                                        value.target.value,
                                        'tank-pressure-out'
                                    );
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={12}>
                            <Typography variant='h5' sx={{ marginTop: '1rem' }}>
                                Temperature
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='air-temperature'
                                label='Air temperature'
                                type='text'
                                id='air-temperature'
                                value={values['air-temperature'] ?? ''}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            C°
                                        </InputAdornment>
                                    ),
                                }}
                                onChange={(value) => {
                                    handleChange(
                                        value.target.value,
                                        'air-temperature'
                                    );
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='water-temperature'
                                label='Water temperature'
                                type='text'
                                id='water-temperature'
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            C°
                                        </InputAdornment>
                                    ),
                                }}
                                value={values['water-temperature'] ?? ''}
                                onChange={(value) => {
                                    handleChange(
                                        value.target.value,
                                        'water-temperature'
                                    );
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <Typography variant='h5' sx={{ marginTop: '1rem' }}>
                                Ballast
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='ballast'
                                label='Ballast'
                                type='text'
                                id='ballast'
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            Kg
                                        </InputAdornment>
                                    ),
                                }}
                                value={values.ballast ?? ''}
                                onChange={(value) => {
                                    handleChange(value.target.value, 'ballast');
                                }}
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Grid>
    );
};

export default CreateLog;
