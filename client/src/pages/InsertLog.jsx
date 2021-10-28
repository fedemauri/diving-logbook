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
import CancelIcon from '@mui/icons-material/CancelTwoTone';
import Compressor from 'compressorjs';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Badge,
    Chip,
    Divider,
    FormControl,
    FormHelperText,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
} from '@mui/material';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { useState } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../config/firebase';
import { coordinateMatch } from '../helper/helper';
import { isValid } from 'date-fns';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { FormattedMessage, injectIntl } from 'react-intl';
const MapCoordinateModal = React.lazy(() =>
    import(
        /* webpackChunkName: "MapCoordinateModal" */ '../container/MapCoordinateModal'
    )
);

const theme = createTheme();

function CreateLog({ intl }) {
    const [values, setValue] = useState({});
    const [stops, setStops] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [openMapModal, setOpenMapModal] = useState(false);
    const user = auth.currentUser;
    const userUid = user.uid;

    const handleChange = (newValue, field) => {
        setValue({ ...values, [field]: newValue });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (
            values?.coordinate &&
            !coordinateMatch(values?.coordinate) &&
            values?.date &&
            !isValid(values?.date)
        )
            return false;

        const userCollection = collection(db, 'user', userUid, 'log');
        addDoc(userCollection, {
            ...values,
            stops: stops,
        })
            .then((response) => {
                if (response?.id && (!photos || photos.length === 0))
                    window.location.href = `/details/${response.id}`;
                else if (response?.id)
                    uploadPhoto(response.id, () => {
                        window.location.href = `/details/${response.id}`;
                    });
            })
            .catch((e) => {
                console.error(e);
            });
    };

    const uploadPhoto = (logId, callback) => {
        if (photos && photos.length !== 0 && logId) {
            const uploadPromises = [];
            const storageRefs = [];

            //Upload images and save promises and refs
            photos.map((image) => {
                const storageRef = ref(storage, `${logId}/${image.name}`);
                const promise = uploadBytes(storageRef, image);
                uploadPromises.push(promise);
                storageRefs.push(storageRef);
            });

            //Use refs to get urls
            Promise.allSettled(uploadPromises).then((results) => {
                const downloadUrls = [];
                results.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        const urlPromise = getDownloadURL(storageRefs[index]);

                        //Store all urls
                        downloadUrls.push(urlPromise);
                    }
                });
                Promise.allSettled(downloadUrls).then((urlRes) => {
                    const urlToPush = [];
                    //After url getting store and update log
                    urlRes.forEach((url) => {
                        if (url && url.status === 'fulfilled') {
                            urlToPush.push(url.value);
                        }
                    });
                    const photoRef = doc(db, 'user', userUid, 'log', logId);
                    updateDoc(photoRef, {
                        photosUrl: urlToPush,
                    }).then(() => callback());
                });
            });
        }
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
                        <FormattedMessage
                            id='create diving log'
                            defaultMessage='Create Diving Log'
                        />
                    </Typography>
                    <LogForm
                        handleSubmit={handleSubmit}
                        handleChange={handleChange}
                        values={values}
                        setOpenMapModal={setOpenMapModal}
                        stops={stops}
                        setStops={setStops}
                        photos={photos}
                        setPhotos={setPhotos}
                        readOnly={false}
                        intl={intl}
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

const PhotoPreview = ({ photo, removePhoto }) => {
    const img = photo ? URL.createObjectURL(photo) : null;
    const alt = photo ? photo.name : null;
    return (
        <div style={{ marginRight: '1rem' }}>
            <Badge
                overlap='circular'
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                badgeContent={
                    <CancelIcon
                        sx={{ cursor: 'pointer', color: '#4e4e4e' }}
                        onClick={removePhoto}
                    />
                }
            >
                <Avatar src={img} alt={alt} sx={{ width: 80, height: 80 }} />
            </Badge>
        </div>
    );
};

