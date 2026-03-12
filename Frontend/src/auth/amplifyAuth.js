import { Amplify } from "aws-amplify";

const getRequiredEnv = (key) => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
};

const parseRedirectUris = (key) => {
  const rawValue = getRequiredEnv(key);
  const values = rawValue
    .split(",")
    .map((uri) => uri.trim())
    .filter(Boolean);

  if (!values.length) {
    throw new Error(`Invalid redirect URI list in env: ${key}`);
  }

  return values;
};

const authConfig = {
  Auth: {
    Cognito: {
      userPoolId: getRequiredEnv("VITE_COGNITO_USER_POOL_ID"),
      userPoolClientId: getRequiredEnv("VITE_COGNITO_USER_POOL_CLIENT_ID"),
      loginWith: {
        oauth: {
          domain: getRequiredEnv("VITE_COGNITO_DOMAIN"),
          scopes: ["openid", "email", "profile"],
          redirectSignIn: parseRedirectUris("VITE_COGNITO_REDIRECT_SIGN_IN"),
          redirectSignOut: parseRedirectUris("VITE_COGNITO_REDIRECT_SIGN_OUT"),
          responseType: "code",
        },
      },
    },
  },
};

export const configureAmplifyAuth = () => {
  Amplify.configure(authConfig);
};
