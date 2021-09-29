import React from 'react';

const UserContext = React.createContext({ user: null });
export const UserProvider = UserContext.Provider;
export const UserConsumer = UserContext.Consumer;
export default UserContext;
