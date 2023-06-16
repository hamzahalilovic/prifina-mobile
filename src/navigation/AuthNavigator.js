import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LoginScreen from '../modules/auth/LoginScreen';
import ConfirmationCode from '../modules/auth/ConfirmationCode';

const AuthStack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="ConfirmationCode" component={ConfirmationCode} />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;
