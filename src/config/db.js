const remotebase = "https://dev2.multisoft.co.id:36984";
// const remotebase = "http://35.201.183.73:5984";
// const remotebase = "http://36.89.25.220:35984";
// const remotebase = "http://localhost:5984";
// const remotebase = "https://36.89.25.220:36984/";
// const remotebase = "https://dev2.multisoft.co.id:36985";

export const remote = {
    usermanagement: `${remotebase}/usermanagement`,
    wilayah: `${remotebase}/wilayah`,
    data: `${remotebase}/data`,
    users: `${remotebase}/_users`,
    data_kk: `${remotebase}/data_kk`,
    data_kb: `${remotebase}/data_kb`,
    data_pk: `${remotebase}/data_pk`,
    //05Des2019
    data_bkkbn: `${remotebase}/data_bkkbn`,
    cloudant_url: `${remotebase}`
}

export const local = {
    data_kk: 'data_kk',
    data_kb: 'data_kb',
    data_pk: 'data_pk',
    //05Des2019
    data_bkkbn: `data_bkkbn`
}
