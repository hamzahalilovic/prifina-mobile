import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Login from '../screens/Login';
import ConfirmationCode from '../screens/ConfirmationCode';

const AuthStack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="ConfirmationCode" component={ConfirmationCode} />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;
