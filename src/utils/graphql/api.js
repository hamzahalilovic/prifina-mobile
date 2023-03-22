const getLoginUserIdentityPool = `query getLoginUserIdentityPool($username: String!,$poolID: String!) {
    getLoginUserIdentityPool(username: $username,poolID:$poolID)
  }
  `;

export const getLoginUserIdentityPoolQuery = (API, username, poolID) => {
  return API.graphql({
    query: getLoginUserIdentityPool,
    variables: {username: username, poolID: poolID},
    authMode: 'AWS_IAM',
  });
};
