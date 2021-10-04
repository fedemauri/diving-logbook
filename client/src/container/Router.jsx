import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
const Account = React.lazy(() =>
    import(/* webpackChunkName: "Account" */ '../pages/Account')
);
const Home = React.lazy(() =>
    import(/* webpackChunkName: "Home" */ '../pages/Home')
);
const CreateLog = React.lazy(() =>
    import(/* webpackChunkName: "CreateLog" */ '../pages/InsertLog')
);
const LogDetails = React.lazy(() =>
    import(/* webpackChunkName: "LogDetails" */ '../pages/LogDetails')
);
const Login = React.lazy(() =>
    import(/* webpackChunkName: "Login" */ '../pages/Login')
);
const DivingResume = React.lazy(() =>
    import(/* webpackChunkName: "DivingResume" */ '../pages/Resume')
);
const SignUp = React.lazy(() =>
    import(/* webpackChunkName: "SignUp" */ '../pages/SignUp')
);

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
