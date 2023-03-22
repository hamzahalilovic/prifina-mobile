import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet} from 'react-native';
import {Auth} from 'aws-amplify';

const ConfirmationCode = ({navigation}) => {
  const [code, setCode] = useState('');

  const confirmSignUp = async () => {
    try {
      const user = await Auth.confirmSignUp(username, code);
      console.log('confirmation successful');
      navigation.navigate('Home');
    } catch (error) {
      console.log('error:', error);
      // display error message to the user
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Confirmation Code"
        onChangeText={setCode}
      />
      <Button title="Confirm" onPress={confirmSignUp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default ConfirmationCode;
