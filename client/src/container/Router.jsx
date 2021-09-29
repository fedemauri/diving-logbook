import React, { useContext } from 'react';
import { Switch, Route } from 'react-router-dom';
import { auth } from '../config/firebase';
import Account from '../pages/Account';
import Home from '../pages/home';
import CreateLog from '../pages/InsertLog';
import LogDetails from '../pages/LogDetails';
import Login from '../pages/Login';
import DivingResume from '../pages/Resume';
import SignUp from '../pages/SignUp';
import PrivateRoute from './PrivateRoute';

function Router() {
    return (
        <Switch>
            <Route path='/login'>
                <Login />
            </Route>
            <Route path='/signup'>
                <SignUp />
            </Route>
            <PrivateRoute path='/resume'>
                <DivingResume />
            </PrivateRoute>
            <PrivateRoute path='/details/:id'>
                <LogDetails />
            </PrivateRoute>
            <PrivateRoute path='/create-log'>
                <CreateLog />
            </PrivateRoute>
            <PrivateRoute path='/account'>
                <Account />
            </PrivateRoute>
            <PrivateRoute path='/'>
                <Home />
            </PrivateRoute>
        </Switch>
    );
}

export default Router;
