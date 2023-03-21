import React from 'react';
import {NavigationContainer} from '@react-navigation/native';

import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

const MainNavigator = () => {
  const user = true;
  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default MainNavigator;
