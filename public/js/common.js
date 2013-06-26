requirejs.config({
  baseUrl: '/js',
  paths: {
    'locals': 'locals', // Note that this is generated from /views/js/locals.js
    'jquery': 'lib/jquery',
    'persona': 'https://login.persona.org/include'
  },
  shim: {
    'persona': []
  }
});
