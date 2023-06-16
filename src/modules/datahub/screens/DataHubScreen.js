import React, {useEffect, useRef, useState} from 'react';
import {View, Text, Button, TouchableOpacity} from 'react-native';
import {usePrifina} from '@prifina/hooks-v2';
import {
  CognitoIdentityClient,
  GetIdCommand,
  GetCredentialsForIdentityCommand,
} from '@aws-sdk/client-cognito-identity';
import AWSAppSyncClient, {AUTH_TYPE, createAppSyncLink} from 'aws-appsync';
import {ApolloLink} from 'apollo-link';
import {createHttpLink} from 'apollo-link-http';
import gql from 'graphql-tag';
import {Auth} from 'aws-amplify';
import config from '../../../../config';
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import {Storage} from 'aws-amplify';

import ImportScreen from './ImportScreen';
import ExportScreen from './ExportScreen';

import {useNavigation} from '@react-navigation/native';

const getAthenaResults = gql`
  subscription AthenaResults($id: String!) {
    athenaResults(id: $id) {
      data
      appId
      id
    }
  }
`;

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    Buffer.from(base64, 'base64')
      .toString('utf-8')
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );

  return JSON.parse(jsonPayload);
}

const cognitoCredentials = async (idToken, userIdPool) => {
  const token = parseJwt(idToken);
  const provider = token['iss'].replace('https://', '');
  let identityParams = {
    IdentityPoolId: userIdPool,
    Logins: {},
  };

  identityParams.Logins[provider] = idToken;
  const cognitoClient = new CognitoIdentityClient({
    region: userIdPool.split(':')[0],
  });
  const cognitoIdentity = await cognitoClient.send(
    new GetIdCommand(identityParams),
  );

  let credentialParams = {
    IdentityId: cognitoIdentity.IdentityId,
    Logins: {},
  };

  credentialParams.Logins[provider] = idToken;
  const cognitoIdentityCredentials = await cognitoClient.send(
    new GetCredentialsForIdentityCommand(credentialParams),
  );

  const clientCredentials = {
    identityId: cognitoIdentity.IdentityId,
    accessKeyId: cognitoIdentityCredentials.Credentials.AccessKeyId,
    secretAccessKey: cognitoIdentityCredentials.Credentials.SecretKey,
    sessionToken: cognitoIdentityCredentials.Credentials.SessionToken,
    expiration: cognitoIdentityCredentials.Credentials.Expiration,
    authenticated: true,
  };
  return clientCredentials;
};

const createClient = async (endpoint, region, userIdPool, idToken) => {
  const clientCredentials = await cognitoCredentials(idToken, userIdPool);
  const AppSyncConfig = {
    url: endpoint,
    region: region,
    auth: {
      type: AUTH_TYPE.AWS_IAM,
      credentials: clientCredentials,
    },
    disableOffline: true,
  };

  const client = new AWSAppSyncClient(AppSyncConfig, {
    link: new createAppSyncLink({
      ...AppSyncConfig,
      resultsFetcherLink: ApolloLink.from([
        createHttpLink({
          uri: AppSyncConfig.url,
        }),
      ]),
    }),
  });

  return Promise.resolve(client);
};

const DataHubScreen = () => {
  const [jwtToken, setJwtToken] = useState('');
  const [count, setCount] = useState(1);

  const {currentUser, registerClient} = usePrifina();

  console.log('CURRENT USER', currentUser);

  const getToken = async () => {
    try {
      const session = await Auth.currentSession();
      const newJwtToken = session.getAccessToken().getJwtToken();
      console.log('SUCCESS TOKEN');
      setCount(count + 1);
      setJwtToken(newJwtToken);
    } catch (error) {
      console.log('Error getting JWT token: ', error);
    }
  };

  const token = jwtToken;
  const prifinaID = currentUser.uuid;
  const effectCalled = useRef(false);

  useEffect(() => {
    async function init() {
      effectCalled.current = true;

      try {
        const CoreApiClient = await createClient(
          config.appSync.aws_appsync_graphqlEndpoint,
          config.main_region,
          config.cognito.IDENTITY_POOL_ID,
          token,
        );

        console.log('CORE ', CoreApiClient);

        const UserApiClient = await createClient(
          config.appSync.user_graphql_endpoint,
          config.user_region,
          config.cognito.USER_IDENTITY_POOL_ID,
          token,
        );

        console.log('USER ', UserApiClient);

        registerClient([UserApiClient, CoreApiClient, {}]);

        console.log('SUBS ', athenaSubscription);
      } catch (error) {
        console.error('ERROR :', error);
      }
    }

    if (!effectCalled.current) {
      init();
    }
  }, [count]);

  const appGroupId = 'group.com.prifina.ios';
  const objectKey = 'customData';

  const readObjectFromAppGroup = async () => {
    try {
      const jsonString = await SharedGroupPreferences.getItem(
        objectKey,
        appGroupId,
      );
      const jsonObject = jsonString;
      console.log('Successfully read object from app group:', jsonObject);
      return jsonObject;
    } catch (error) {
      console.error('Error reading object from app group:', error);
      return null;
    }
  };

  const uploadObject = async () => {
    try {
      const bucket = `prifina-data-${config.prifinaAccountId}-${config.main_region}`;
      const region = config.S3.region;
      const endpoint =
        'https://your-bucket-name.s3.your-bucket-region.amazonaws.com';
      const response = await Storage.put('myObjectKey', 'Hello World', {
        level: 'public',
        bucket: bucket,
        region: region,
        customPrefix: {
          public: '',
        },
        contentType: 'text/plain',
        endpoint: endpoint,
      });
      console.log('Object uploaded successfully:', response);
    } catch (error) {
      console.error('Error uploading object:', error);
    }
  };

  const navigation = useNavigation();

  const navigateToImportScreen = () => {
    navigation.navigate('ImportData');
  };

  const navigateToExportScreen = () => {
    navigation.navigate('ExportData');
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button title="Import Data" onPress={navigateToImportScreen} />
      <Button title="Export Data" onPress={navigateToExportScreen} />
    </View>
  );
};

export default DataHubScreen;
