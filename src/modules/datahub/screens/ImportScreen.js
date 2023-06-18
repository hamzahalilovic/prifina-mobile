import React from 'react';
import {View, Button, Alert, Platform} from 'react-native';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Contacts from 'react-native-contacts';

const ImportScreen = () => {
  const requestPermission = async permission => {
    try {
      const result = await request(permission);

      if (result === RESULTS.GRANTED) {
        console.log('Permission granted');
        if (permission === PERMISSIONS.IOS.PHOTO_LIBRARY) {
          importPhotos();
        } else if (permission === PERMISSIONS.IOS.CONTACTS) {
          importContacts();
        }
      } else {
        console.log('Permission denied');
        Alert.alert(
          'Permission Denied',
          'Please grant permission to access your ' +
            (permission === PERMISSIONS.IOS.PHOTO_LIBRARY
              ? 'photo library'
              : 'contacts') +
            '.',
          [{text: 'OK', onPress: () => console.log('OK pressed')}],
        );
      }
    } catch (error) {
      console.log('Error requesting permission:', error);
    }
  };

  const importPhotos = () => {
    // Perform import logic for photos here
    console.log('Importing photos...');
  };

  const importContacts = () => {
    console.log('Importing contacts...');

    Contacts.getAll()
      .then(contacts => {
        // work with contacts
        console.log('Contacts:', contacts);
      })
      .catch(e => {});
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button
        title="Import Photos"
        onPress={() => requestPermission(PERMISSIONS.IOS.PHOTO_LIBRARY)}
      />
      <Button
        title="Import Contacts"
        onPress={() => requestPermission(PERMISSIONS.IOS.CONTACTS)}
      />
    </View>
  );
};

export default ImportScreen;
