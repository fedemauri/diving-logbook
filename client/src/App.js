// @ts-nocheck
import './App.scss';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import React, { useEffect, useState, useCallback } from 'react';
import Router from './container/Router';
import PageContainer from './container/PageContainer';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter } from 'react-router-dom';

function App() {
    const [user, setUser] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        onAuthStateChanged(auth, (userLoggged) => {
            if (user) {
                setUser(userLoggged);
            } else {
                setUser(null);
            }
            setTimeout(() => {
                setIsReady(true);
            });
        });
    }, []);

    if (isReady)
        return (
            <div className='App'>
                <BrowserRouter>
                    <PageContainer>
                        <Router />
                    </PageContainer>
                </BrowserRouter>
            </div>
        );
    else return null;
}

export default App;
