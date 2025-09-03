import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ component: Component, render, ...rest }) => {
  const token = localStorage.getItem('token');
  return (
    <Route
      {...rest}
      render={props =>
        token
          ? render
            ? render(props)
            : <Component {...props} />
          : <Redirect to="/" />
      }
    />
  );
};

export default PrivateRoute;