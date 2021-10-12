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

    useEffect(() => {
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
                            messages={lang === 'en' ? en : it}
                            locale={lang}
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