const LogForm = ({
    handleSubmit,
    handleChange,
    values,
    setOpenMapModal,
    stops,
    setStops,
    photos,
    setPhotos,
    readOnly,
    intl,
}) => {
    const removePhoto = (index) => {
        const tempPhotos = [...photos];
        tempPhotos.splice(index, 1);
        setPhotos(tempPhotos);
    };

    const addPhotos = (files) => {
        const allCompressedImage = [];
        const promise = new Promise((resolve) => {
            files.map((file) => {
                new Compressor(file, {
                    quality: 0.7,
                    mimeType: 'image/webp',
                    maxHeight: 1080,
                    success(result) {
                        const file = new File([result], result.name);
                        allCompressedImage.push(file);
                        if (allCompressedImage.length === files.length)
                            resolve(allCompressedImage);
                    },
                    error(err) {
                        console.error(err.message);
                    },
                });
            });
        });

        promise
            .then((data) => {
                setPhotos([...photos, ...data]);
            })
            .catch((e) => console.error(e));
    };
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
                            label={intl.formatMessage({ id: 'date & time' })}
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
                                    type='datetime-local'
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
                        label={intl.formatMessage({ id: 'place' })}
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
                        label={intl.formatMessage({ id: 'coordinate' })}
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
                            {intl.formatMessage({ id: 'coordinate example' })}
                        </FormHelperText>
                    )}
                </Grid>
                <DivingLog
                    values={values}
                    handleChange={handleChange}
                    readOnly={readOnly}
                    intl={intl}
                />
                <DecompressionStops
                    stops={stops}
                    setStops={setStops}
                    readOnly={readOnly}
                    intl={intl}
                />
                <DivingParams
                    values={values}
                    handleChange={handleChange}
                    readOnly={readOnly}
                    intl={intl}
                />
                <Equipments
                    values={values}
                    handleChange={handleChange}
                    readOnly={readOnly}
                    intl={intl}
                />
                <Grid item xs={12} sm={readOnly ? 6 : 5}>
                    <TextField
                        margin='normal'
                        fullWidth
                        name='guide'
                        label={intl.formatMessage({ id: 'guide' })}
                        type='text'
                        id='guide'
                        disabled={readOnly}
                        value={values['guide'] ?? ''}
                        onChange={(value) => {
                            handleChange(value.target.value, 'guide');
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={readOnly ? 6 : 5}>
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
                                label={intl.formatMessage({
                                    id: 'partners',
                                })}
                                type='text'
                                id='partners'
                                disabled={readOnly}
                            />
                        )}
                    />
                    {!readOnly && (
                        <FormHelperText id='component-helper-text'>
                            {intl.formatMessage({
                                id: 'insert name and press enter to add partner tag',
                            })}
                        </FormHelperText>
                    )}
                </Grid>
                {!readOnly && (
                    <>
                        {' '}
                        <Grid item xs={12} sm={2}>
                            <div
                                style={{
                                    marginTop: '1.5rem',
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                }}
                            >
                                <label htmlFor='contained-button-file'>
                                    <Input
                                        accept='image/*'
                                        id='contained-button-file'
                                        multiple
                                        type='file'
                                        sx={{ display: 'none' }}
                                        onChange={(e) =>
                                            addPhotos([...e.target.files])
                                        }
                                        inputProps={{
                                            accept: 'image/*',
                                            multiple: true,
                                        }}
                                    />
                                    <Button
                                        variant='contained'
                                        component='span'
                                    >
                                        {intl.formatMessage({
                                            id: 'upload photos',
                                        })}
                                    </Button>
                                </label>
                            </div>
                        </Grid>
                        {photos && photos.length !== 0 && (
                            <Grid item xs={12} sm={12}>
                                <Box
                                    sx={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        overflow: 'auto',
                                    }}
                                >
                                    {photos.map((photo, index) => (
                                        <PhotoPreview
                                            key={photo.name}
                                            photo={photo}
                                            removePhoto={() =>
                                                removePhoto(index)
                                            }
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}
                    </>
                )}

                <Grid item xs={12} sm={12}>
                    <TextField
                        sx={{ width: '100%' }}
                        placeholder={intl.formatMessage({
                            id: 'notes',
                        })}
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
                    {intl.formatMessage({
                        id: 'Save',
                    })}
                </Button>
            )}
        </Box>
    );
};

