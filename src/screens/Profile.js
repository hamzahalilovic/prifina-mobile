import React, {useState, useEffect, useRef} from 'react';
import {View, Text, Button} from 'react-native';

import {API, Auth} from 'aws-amplify';

import SharedGroupPreferences from 'react-native-shared-group-preferences';

import {
  getPrifinaUserQuery,
  listAppMarketQuery,
  updateUserActivityMutation,
  getSystemNotificationCountQuery,
} from '../utils/graphql/api';

import {usePrifina} from '@prifina/hooks-v2';

const Profile = () => {
  const {stage, check, getCallbacks, registerClient, currentUser, onUpdate} =
    usePrifina();

  const prifinaID = currentUser.uuid;

  const [jwtToken, setJwtToken] = useState('');
  const [sessionDetails, setSessionDetails] = useState('');

  const [activeUser, setActiveUser] = useState();
  const [prifinaUser, setPrifinaUser] = useState();

  const [count, setCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const session = await Auth.currentSession();
        const newJwtToken = session.getAccessToken().getJwtToken();
        setJwtToken(newJwtToken);
      } catch (error) {
        console.log('Error getting JWT token: ', error);
      }
    }, 1800000); // Trigger the function every 30 minutes (1800000 milliseconds)
    return () => clearInterval(interval);
  }, []);

  const logout = async () => {
    try {
      await Auth.signOut();
      // Perform any additional actions upon successful logout
      console.log('successful logout');
    } catch (error) {
      console.log('Error signing out: ', error);
    }
  };

  const getToken = async () => {
    try {
      const session = await Auth.currentSession();
      console.log('SESSION', session);

      const newJwtToken = session.getAccessToken().getJwtToken();
      console.log('SUCCESS TOKEN');
      setJwtToken(newJwtToken);
      setCount(count + 1);
    } catch (error) {
      console.log('Error getting JWT token: ', error);
    }
  };
  const effectCalled = useRef(false);

  useEffect(() => {
    async function init() {
      // effectCalled.current = true;
      const currentPrifinaUser = await getPrifinaUserQuery(API, prifinaID);
      console.log('USER ', currentPrifinaUser);
      const currentUser = currentPrifinaUser.data.getPrifinaUser;
      console.log('CURRENT USER ', currentUser);

      let appProfile = JSON.parse(currentUser.appProfile);
      console.log('APP PROFILE ', appProfile);

      const activeUser = {
        name: appProfile.name,
        initials: appProfile.initials,
        uuid: prifinaID,
        endpoint: appProfile.endpoint,
        region: appProfile.region,
        dataSources: currentUser.dataSources
          ? JSON.parse(currentUser.dataSources)
          : {},
      };
      setActiveUser(activeUser.name);
      setPrifinaUser(currentUser);

      // // Create appsync client
      // setAppsyncConfig({
      //   aws_appsync_graphqlEndpoint: appProfile.endpoint,
      //   aws_appsync_region: appProfile.region,
      //   graphql_endpoint_iam_region: appProfile.region,
      // });

      // const prifinaAppsData2 = await listAppMarketQuery({
      //   filter: {appType: {eq: 3}}, // system apps
      //   limit: 1000, // possibly too big....
      // });

      // console.log('APPS 2', prifinaAppsData2);

      // const initials = appProfile.initials;

      // console.log('APP PROFILE ', appProfile);

      // //console.log(prifinaApps);

      // const notificationCountResult = await getSystemNotificationCountQuery({
      //   filter: {
      //     owner: {eq: currentUser.id},
      //     status: {eq: 0},
      //   },
      // });

      // const userMenuInit = {
      //   notifications: notificationCountResult.data.getSystemNotificationCount,
      //   RecentApps: [],
      //   prifinaID: currentUser.id,
      //   activeUser: activeUser,
      //   listSystemNotificationsByDateQuery: listSystemNotificationsByDateQuery,
      //   coreApiClient: CoreApiClient,
      // };
      // console.log('User menu init ', userMenuInit);

      // const updateRes = await updateUserActivityMutation({
      //   id: currentUser.id,
      //   activeApp: 'Home',
      // });
      // console.log('READY ', updateRes);
    }
    // if (!effectCalled.current) {
    // }
    init();
  }, [count]);

  console.log('prifina user', prifinaUser);
  console.log('active user', activeUser);

  //////=======app groups authentication details

  // const authDetails = activeUser;

  const appGroupId = 'group.com.prifina.ios'; // Replace with your app group identifier
  const stringValueKey = 'authDetails'; // Replace with your key for the string value

  const writeStringToAppGroup = async value => {
    try {
      await SharedGroupPreferences.setItem(
        stringValueKey,
        activeUser,
        appGroupId,
      );
      console.log(
        `Successfully passed "${activeUser}" to app group container.`,
      );
    } catch (error) {
      console.error(
        'Error writing string value to app group container:',
        error,
      );
    }
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button title="Logout" onPress={logout} />

      <Button title="Get token" onPress={getToken} />

      <Button title="Authenticate my apps" onPress={writeStringToAppGroup} />

      {/* <Text>JWT Token: {jwtToken}</Text> */}
    </View>
  );
};

export default Profile;


//code the same Profile screen but add generic profile screen options like in ios app



