import React from 'react';
import {View, Button} from 'react-native';
import * as Contacts from 'react-native-contacts';
import * as Permissions from 'react-native-permissions';

const ImportScreen = () => {
  const requestContactsPermission = async () => {
    try {
      const response = await Permissions.request('contacts');

      if (response === 'granted') {
        getContacts();
      } else {
        console.log('Contacts permission denied');
      }
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
    }
  };

  const getContacts = () => {
    Contacts.getAll((err, contacts) => {
      if (err) {
        console.error('Error retrieving contacts:', err);
      } else {
        console.log('Contacts:', contacts);
        // Process contacts data as per your requirement
      }
    });
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button title="Import Data" onPress={requestContactsPermission} />
    </View>
  );
};

export default ImportScreen;
