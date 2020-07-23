import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// material ui components
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';

//icons
import ChevronRight from '@material-ui/icons/ChevronRight';

//styles
import useStyles from './styles/wilayah';

// //hooks
import { usePouchDB } from '../../../components/PouchDB/PouchDBProvider';
import { useSnackbar } from 'notistack';

//app components
import { ScrollToTopWithoutRouter } from '../../../components/ScrollToTop';

import { Swipeable } from 'react-swipeable';

import isInt from 'validator/lib/isInt';

// redux implementation
import { withRouter } from "react-router-dom";
// import { connect } from "react-redux";
// import { setKeluarga } from "../../../actions/keluarga";
import { compose } from "redux";

function Wilayah({ wilayah, setWilayah, handleNext, mode, setKeluarga, keluarga, history }) {
    const classes = useStyles();
    const nextRef = useRef(null)
    const { user: { metadata } } = usePouchDB();
    //console.log(user)
    const { enqueueSnackbar } = useSnackbar();
    const [error, setError] = useState({

    })

    const [isSomethingChange, setSomethingChange] = useState(false);

    const [isSubmitting, setSubmitting] = useState(false);

    // PERUBAHAN AMBIL YANG RT RW BKKBN
    useEffect(() => {
        if (!wilayah.hasOwnProperty('no_kk')) {
            setWilayah({
                ...wilayah,
                // ['no_kk'] : Date.now().toString()
                // ['no_kk'] : `${metadata.wil_provinsi.id_provinsi}${metadata.wil_kabupaten.id_kabupaten}${metadata.wil_kecamatan.id_kecamatan}${metadata.wil_kelurahan.id_kelurahan}`
            })
        }

    }, []);
    // END PERUBAHAN AMBIL YANG RT RW BKKBN

    const handleChange = (e) => {

        if (e.target.type === "number") {
            if (parseInt(e.target.value) < 0)
                return false;

            // if (e.target.name === "no_kk" && e.target.value.length > 16) {
            //     return false;
            // }

            if (e.target.name === "no_urutkel" && e.target.value.length > 3) {
                return false;
            }

            if (e.target.name === "no_rmh" && e.target.value.length > 3) {
                return false;
            }

            if (e.target.name === "no_telepon" && e.target.value.length > 13) {
                return false;
            }
        }

        setWilayah({
            ...wilayah,
            [e.target.name]: e.target.value
        })
        setError({
            ...error,
            [e.target.name]: ""
        })

        setSomethingChange(true)
    }

    const validate = () => {
        let newError = {};

        if (!wilayah.id_rw) {
            newError.id_rw = "RW/Dusun wajib diisi";
        }

        if (!wilayah.id_rt) {
            newError.id_rt = "RT wajib diisi";
        }
        if (!wilayah.no_rmh) {
            newError.no_rmh = "No. Rumah wajib diisi";
        } else if (wilayah.no_rmh.length < 3) {
            newError.no_rmh = "No. Rumah harus 3 digit"
        }
        else if (!isInt(wilayah.no_rmh) || parseInt(wilayah.no_rmh) <= 0) {
            newError.no_rmh = "No. Rumah tidak valid";
        }

        if (!wilayah.no_urutkel) {
            newError.no_urutkel = "No. Urut Keluarga wajib diisi";
        } else if (!isInt(wilayah.no_urutkel) || parseInt(wilayah.no_urutkel) <= 0) {
            newError.no_urutkel = "No. Urut Keluarga tidak valid";
        } else if (wilayah.no_urutkel.length < 3) {
            newError.no_urutkel = "No. Urut Keluarga harus 3 digit"
        }
        // if (!wilayah.no_kk) {
        //     newError.no_kk = "No. Kartu Keluarga (KK) wajib diisi";
        // } else if (wilayah.no_kk.length !== 16) {
        //     newError.no_kk = "No. Kartu Keluarga (KK) harus 16 digit";
        // }

        if (!wilayah.jumlah_keluarga) {
            newError.jumlah_keluarga = "Jumlah Anggota Keluarga wajib diisi";
        } else if (!isInt(wilayah.jumlah_keluarga) || parseInt(wilayah.jumlah_keluarga) <= 0) {
            newError.jumlah_keluarga = "Jumlah Anggota Keluarga tidak valid";
        }

        if (!wilayah.alamat) {
            newError.alamat = "Alamat wajib diisi";
        }

        return newError;

    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const findErrors = validate();

        const errorValues = Object.values(findErrors);

        if (errorValues.length > 0 && errorValues.some(err => err !== '')) {
            setError(findErrors);
        } else {
            if (!isSomethingChange) {
                return handleNext()
            }

            //simpan ke db local
            setSubmitting(true);
            try {
                // setKeluarga('keluarga submit');
                // const existing = await dataKK.local.get(wilayah.no_kk)


                // await dataKK.local.put({
                //     _id: wilayah.no_kk,
                //     _rev: existing._rev,
                //     type: 'utama',
                //     ...wilayah
                // })

                // init rw and rt
                let id_rw_bkkbn = metadata.wil_rw.find(rw => parseInt(rw.id_rw) === parseInt(wilayah.id_rw)).id_rw_bkkbn
                let id_rt_bkkbn = metadata.wil_rw.find(rw => parseInt(rw.id_rw) === parseInt(wilayah.id_rw)).wil_rt.find(rt => parseInt(rt.id_rt) === parseInt(wilayah.id_rt)).id_rt_bkkbn

                setWilayah({
                    ...wilayah,
                    ['id_rw_bkkbn'] : `${id_rw_bkkbn}`,
                    ['id_rt_bkkbn'] : `${id_rt_bkkbn}`,
                    ['no_kk']: `${metadata.wil_provinsi.id_provinsi_depdagri}${metadata.wil_kabupaten.id_kabupaten_depdagri}${metadata.wil_kecamatan.id_kecamatan_depdagri}${metadata.wil_kelurahan.id_kelurahan_depdagri}${id_rw_bkkbn}${id_rt_bkkbn}${wilayah.no_rmh}${wilayah.no_urutkel}`
                })

                console.log(wilayah.no_kk)

                setSomethingChange(false);
                handleNext()

            } catch (e) {

                setSubmitting(false);
                if (e.name === 'not_found') {
                    try {
                        // await dataKK.local.put({
                        //     _id: wilayah.no_kk,
                        //     type: 'utama',
                        //     ...wilayah
                        // })

                        setSomethingChange(false);
                        handleNext()
                    } catch (e) {
                        enqueueSnackbar(e.message, { variant: 'error' })
                    }


                } else {
                    enqueueSnackbar(e.message, { variant: 'error' })
                }
            }


        }
        console.log(wilayah);
        console.log(wilayah.no_kk)
    }

    return (
        <Swipeable
            trackMouse={true}

            onSwipedLeft={(e) => {
                console.log('selanjutnya')
                if (nextRef) {

                    nextRef.current.click();
                }
            }}
        >
            <form onSubmit={handleSubmit} className={classes.form}>
                <ScrollToTopWithoutRouter />
                <Grid container spacing={3}>

                    <Grid item xs={12} className={classes.textCenter}>
                        <Typography variant="h5" component="h1">{mode === 'edit' ? `Edit Form Data Kependudukan` : 'Form Data Kependudukan'}</Typography>
                        {/* {mode === 'edit' && <Typography>No KK: {wilayah.no_kk}</Typography>} */}

                    </Grid>
                    <Grid item xs={12}>
                        <Divider />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography>Provinsi: {metadata.wil_provinsi.nama_provinsi}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography>Kabupaten/Kota: {metadata.wil_kabupaten.nama_kabupaten}</Typography>

                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography>Kecamatan: {metadata.wil_kecamatan.nama_kecamatan}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography>Desa/Kel: {metadata.wil_kelurahan.nama_kelurahan}</Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl
                            disabled={isSubmitting}
                            variant="outlined" fullWidth error={error.id_rw ? true : false}>

                            <Select
                                id="id_rw"
                                value={wilayah.id_rw || ''}
                                onChange={handleChange}
                                name="id_rw"
                                displayEmpty
                            >
                                <MenuItem value="">Pilih RW/Dusun</MenuItem>

                                {metadata.wil_rw.map(rw => <MenuItem key={rw.id_rw} value={rw.id_rw}>{rw.nama_rw}</MenuItem>)}
                            </Select>
                            <FormHelperText>{error.id_rw}</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl
                            disabled={isSubmitting || !wilayah.id_rw}
                            variant="outlined" fullWidth error={error.id_rt ? true : false}>

                            <Select
                                id="id_rt"
                                value={wilayah.id_rt || ''}
                                onChange={handleChange}
                                name="id_rt"
                                displayEmpty
                            >
                                <MenuItem value="">Pilih RT</MenuItem>
                                {wilayah.id_rw &&
                                    metadata.wil_rw.find(rw => parseInt(rw.id_rw) === parseInt(wilayah.id_rw)).wil_rt.map(rt => <MenuItem key={rt.id_rt} value={rt.id_rt}>{rt.nama_rt}</MenuItem>)}


                            </Select>
                            <FormHelperText>{error.id_rt}</FormHelperText>
                        </FormControl>

                    </Grid>
                    <Grid item xs={12} md={4}>

                        <TextField
                            disabled={isSubmitting}
                            fullWidth
                            variant="outlined"
                            placeholder="No. Rumah"
                            value={wilayah.no_rmh || ''}
                            name="no_rmh"
                            id="no_rmh"
                            // type="number"
                            type="number"
                            inputProps={{

                                min: 0,
                                maxLength: 3
                            }}
                            onChange={handleChange}
                            error={error.no_rmh ? true : false}
                            helperText={error.no_rmh}
                        />

                    </Grid>
                    <Grid item xs={12} md={4}>

                        <TextField
                            disabled={isSubmitting}
                            fullWidth
                            variant="outlined"
                            placeholder="No. Urut Keluarga"
                            value={wilayah.no_urutkel || ''}
                            name="no_urutkel"
                            id="no_urutkel"
                            type="number"
                            inputProps={{

                                min: 0,
                                maxLength: 3
                            }}
                            onChange={handleChange}
                            error={error.no_urutkel ? true : false}
                            helperText={error.no_urutkel}
                        />

                    </Grid>
                    <Grid item xs={12} md={4}>

                        <TextField
                            disabled={isSubmitting}
                            fullWidth
                            variant="outlined"
                            placeholder="No. Telepon/Hp"
                            value={wilayah.no_telepon || ''}
                            name="no_telepon"
                            id="no_telepon"
                            type="number"
                            inputProps={{

                                min: 0,
                                maxLength: 13
                            }}
                            onChange={handleChange}
                        />

                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            disabled={isSubmitting}
                            fullWidth
                            variant="outlined"
                            placeholder="Jumlah Anggota Keluarga"
                            value={wilayah.jumlah_keluarga || ''}
                            name="jumlah_keluarga"
                            id="jumlah_keluarga"
                            type="number"
                            inputProps={{

                                min: 0
                            }}
                            onChange={handleChange}
                            error={error.jumlah_keluarga ? true : false}
                            helperText={error.jumlah_keluarga}
                        />
                    </Grid>
                    <Grid item xs={12} >
                        <TextField
                            disabled={isSubmitting}
                            fullWidth
                            variant="outlined"
                            placeholder="Alamat"
                            multiline
                            rows={2}
                            rowsMax={2}
                            value={wilayah.alamat || ''}
                            name="alamat"
                            id="alamat"

                            onChange={handleChange}
                            error={error.alamat ? true : false}
                            helperText={error.alamat}
                        />
                    </Grid>
                    {/* <Grid item xs={12} md={6}>
                        <TextField
                            disabled={isSubmitting}
                            fullWidth
                            variant="outlined"
                            placeholder="Alamat 2"
                            multiline
                            rows={2}
                            rowsMax={2}
                            value={wilayah.alamat_2 || ''}
                            name="alamat_2"
                            id="alamat_2"

                            onChange={handleChange}
                            error={error.alamat_2 ? true : false}
                            helperText={error.alamat_2}
                        />
                    </Grid> */}
                    <Grid item xs>


                    </Grid>
                    <Grid item >
                        {isSubmitting && <CircularProgress size={14} />}
                        <Button
                            ref={nextRef}
                            disabled={isSubmitting}
                            type="submit">Selanjutnya <ChevronRight className={classes.iconRight} /></Button>
                    </Grid>

                </Grid>

            </form>
        </Swipeable>
    )
}


Wilayah.propTypes = {
    wilayah: PropTypes.any.isRequired,
    setWilayah: PropTypes.func.isRequired
}

// export default compose(connect(
//     ({ keluarga }) => ({
//         keluarga
//     }),
//     { setKeluarga }
// ), withRouter)
//     (Wilayah);
//

export default Wilayah;