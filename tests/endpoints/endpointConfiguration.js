// Object with data shared by all endpoints
const common = {
  baseURL: 'localhost:3000/rest/v1',
};

// Data specific for the /organizations endpoint
const organizations = {
  endpoint: '/organizations',
};

module.exports = {
  common,
  organizations,
};