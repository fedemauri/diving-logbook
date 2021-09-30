import { getDoc, doc } from '@firebase/firestore';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../config/firebase';

function LogDetails() {
    let { id } = useParams();
    const user = auth.currentUser;

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) fetchData();
    }, []);

    const fetchData = () => {
        const userUid = user.uid;
        const logCollection = doc(db, 'user', userUid, 'log', id);
        console.log('logCollection', logCollection);

        getDoc(logCollection)
            .then((response) => {
                console.log(response.data());
                setData(response.data());
            })
            .then(() => {
                setIsLoading(false);
            });
    };

    return (
        <div>
            <h1>log details</h1>
        </div>
    );
}

export default LogDetails;
