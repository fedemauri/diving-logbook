import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
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
import PublicIcon from '@mui/icons-material/Public';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Chip,
    Divider,
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
} from '@mui/material';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { coordinateMatch } from '../helper/helper';
const MapCoordinateModal = React.lazy(() =>
    import(
        /* webpackChunkName: "MapCoordinateModal" */ '../container/MapCoordinateModal'
    )
);

const theme = createTheme();

function CreateLog() {
    const [values, setValue] = useState({});
    const [stops, setStops] = useState([]);
    const [openMapModal, setOpenMapModal] = useState(false);

    const handleChange = (newValue, field) => {
        setValue({ ...values, [field]: newValue });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const user = auth.currentUser;
        const userUid = user.uid;

        if (values?.coordinate && !coordinateMatch(values?.coordinate))
            return false;

        const userCollection = collection(db, 'user', userUid, 'log');
        addDoc(userCollection, {
            ...values,
            stops: stops,
        })
            .then((response) => {
                if (response?.id)
                    window.location.href = `/details/${response.id}`;
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
                        marginTop: 4,
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
                    <LogForm
                        handleSubmit={handleSubmit}
                        handleChange={handleChange}
                        values={values}
                        setOpenMapModal={setOpenMapModal}
                        stops={stops}
                        setStops={setStops}
                        readOnly={false}
                    />
                </Box>
                {openMapModal && (
                    <MapCoordinateModal
                        handleClose={setOpenMapModal}
                        open={openMapModal}
                        setCoordinate={(value) =>
                            handleChange(value, 'coordinate')
                        }
                    />
                )}
            </Container>
        </ThemeProvider>
    );
}

const LogForm = ({
    handleSubmit,
    handleChange,
    values,
    setOpenMapModal,
    stops,
    setStops,
    readOnly,
}) => {
    return (
        <Box
            component='form'
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: '100%' }}
        >
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                            label='Date & Time'
                            name='datetime'
                            id='datetime'
                            value={values.date ?? null}
                            onChange={(value) => {
                                handleChange(value, 'date');
                            }}
                            required
                            disabled={readOnly}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    margin='normal'
                                    sx={{ width: '100%' }}
                                    required
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
                        disabled={readOnly}
                        value={values.place ?? ''}
                        onChange={(value) => {
                            handleChange(value.target.value, 'place');
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
                        disabled={readOnly}
                        error={
                            values?.coordinate &&
                            !coordinateMatch(values?.coordinate)
                        }
                        InputProps={{
                            endAdornment: (
                                <>
                                    {readOnly && <></>}
                                    {!readOnly && (
                                        <IconButton
                                            aria-label='show map'
                                            onClick={() => {
                                                if (!readOnly)
                                                    setOpenMapModal(true);
                                            }}
                                            onMouseDown={(event) =>
                                                event.preventDefault()
                                            }
                                            edge='end'
                                        >
                                            <PublicIcon />
                                        </IconButton>
                                    )}
                                </>
                            ),
                        }}
                        value={values.coordinate ?? ''}
                        onChange={(value) => {
                            handleChange(value.target.value, 'coordinate');
                        }}
                    />
                    {!readOnly && (
                        <FormHelperText id='component-helper-text'>
                            Use "45.160, 8.969" format
                        </FormHelperText>
                    )}
                </Grid>
                <DivingLog
                    values={values}
                    handleChange={handleChange}
                    readOnly={readOnly}
                />
                <DecompressionStops
                    stops={stops}
                    setStops={setStops}
                    readOnly={readOnly}
                />
                <DivingParams
                    values={values}
                    handleChange={handleChange}
                    readOnly={readOnly}
                />
                <Equipments
                    values={values}
                    handleChange={handleChange}
                    readOnly={readOnly}
                />
                <Grid item xs={12} sm={6}>
                    <TextField
                        margin='normal'
                        fullWidth
                        name='guide'
                        label='Guide'
                        type='text'
                        id='guide'
                        disabled={readOnly}
                        value={values['guide'] ?? ''}
                        onChange={(value) => {
                            handleChange(value.target.value, 'guide');
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Autocomplete
                        multiple
                        id='partners'
                        options={[]}
                        freeSolo
                        disabled={readOnly}
                        onChange={(event, newValue) => {
                            event.preventDefault();
                            handleChange(newValue, 'partners');
                        }}
                        value={values['partners'] ?? []}
                        renderTags={(value, getTagProps) => {
                            return value.map((option, index) => {
                                let props = { ...getTagProps({ index }) };
                                if (readOnly)
                                    props = {
                                        ...getTagProps({ index }),
                                        onDelete: null,
                                    };
                                return (
                                    <Chip
                                        variant='outlined'
                                        label={option}
                                        {...props}
                                    />
                                );
                            });
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                margin='normal'
                                fullWidth
                                name='partners'
                                label='Partners'
                                type='text'
                                id='partners'
                                disabled={readOnly}
                            />
                        )}
                    />
                    {!readOnly && (
                        <FormHelperText id='component-helper-text'>
                            Insert name and press enter to add partner tag
                        </FormHelperText>
                    )}
                </Grid>
                <Grid item xs={12} sm={12}>
                    <TextField
                        sx={{ width: '100%' }}
                        placeholder='Notes'
                        multiline
                        rows={3}
                        disabled={readOnly}
                        onChange={(value) => {
                            handleChange(value.target.value, 'note');
                        }}
                    />
                </Grid>
            </Grid>
            {!readOnly && (
                <Button
                    type='submit'
                    fullWidth
                    variant='contained'
                    sx={{ mt: 3 }}
                >
                    Save
                </Button>
            )}
        </Box>
    );
};

const DivingLog = ({ values, handleChange, readOnly }) => {
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
                    required
                    disabled={readOnly}
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
                    required
                    label='Dive Time'
                    type='text'
                    id='dive-time'
                    disabled={readOnly}
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

const DecompressionStops = ({ stops, setStops, readOnly }) => {
    const createNewStop = () => {
        setStops([...stops, { meter: '', time: '' }]);
    };

    const handleStopEdit = (index, type, value) => {
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
                                disabled={readOnly}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            m
                                        </InputAdornment>
                                    ),
                                }}
                                value={element.meter}
                                onChange={(value) => {
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
                                disabled={readOnly}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            min
                                        </InputAdornment>
                                    ),
                                }}
                                value={element.time}
                                onChange={(value) => {
                                    handleStopEdit(
                                        index,
                                        'time',
                                        value.target.value
                                    );
                                }}
                            />
                        </Grid>
                        {!readOnly && (
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
                        )}
                    </React.Fragment>
                );
            });
    };

    return (
        <Grid item xs={12} sm={12}>
            <Accordion sx={{ marginTop: '1rem' }} defaultExpanded={readOnly}>
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
                    <Grid
                        container
                        spacing={2}
                        justifyContent='center'
                        alignItems='center'
                    >
                        {!readOnly && (
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
                        )}

                        {renderStops()}
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Grid>
    );
};

const Equipments = ({ values, handleChange, readOnly }) => {
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
            <Accordion sx={{ marginTop: '1rem' }} defaultExpanded={readOnly}>
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
                                disabled={readOnly}
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
                                disabled={readOnly}
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
                                disabled={readOnly}
                                value={values.suitType ?? ''}
                                onChange={(value) => {
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
                                disabled={readOnly}
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
                                    disabled={readOnly}
                                    value={values.accessories ?? []}
                                    onChange={(value) => {
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

const DivingParams = ({ values, handleChange, readOnly }) => {
    return (
        <Grid item xs={12} sm={12}>
            <Accordion sx={{ marginTop: '1rem' }} defaultExpanded={readOnly}>
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
                                disabled={readOnly}
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
                                disabled={readOnly}
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
                                disabled={readOnly}
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
                                disabled={readOnly}
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
                                disabled={readOnly}
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
export { LogForm, DivingLog, DecompressionStops, Equipments, DivingParams };
