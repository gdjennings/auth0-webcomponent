exports.config = {
  namespace: 'auth0-webcomponent',
  generateDistribution: true,
  generateWWW: false,
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
};
