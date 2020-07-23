import React, { useEffect, useState } from 'react';

// material-ui
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import ButtonBase from '@material-ui/core/ButtonBase';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';

//icons
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';


// app components
import { usePouchDB } from '../../../components/PouchDB/PouchDBProvider';
import AppPageLoading from '../../../components/AppPageLoading';
//utils
//import uuidv1 from 'uuid/v1';
// styles
import useStyles from './styles';

// images
import kb from '../../../images/kb.png';

//utils 
import qs from 'query-string';
import { Link, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { FormControl, Select, MenuItem } from '@material-ui/core';


function Home({ history, match, location }) {

    const classes = useStyles();
    const { user: { metadata }, dataKK, dataKB, dataPK, dataBkkbn } = usePouchDB();
    const [dataBkkbnDocs, setDataBkkbnDocs] = useState([]);
    const [isFetching, setFetching] = useState(true);
    const [isDeleting, setDeleting] = useState(false);
    const [kepalaKels, setKepalaKels] = useState([])
    const [status, setStatus] = useState([])
    const { enqueueSnackbar } = useSnackbar()
    const [statusSensus, setStatusSensus] = useState('');
    const params = useParams();

    useEffect(() => {
        let didCancel = false;
        const getAllDataBkkbn = async () => {
            setFetching(true)
            try {
                const query = await dataBkkbn.local.find({
                    selector: {
                        user_name: { $eq: metadata.name }
                    }
                });


                if (!didCancel) {
                    setDataBkkbnDocs(query.docs)
                }
            }
            catch (e) {

            }
            if (!didCancel) {
                setFetching(false);
            }
        }

        getAllDataBkkbn();

        return () => {
            didCancel = true;
        }

    }, [])

    useEffect(() => {

        const queryParams = qs.parse(location.search)
        let kepalas = dataBkkbnDocs.filter(kkDoc => typeof kkDoc.data_nik !== 'undefined').map(kkDoc => {
            let findKepala = kkDoc.data_nik.find(data_nik => data_nik.sts_hubungan);
            if (!findKepala) {
                findKepala = kkDoc.data_nik[0]
            }
            return {
                ...findKepala,
                // no_kk: kkDoc.no_kk,
                status_sensus: kkDoc.status_sensus,
                _id : kkDoc._id
            }
        })

        // const statuss = async () => await dataBkkbn.local.find({
        //     selector: {
        //         user_name: { $eq: params.user_name }
        //     },
        //     fields: ['status_sensus']
        // })
        // const status = [... new Set(statuss.docs.map((val) => val.status_sensus))]
        setStatus(status)

        if (queryParams.query) {

            kepalas = kepalas.filter(kepala => {
                return kepala.nama_anggotakel.toLowerCase().includes(queryParams.query.toLowerCase());
            })
        }

        setKepalaKels(kepalas);

    }, [dataBkkbnDocs, location.search])



    const deleteKel = _id => async (e) => {
        if (!window.confirm("Kamu yakin ingin menghapus data ini?")) {
            return false
        }
        setDeleting(true)
        try {
            //remove from local
            const kkDoc = await dataBkkbn.local.get(_id);
            await dataBkkbn.local.put({ ...kkDoc, _deleted: true });

            const kbQuery = await dataBkkbn.local.find({
                selector: {
                    _id: { $eq: _id }
                }
            })
            if (kbQuery.docs.length > 0)
                await dataBkkbn.local.bulkDocs(kbQuery.docs.map(doc => ({ ...doc, _deleted: true })))


            const pkQuery = await dataBkkbn.local.find({
                selector: {
                    _id: { $eq: _id }
                }
            })
            if (pkQuery.docs.length > 0)
                await dataBkkbn.local.bulkDocs(pkQuery.docs.map(doc => ({ ...doc, _deleted: true })))


            // // remove data from remote
            // const kkDocR = await dataKK.remote.get(no_kk);
            // await dataKK.remote.put({ ...kkDocR, _deleted: true });

            // const kbQueryR = await dataKB.remote.find({
            //     selector: {
            //         No_KK: { $eq: no_kk }
            //     }
            // })
            // if (kbQueryR.docs.length > 0)
            //     await dataKB.remote.bulkDocs(kbQueryR.docs.map(doc => ({ ...doc, _deleted: true })))


            // const pkQueryR = await dataPK.remote.find({
            //     selector: {
            //         No_KK: { $eq: no_kk }
            //     }
            // })
            // if (pkQueryR.docs.length > 0)
            //     await dataPK.remote.bulkDocs(pkQueryR.docs.map(doc => ({ ...doc, _deleted: true })))


            enqueueSnackbar("Data berhasil dihapus", { variant: "success" })
            const query = await dataBkkbn.local.find({
                selector: {
                    user_name: { $eq: metadata.name }
                }
            });
            setDataBkkbnDocs(query.docs)
            let id = _id;

            // API DELETE
            fetch('http://dev2.multisoft.co.id:10008/api/v1/delete?_id=' + _id, {
                method: 'DELETE'
            })
            .then(respone => {
                respone.json()
            })
            .then(data => {
            })
            .catch(e => console.error(e))

            let userDelete = metadata.name;
            let userDataDelete = 9;
            
            fetch('https://demo-bkkbn-notif.herokuapp.com/api/v1/pushnotification', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({
                    _id: id,
                    username: userDelete,
                    statusData: userDataDelete,
                })
            })
                .then(respone => {
                    respone.json()
                })
                .then(data => {
                })
                .catch(e => console.error(e))
        } catch (e) {

            console.log(e);
            enqueueSnackbar("Gagal menghapus data: " + e.message, { variant: "error" })

        }
        setDeleting(false)

    }


    if (isFetching) {
        return <AppPageLoading />
    }

    const handleSensus = async (event) => {
        const {value} = event.target
        setStatusSensus((oldValue) => oldValue === value ? oldValue:value);
        if (value === "all") {
            const getAllDataBkkbn = async () => {
                const query = await dataBkkbn.local.find({
                    selector: {
                        user_name: { $eq: metadata.name }
                    }
                });
                setDataBkkbnDocs(query.docs)
            }
            getAllDataBkkbn();
        } else {
            const query = await dataBkkbn.local.find({
                selector: {
                    user_name: { $eq: metadata.name },
                    status_sensus: event.target.value
                }
            });
            setDataBkkbnDocs(query.docs)
        }

    }

    return (
        <Container maxWidth="md" className={classes.container}>

            <Grid container spacing={3}>
                <Grid item xs={12} className={classes.textCenter}>
                    <Typography variant="h5" component="h1">List Keluarga</Typography>

                </Grid>
                <Grid item xs={6} md={3} lg={3} className={classes.textLeft}>
                    <FormControl
                        variant="outlined" fullWidth>

                        <Select
                            id="sts_hubungan"
                            value={statusSensus}
                            name="status_sensus"
                            onChange={handleSensus}
                            displayEmpty
                        >
                            <MenuItem value=""> Status Sensus </MenuItem>
                            <MenuItem value="all"> All </MenuItem>
                            <MenuItem value="Valid"> Valid </MenuItem>
                            <MenuItem value="NotValid"> Not Valid </MenuItem>
                            <MenuItem value="Anomali"> Anomali </MenuItem>

                            {/* {
                                resultStatus.map((result) => {
                                    return (<MenuItem value={result} key={result}>
                                        {result}
                                    </MenuItem>)
                                })
                            } */}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                {
                    kepalaKels.length <= 0 &&
                    <Grid item xs={12} className={classes.textCenter}>

                        <Typography>Data tidak ditemukan!</Typography>
                    </Grid>
                }
                <Grid item xs={12} >
                    <List>
                        {kepalaKels.map((kepala) => {
                            return <ListItem divider key={kepala._id}>
                                {/* {
                                    statusSensus == "valid" &&
                                } */}
                                <ListItemText
                                    primary={kepala.nama_anggotakel}
                                    // secondary={`NIK.${kepala.nik}
                                    // Status Sensus.${kepala.status_sensus}`}
                                    secondary={
                                        <div>
                                            <div>{`NIK:${kepala.nik}`}</div>
                                            <div>{`Status: ${kepala.status_sensus}`}</div>
                                        </div>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        disabled={isDeleting}
                                        component={Link} to={`form/edit/${kepala._id}`} edge="end" aria-label="edit">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        disabled={isDeleting}
                                        edge="end" aria-label="delete"
                                        onClick={deleteKel(kepala._id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>

                        })}
                    </List>

                </Grid>
            </Grid>
        </Container>
    )
}


export default Home;