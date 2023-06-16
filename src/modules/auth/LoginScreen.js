import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet} from 'react-native';
import {API, Auth} from 'aws-amplify';

import {getLoginUserIdentityPoolQuery} from '../../utils/graphql/api';

import Config from 'react-native-config';

import config from '../../../config';
import awsmobile from '../../aws-exports';

const LoginScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  console.log('env test', config.cognito.USER_IDENTITY_POOL_ID);

  const APIConfig = {
    aws_appsync_graphqlEndpoint: config.appSync.aws_appsync_graphqlEndpoint,
    aws_appsync_region: config.main_region,
    aws_appsync_authenticationType:
      config.appSync.aws_appsync_authenticationType,
  };
  // set default prifina api configs...

  let AUTHConfig = {
    // To get the aws credentials, you need to configure
    // the Auth module with your Cognito Federated Identity Pool
    mandatorySignIn: false,
    userPoolId: config.cognito.USER_POOL_ID,
    // identityPoolId: config.cognito.IDENTITY_POOL_ID,
    identityPoolId: 'eu-west-1:9589f175-270e-418c-b724-23c136db8a7f',
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
    region: config.auth_region,
    identityPoolRegion: config.main_region,
    //region: config.main_region,
  };
  // API.configure(awsmobile);

  Auth.configure(AUTHConfig);
  API.configure(APIConfig);

  // const signIn = async () => {
  //   try {
  //     const user = await Auth.signIn(username, password);
  //     console.log('user:', user);
  //     navigation.navigate('Home');
  //   } catch (error) {
  //     console.log('error:', error);
  //     // display error message to the user
  //   }
  // };

  const signIn = async () => {
    try {
      const prifinaUserIdPool = await getLoginUserIdentityPoolQuery(
        API,
        username,
        config.cognito.USER_POOL_ID,
      );
      console.log('ID POOL ', prifinaUserIdPool);

      let userIdPool = config.cognito.USER_IDENTITY_POOL_ID;

      if (prifinaUserIdPool.data.getLoginUserIdentityPool !== '') {
        userIdPool = prifinaUserIdPool.data.getLoginUserIdentityPool;
      }

      let currentConfig = Auth._config;
      console.log('LOGIN CONFIG');

      currentConfig.identityPoolId = userIdPool;

      currentConfig.identityPoolRegion = userIdPool.split(':')[0];
      Auth.configure(currentConfig);

      let user = await Auth.signIn(username, password);
      console.log('LOGIN', user);

      // localStorage.setItem(
      //   'LastSessionIdentityPool',
      //   currentConfig.identityPoolId,
      // );

      if (user.preferredMFA === 'NOMFA') {
        console.log('NOMFA');
        // userAuth(true);
        //history.replace("/home");
        // navigate('/home', {replace: true});
      } else {
        if (user.preferredMFA === 'NOMFA') {
          const mfa = await Auth.setPreferredMFA(user, 'SMS');
          console.log('MFA ', mfa);
          user = await Auth.signIn(username, password);
          console.log('LOGIN2', user);
        } else if (user.challengeName === 'SMS_MFA') {
        }
        // alerts.info(i18n.__('confirmationCodeSent'), {});
        console.log('confimartion code sent');
        // setAuthOptions({user: user, Auth: Auth, setAuth: userAuth});
        // setConfirmCode(true);
      }
    } catch (e) {
      console.log('ERR', e);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={false}
        onChangeText={setPassword}
      />
      <Button title="Sign In" onPress={signIn} />
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

export default LoginScreen;
