import Rollbar from 'rollbar';

// Track error by https://sentry.io/
if (location.host === 'oa.polelong.com') {
  Rollbar.init({
    accessToken: '033ca6d7c0eb4cc1831cf470c2649971',
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      environment: 'production',
    },
  });
}
