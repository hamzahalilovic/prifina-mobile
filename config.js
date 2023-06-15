import Config from 'react-native-config';

export const API_KEY = Config.REACT_APP_API_KEY;
export const SEARCH_ENGINE = Config.REACT_APP_SEARCH_ENGINE;
export const GOOGLE_URL = 'https://customsearch.googleapis.com/customsearch/v1';
export const REFRESH_TOKEN_EXPIRY = Config.REACT_APP_REFRESH_TOKEN_EXPIRY;

const prod = {
  STAGE: Config.REACT_APP_STAGE,
  APP_URL: Config.REACT_APP_ALPHA_APP,
  DEV_URL: Config.REACT_APP_ALPHA_APP_STUDIO,
  invalidVerificationLink:
    'https://prifina.zendesk.com/hc/en-us/articles/360051754911',
  passwordLength: 10,
  usernameLength: 6,
  auth_region: Config.REACT_APP_AUTH_REGION,
  main_region: Config.REACT_APP_MAIN_REGION,
  cognito: {
    USER_POOL_ID: Config.REACT_APP_POOL_ID,
    APP_CLIENT_ID: Config.REACT_APP_APP_CLIENT_ID,
    DEV_CLIENT_ID: Config.REACT_APP_DEV_CLIENT_ID,
    SERVICE_CLIENT_ID: Config.REACT_APP_SERVICE_CLIENT_ID,
    IDENTITY_POOL_ID: Config.REACT_APP_IDENTITY_POOL_ID,
    USER_IDENTITY_POOL_ID: Config.REACT_APP_USER_IDENTITY_POOL_ID,
  },
  appSync: {
    aws_appsync_graphqlEndpoint: Config.REACT_APP_APPSYNC_GRAPHQL_ENDPOINT,
    aws_appsync_authenticationType: Config.REACT_APP_APPSYNC_AUTH_TYPE,
  },
  S3: {
    bucket: 'prifina-data-' + Config.REACT_APP_PRIFINA_ACCOUNT,
    region: 'us-east-1',
  },
  prifinaAccountId: Config.REACT_APP_PRIFINA_ACCOUNT,
};
const dev = {
  STAGE: 'alpha',
  APP_URL: 'http://localhost:3000',
  DEV_URL: 'http://localhost:3001',
  invalidVerificationLink:
    'https://prifina.zendesk.com/hc/en-us/articles/360051754911',
  passwordLength: 10,
  usernameLength: 6,
  auth_region: Config.REACT_APP_AUTH_REGION,
  main_region: Config.REACT_APP_MAIN_REGION,
  cognito: {
    USER_POOL_ID: Config.REACT_APP_POOL_ID,
    APP_CLIENT_ID: Config.REACT_APP_APP_CLIENT_ID,
    DEV_CLIENT_ID: Config.REACT_APP_DEV_CLIENT_ID,
    SERVICE_CLIENT_ID: Config.REACT_APP_SERVICE_CLIENT_ID,
    IDENTITY_POOL_ID: Config.REACT_APP_IDENTITY_POOL_ID,
    USER_IDENTITY_POOL_ID: Config.REACT_APP_USER_IDENTITY_POOL_ID,
  },
  appSync: {
    aws_appsync_graphqlEndpoint: Config.REACT_APP_APPSYNC_GRAPHQL_ENDPOINT,
    aws_appsync_authenticationType: Config.REACT_APP_APPSYNC_AUTH_TYPE,
  },
  S3: {
    bucket: 'prifina-data-' + Config.REACT_APP_PRIFINA_ACCOUNT,
    region: 'us-east-1',
  },
  prifinaAccountId: Config.REACT_APP_PRIFINA_ACCOUNT,
};

// Default to dev if not set
const config = Config.REACT_APP_STAGE === 'prod' ? prod : dev;

export default {
  // Add common config values here
  support: 'anybody@anywhere.org',
  ...config,
};
