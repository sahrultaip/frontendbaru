import React, { useContext, useEffect, useState } from 'react';

import { usePouchDB } from './PouchDBProvider';
import { addHours } from 'date-fns';

const DataSyncContext = React.createContext();


export function useDataSync() {
    return useContext(DataSyncContext);
}

export default function DataSyncProvider(props) {

    const { user: { metadata }, dataKK, dataPK, dataKB, dataBkkbn } = usePouchDB();

    const [isSyncing, setSyncing] = useState({
        syncKK: false,
        syncKB: false,
        syncPK: false,
        syncBkkbn: false,
        statusNotif: { count: 0, message: [] }
    })

    useEffect(() => {

        let didCancel = false;
        let syncKK;
        let syncKB;
        let syncPK;
        let syncBkkbn;
        let count = 0;
        let messages = [];

        let tanggal = new Date().getDate();
        let bulan = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        let now = new Date();
        let thisBulan = bulan[now.getMonth()];
        let tahun = new Date().getFullYear();
        let date = tanggal + "/" + thisBulan + "/" + tahun;

        let jam = new Date().getHours();
        let menit = new Date().getMinutes();
        let time = jam + ':' + menit;

        dataBkkbn.local.replicate.from(dataBkkbn.remote, {
            filter: 'app/by_user_name',
            query_params: { "user_name": metadata.name }
        }).on('complete', () => {
            console.log("Replicating local to remote is complete");
            console.log("Syncing local to remote on... ");
            syncBkkbn = dataBkkbn.local.sync(dataBkkbn.remote, {
                live: true,
                retry: true,
                filter: 'app/by_user_name',
                query_params: { "user_name": metadata.name }
            }).on('change', (info) => {
                // handle change

                if (!didCancel) {
                    let statusOperasi = 'Tambah Data'
                    let isDeleted = info.change.docs[0]._deleted
                    let revSplit = parseInt(info.change.docs[0]._rev.split("-")[0])
                    if (revSplit > 3) {
                        if (isDeleted) {
                            statusOperasi = 'Hapus Data'
                        } else {
                            statusOperasi = 'Ubah Data'
                        }
                    }

                    if(revSplit % 3 == 1){
                        messages = [...messages, { 'content': 'Tanggal: ' + date + ', isi: ' + statusOperasi + ' pada no. KK: ' + info.change.docs[0].no_kk + ' a.n.: ' + info.change.docs[0].data_nik[0].nama_anggotakel }];
                    }
                    else if(isDeleted){
                        messages = [...messages, { 'content': 'Tanggal: ' + date + ', isi: ' + statusOperasi + ' pada no. KK: ' + info.change.docs[0].no_kk + ' a.n.: ' + info.change.docs[0].data_nik[0].nama_anggotakel }];
                    }
                    else {
                        messages = [...messages, { 'content': 'Tanggal: ' + date + ', ' + 'status: ' + info.change.docs[0].status_sensus + ', isi: ' + statusOperasi + ' pada no. KK: ' + info.change.docs[0].no_kk + ' a.n.: ' + info.change.docs[0].data_nik[0].nama_anggotakel }];
                    }

                    //messages = [...messages, { 'content': 'Tanggal: ' + date + ', ' + 'status: ' + info.change.docs[0].status_sensus + ', isi: ' + statusOperasi + ' pada no. KK: ' + info.change.docs[0].no_kk + ' a.n.: ' + info.change.docs[0].data_nik[0].nama_anggotakel }];

                    // Notif lonceng
                    // let itemSplits = info.change.docs[0]._rev.split("-")
                    // let statusMessages = parseInt(itemSplits[0]) > 1 ? "Ubah Data " : "Tambah Data"
                    // messages = [...messages, { 'content': 'Tanggal: ' + date + ' at ' + time + ', ' + statusMessages + info.change.docs[0].status_sensus + ' pada NIK: ' + info.change.docs[0].data_nik[0].nik + ' a.n: ' + info.change.docs[0].data_nik[0].nama_anggotakel }];
                    count = count + 1;
                    setSyncing(isSyncing => ({ ...isSyncing, syncBkkbn: true, infoBkkbn: info, statusNotif: { count: count, message: messages } }));
                }
            }).on('paused', (err) => {
                // replication paused (e.g. replication up to date, user went offline)
                if (!didCancel)
                    setSyncing(isSyncing => ({ ...isSyncing, syncBkkbn: false, errorBkkbn: err }));
            }).on('active', () => {
                // replicate resumed (e.g. new changes replicating, user went back online)
                if (!didCancel)
                    setSyncing(isSyncing => ({ ...isSyncing, syncBkkbn: true }));
            }).on('denied', (err) => {
                // a document failed to replicate (e.g. due to permissions)
                if (!didCancel)
                    setSyncing(isSyncing => ({ ...isSyncing, syncBkkbn: false, errorBkkbn: err }));
            }).on('complete', (info) => {
                // handle complete
                if (!didCancel)
                    setSyncing(isSyncing => ({ ...isSyncing, syncBkkbn: false, infoBkkbn: info }));
            }).on('error', (err) => {
                // handle error
                console.log("Come Error in 1" + err);

                if (!didCancel)
                    setSyncing(isSyncing => ({ ...isSyncing, syncBkkbn: false, errorBkkbn: err }));
            });
        }).on('error', (err) => {
            console.log("Come Error in 2" + err);

            if (err.status === 404) {
                console.log("Come Error in 2 is 404 next action replicate!!");
                // dataBkkbn.local.replicate.from(dataBkkbn.remote, {
                //     filter: 'app/by_user_name',
                //     query_params: { "user_name": metadata.name }
                // }).on('error', (err) => {
                //     console.log("Come Error in 3 .. " + err);
                // });
            }
        });

        return () => {
            didCancel = true;
            if (syncKK)
                syncKK.cancel();
            if (syncKB)
                syncKB.cancel();
            if (syncPK)
                syncPK.cancel();
            if (syncBkkbn)
                syncBkkbn.cancel();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // console.log(isSyncing)

    return <DataSyncContext.Provider
        value={{
            isSyncing
        }}
    >{props.children}</DataSyncContext.Provider>
}

