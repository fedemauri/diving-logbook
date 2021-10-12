import './App.scss';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import React, { Suspense, useEffect, useState } from 'react';
import Router from './container/Router';
import PageContainer from './container/PageContainer';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { IntlProvider } from 'react-intl';
import { LangProvider } from './container/LangContext';
import en from './lang/en';
import it from './lang/it';

function App() {
    const [user, setUser] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [lang, setLang] = useState('en');

    const userLang = localStorage.getItem('lang');

    useEffect(() => {
        if (userLang && userLang !== lang) {
            setLang(userLang);
        }

        onAuthStateChanged(auth, (userLogged) => {
            if (user) {
                setUser(userLogged);
            } else {
                setUser(null);
            }
            setTimeout(() => {
                setIsReady(true);
            });
        });
    }, []);

    useEffect(() => {
        localStorage.setItem('lang', lang);
    }, [lang]);

    if (isReady)
        return (
            <div className='App'>
                <Suspense fallback={<CircularProgress />}>
                    <LangProvider
                        value={{
                            lang,
                            setLang,
                        }}
                    >
                        <IntlProvider
                            messages={userLang === 'it' ? it : en}
                            locale={userLang ?? 'en'}
                            defaultLocale='en'
                        >
                            <BrowserRouter>
                                <PageContainer>
                                    <Router />
                                </PageContainer>
                            </BrowserRouter>
                        </IntlProvider>
                    </LangProvider>
                </Suspense>
            </div>
        );
    else return null;
}

export default App;
