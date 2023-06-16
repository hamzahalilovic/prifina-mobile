import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import DataHubScreen from './screens/DataHubScreen';
import ImportScreen from './screens/ImportScreen';
import ExportScreen from './screens/ExportScreen';

const DataHubStack = createNativeStackNavigator();

const DataHubNavigator = ({navigation}) => {
  return (
    <DataHubStack.Navigator>
      <DataHubStack.Screen
        name="DataHub"
        component={DataHubScreen}
        options={{title: 'Data Hub'}}
      />
      <DataHubStack.Screen
        name="ImportData"
        component={ImportScreen}
        options={{title: 'Import Data'}}
      />
      <DataHubStack.Screen
        name="ExportData"
        component={ExportScreen}
        options={{title: 'Export Data'}}
      />
    </DataHubStack.Navigator>
  );
};

export default DataHubNavigator;
