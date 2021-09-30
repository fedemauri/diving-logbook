import React, { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

function DivingResume() {
    const [logs, setLogs] = useState(null);
    const user = auth.currentUser;

    const fetchLogs = () => {
        const user = auth.currentUser;
        const userUid = user.uid;

        const logCollection = collection(db, 'user', userUid, 'log');

        getDocs(logCollection).then((response) => {
            console.log(response);
            const logsList = [];
            response.forEach((doc) => {
                const data = { ...doc.data(), id: doc.id };
                logsList.push(data);
                console.log(`${doc.id}`, doc.data());
            });
            if (logsList && logsList.length) setLogs(logsList);
        });
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div>
            <h1>diving resume</h1>
        </div>
    );
}

export default DivingResume;
