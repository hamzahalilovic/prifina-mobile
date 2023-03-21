import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet} from 'react-native';

const ConfirmationCode = ({navigation}) => {
  const [confirmationCode, setConfirmationCode] = useState('');

  const handleConfirmationCode = () => {
    // handle confirmation code logic here
    navigation.navigate('App');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Confirmation code"
        value={confirmationCode}
        onChangeText={text => setConfirmationCode(text)}
      />
      <Button
        title="Submit confirmation code"
        onPress={handleConfirmationCode}
      />
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
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
});

export default ConfirmationCode;