const DivingLog = ({ values, handleChange, readOnly, intl }) => {
    return (
        <>
            <Grid item xs={12} sm={6}>
                <TextField
                    margin='normal'
                    fullWidth
                    name='max-depth'
                    label={intl.formatMessage({
                        id: 'max depth',
                    })}
                    type='number'
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
                    label={intl.formatMessage({
                        id: 'dive time',
                    })}
                    type='number'
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

const DecompressionStops = ({ stops, setStops, readOnly, intl }) => {
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
                                label={intl.formatMessage({
                                    id: 'meter stop',
                                })}
                                type='number'
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
                                label={intl.formatMessage({
                                    id: 'time stop',
                                })}
                                type='number'
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
                        {intl.formatMessage({
                            id: 'decompression stops',
                        })}
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
                                        {intl.formatMessage({
                                            id: 'insert stops',
                                        })}
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

const Equipments = ({ values, handleChange, readOnly, intl }) => {
    const accessoriesOptions = [
        {
            name: intl.formatMessage({
                id: 'dive computer',
            }),
            id: 'computer',
        },
        {
            name: intl.formatMessage({
                id: 'dive lights',
            }),
            id: 'lights',
        },
        {
            name: intl.formatMessage({
                id: 'compass',
            }),
            id: 'compass',
        },
        {
            name: intl.formatMessage({
                id: 'gloves',
            }),
            id: 'gloves',
        },
        {
            name: intl.formatMessage({
                id: 'surface signaling devices',
            }),
            id: 'ssd',
        },
        {
            name: intl.formatMessage({
                id: 'dive knife',
            }),
            id: 'knife',
        },
        {
            name: intl.formatMessage({
                id: 'backup mask',
            }),
            id: 'backupmask',
        },
        {
            name: intl.formatMessage({
                id: 'camera',
            }),
            id: 'camera',
        },
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
                        {intl.formatMessage({
                            id: 'equipments',
                        })}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Divider light />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <Typography variant='h5' sx={{ marginTop: '1rem' }}>
                                {intl.formatMessage({
                                    id: 'scuba tank',
                                })}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='capacity'
                                label={intl.formatMessage({
                                    id: 'cylinder capacity',
                                })}
                                type='number'
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
                                label={intl.formatMessage({
                                    id: '%02',
                                })}
                                type='number'
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
                                label={intl.formatMessage({
                                    id: 'suit type',
                                })}
                                select
                                id='suit-type'
                                type='number'
                                disabled={readOnly}
                                value={values.suitType ?? ''}
                                onChange={(value) => {
                                    handleChange(
                                        value.target.value,
                                        'suitType'
                                    );
                                }}
                                placeholder={intl.formatMessage({
                                    id: 'select suit type',
                                })}
                            >
                                <MenuItem value='drysuit'>
                                    {intl.formatMessage({
                                        id: 'dry suit',
                                    })}
                                </MenuItem>
                                <MenuItem value='semidrysuit'>
                                    {intl.formatMessage({
                                        id: 'semi dry suit',
                                    })}
                                </MenuItem>
                                <MenuItem value='wetsuit'>
                                    {intl.formatMessage({
                                        id: 'wet suit',
                                    })}
                                </MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='thickness'
                                label={intl.formatMessage({
                                    id: 'thickness of the suit',
                                })}
                                type='number'
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
                                {intl.formatMessage({
                                    id: 'Accessories',
                                })}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <FormControl sx={{ m: 1, width: '100%' }}>
                                <InputLabel id='accessories-label'>
                                    {intl.formatMessage({
                                        id: 'accessories',
                                    })}
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
                                    input={
                                        <OutlinedInput
                                            label={intl.formatMessage({
                                                id: 'accessories',
                                            })}
                                        />
                                    }
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

const DivingParams = ({ values, handleChange, readOnly, intl }) => {
    return (
        <Grid item xs={12} sm={12}>
            <Accordion sx={{ marginTop: '1rem' }} defaultExpanded={readOnly}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel1bh-content'
                    id='panel1bh-header'
                >
                    <Typography sx={{ width: '33%', flexShrink: 0 }}>
                        {intl.formatMessage({
                            id: 'diving parameters',
                        })}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Divider light />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <Typography variant='h5' sx={{ marginTop: '1rem' }}>
                                {intl.formatMessage({
                                    id: 'tank pressure',
                                })}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='tank-pressure-in'
                                label={intl.formatMessage({
                                    id: 'tank pressure on enter',
                                })}
                                type='number'
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
                                label={intl.formatMessage({
                                    id: 'tank pressure on exit',
                                })}
                                type='number'
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
                                {intl.formatMessage({
                                    id: 'temperature',
                                })}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='air-temperature'
                                label={intl.formatMessage({
                                    id: 'air temperature',
                                })}
                                type='number'
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
                                label={intl.formatMessage({
                                    id: 'water temperature',
                                })}
                                type='number'
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
                                {intl.formatMessage({
                                    id: 'ballast',
                                })}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                margin='normal'
                                fullWidth
                                name='ballast'
                                label={intl.formatMessage({
                                    id: 'ballast',
                                })}
                                type='number'
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

export default injectIntl(CreateLog);
export { LogForm, DivingLog, DecompressionStops, Equipments, DivingParams };
