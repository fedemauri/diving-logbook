import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { auth } from '../config/firebase';


export default function PrivateRoute ({ children, ...rest }) {
    const user = auth.currentUser;
    return (
      <Route {...rest} render={() => {
        return user
          ? children
          : <Redirect to='/login' />
      }} />
    )
 }