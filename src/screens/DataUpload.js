import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

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
const {setContext} = require('apollo-link-context');

import gql from 'graphql-tag';

import {Auth} from 'aws-amplify';

import config from '../../config';

import SharedGroupPreferences from 'react-native-shared-group-preferences';

import {Storage} from 'aws-amplify';

const getAthenaResults = `subscription AthenaResults($id: String!) {
  athenaResults(id: $id) {
    data
    appId
    id
  }
}`;

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
  //const userIdPool = config.cognito.USER_IDENTITY_POOL_ID
  //const provider='cognito-idp.'+userPoolRegion+'.amazonaws.com/'+userPoolId;
  const provider = token['iss'].replace('https://', '');
  let identityParams = {
    IdentityPoolId: userIdPool,
    Logins: {},
  };

  identityParams.Logins[provider] = idToken;
  const cognitoClient = new CognitoIdentityClient({
    region: userIdPool.split(':')[0],
  });
  //console.log(identityParams);
  const cognitoIdentity = await cognitoClient.send(
    new GetIdCommand(identityParams),
  );
  //console.log("COGNITO IDENTITY ", cognitoIdentity);

  let credentialParams = {
    IdentityId: cognitoIdentity.IdentityId,
    Logins: {},
  };

  credentialParams.Logins[provider] = idToken;
  //console.log(credentialParams);
  const cognitoIdentityCredentials = await cognitoClient.send(
    new GetCredentialsForIdentityCommand(credentialParams),
  );
  //console.log("COGNITO IDENTITY CREDS ", cognitoIdentityCredentials);
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
        setContext((request, previousContext) => {
          //console.log("APOLLO ", previousContext, request);
          return {
            headers: {
              ...previousContext.headers,
              'prifina-user': idToken,
            },
          };
        }),
        createHttpLink({
          uri: AppSyncConfig.url,
        }),
      ]),
    }),
  });

  return Promise.resolve(client);
};

const DataUpload = () => {
  const [jwtToken, setJwtToken] = useState('');
  const [count, setCount] = useState(1);

  const {stage, check, getCallbacks, registerClient, currentUser, onUpdate} =
    usePrifina();

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

  //const prifinaID = "6145b3af07fa22f66456e20eca49e98bfe35";
  const prifinaID = currentUser.uuid;
  //console.log(parseJwt(token));
  const effectCalled = useRef(false);
  const athenaSubscription = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      effectCalled.current = true;
      // prifina endpoint region...
      // prifina identity pool
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

        athenaSubscription.current = UserApiClient.subscribe({
          query: gql(getAthenaResults),
          variables: {id: prifinaID},
        }).subscribe({
          next: res => {
            console.log('ATHENA SUBS RESULTS ', res);

            const currentAppId = res.data.athenaResults.appId;

            const c = getCallbacks();
            console.log('CALLBACKS ', c);

            if (
              c.hasOwnProperty(currentAppId) &&
              typeof c[currentAppId][0] === 'function'
            ) {
              console.log('FOUND CALLBACK ');
              c[currentAppId][0]({
                data: JSON.parse(res.data.athenaResults.data),
              });
            }
          },
          error: error => {
            console.log('ATHENA SUBS ERROR ');

            console.error(error);
            // handle this error ???
            ///message: "Connection failed: com.amazon.coral.service#ExpiredTokenException"
          },
        });

        console.log('SUBS ', athenaSubscription);
        setReady(true);
      } catch (error) {
        ///NotAuthorizedException ... idToken has expired...
        console.error('ERROR :', error);
      }
    }
    if (!effectCalled.current) {
      init();
    }
    // unsubscribe...
    if (athenaSubscription.current) {
      console.log('UNSUBS ATHENA ');
      //athenaSubscription.current.unsubscribe();
    }
  }, [count]);

  const appGroupId = 'group.com.prifina.ios'; // Replace with your app group identifier
  const objectKey = 'customData'; // Replace with your key for the object value

  const readObjectFromAppGroup = async () => {
    try {
      const jsonString = await SharedGroupPreferences.getItem(
        objectKey,
        appGroupId,
      );
      //   const jsonObject = JSON.parse(jsonString);
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
      const bucket = `prifina-data-${config.prifinaAccountId}-${config.main_region}`; // Replace with your S3 bucket name
      // Replace with your S3 bucket name
      const region = config.S3.region; // Replace with your S3 bucket region
      const endpoint =
        'https://your-bucket-name.s3.your-bucket-region.amazonaws.com'; // Replace with your S3 bucket endpoint URL
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

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Data Upload</Text>
      <Button title="Sync data" onPress={readObjectFromAppGroup} />
      <TouchableOpacity onPress={uploadObject}>
        <Text>Upload Object to S3</Text>
      </TouchableOpacity>
      {/* {ready && <Widget />} */}
      {/* <Widget /> */}
    </View>
  );
};

export default DataUpload;
