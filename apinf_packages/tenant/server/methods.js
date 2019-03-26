/* Copyright 2019 Apinf Oy
This file is covered by the EUPL license.
You may obtain a copy of the licence at
https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { HTTP } from 'meteor/http';
import { TAPi18n } from 'meteor/tap:i18n';

// Npm packages imports
import _ from 'lodash';

// Collection imports
import Settings from '/apinf_packages/settings/collection';

const getTenantToken = function () {
  // Get user
  const userId = Meteor.userId();
  const user = Meteor.users.findOne(userId);

  let tenantToken;
  if (user && user.services && user.services.fiware) {
    tenantToken = user.services.fiware.accessToken;
  }
  return tenantToken;
};

const getTenantInfo = function () {
  // Get settings document
  const settings = Settings.findOne();

  // Get url and token from settings
  const tenantUrl = _.get(settings, 'tenantIdm.basepath');

  // Return URL and token, if they are set
  if (tenantUrl) {
    return tenantUrl;
  }
  // If not available, return false
  return false;
};

function compare (a, b) {
  if (a.username < b.username) return -1;
  if (a.username > b.username) return 1;
  return 0;
}

Meteor.methods({
  getTenantList () {
    const response = {};
    // In case of failure
    response.status = 400;

    // Fetch tenant endpoint and token
    let tenantUrl = getTenantInfo();
    console.log('tenant url=', tenantUrl);

    console.log('\n ------------ Fetch Tenant list -------------- \n');
    if (tenantUrl) {
      // Make sure endPoint is a String
      // eslint-disable-next-line new-cap
      check(tenantUrl, Match.Maybe(String));
      tenantUrl = tenantUrl.concat('tenant');
      console.log(+new Date(), ' 2 send GET tenant request to = ', tenantUrl);

      // Get user's tenant access token
      const accessToken = getTenantToken();

      try {
        const result = HTTP.get(
          tenantUrl,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // Create a monitoring data

        console.log('3 tenant GET a ok, result=', result.content);

        // deserialize JSON
        const tenantList = JSON.parse(result.content);

        response.tenantList = tenantList;

        // Modify parameters according to tenant manager API from object to array
        response.tenantList = tenantList.map(tenant => {
          // console.log('tenant=', tenant);
          const convertedUserList = tenant.users.map(user => {
            // Return converted user list
            return {
              id: user.id,
              name: user.name,
              provider: user.roles.includes('data-provider') ? 'checked' : false,
              consumer: user.roles.includes('data-consumer') ? 'checked' : false,
            };
          });

          // Return tenant
          return {
            id: tenant.id,
            owner_id: tenant.owner_id,
            name: tenant.name,
            description: tenant.description,
            users: convertedUserList,
          };
        });

        response.status = result.statusCode;
        // console.log('3 tenant a ok, response=', response);
      } catch (err) {
        console.log('3 tenant b nok, err=\n', err);

        response.tenantList = [
          {
            id: 1123456789,
            owner_id: 1987654321,
            tenant_organization: '1111',
            name: 'First tenant',
            description: 'This is a first class tenant',
            users: [
              {
                id: '123qwe',
                name: 'Spede',
                provider: false,
                consumer: 'checked',
              },
              {
                id: '223qwe',
                name: 'Simo',
                provider: 'checked',
                consumer: false,
              },
              {
                id: '323qwe',
                name: 'Vesku',
                provider: 'checked',
                consumer: 'checked',
              },
            ],
          },
          {
            id: 2123456789,
            owner_id: 2987654321,
            tenant_organization: '1111',
            name: 'Second tenant',
            description: 'This is a second class tenant',
            users: [
              {
                id: '423qwe',
                name: 'Tupu',
                provider: 'checked',
                consumer: false,
              },
              {
                id: '523qwe',
                name: 'Hupu',
                provider: 'checked',
                consumer: 'checked',
              },
              {
                id: '623qwe',
                name: 'Lupu',
                provider: false,
                consumer: 'checked',
              },
              {
                id: '723qwe',
                name: 'Skrupu',
                provider: false,
                consumer: 'checked',
              },
            ],
          },
          {
            id: 3123456789,
            owner_id: 31987654321,
            tenant_organization: '1111',
            description: 'This is a third class tenant',
            name: 'Third tenant',
            users: [
              {
                id: 'a123qwe',
                name: 'Ismo',
                provider: 'checked',
                consumer: false,
              },
              {
                id: 'b123qwe',
                name: 'Asmo',
                provider: 'checked',
                consumer: 'checked',
              },
              {
                id: 'c123qwe',
                name: 'Osmo',
                provider: false,
                consumer: 'checked',
              },
              {
                id: 'd123qwe',
                name: 'Atso',
                provider: 'checked',
                consumer: 'checked',
              },
              {
                id: 'e123qwe',
                name: 'Matso',
                provider: false,
                consumer: 'checked',
              },
            ],
          },
        ];
        console.log('3 b tenant nok, artificial response=', response);
      }
    } else {
      // Return error object
      const errorMessage = TAPi18n.__('tenantRequest_missingBasepath');
      throw new Meteor.Error(errorMessage);
    }

    // console.log('4 GET tenant response=', response);
    return response;
  },

  getTenantUserList () {
    const response = {};
    // In case of failure
    response.status = 400;

    // Fetch tenant endpoint and token
    let tenantUrl = getTenantInfo();

    if (tenantUrl) {
      // Make sure endPoint is a String
      // eslint-disable-next-line new-cap
      check(tenantUrl, Match.Maybe(String));
      // Add endpoint to base path
      tenantUrl = tenantUrl.concat('user');

      // Get user's tenant access token
      const accessToken = getTenantToken();

      try {
        const result = HTTP.get(
          tenantUrl,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // deserialize JSON gotten from manager
        const resultFromTenantManager = JSON.parse(result.content);
        // We need only id and username, so pick them
        const completeUserList = resultFromTenantManager.users.map(user => {
          return {
            id: user.id,
            username: user.username,
            enabled: user.enabled,
            email: user.email,
          };
        });

        completeUserList.sort(compare);
        // prepare response
        response.completeUserList = completeUserList;
        response.status = result.statusCode;
      } catch (err) {
        // Return error object
        let errorMessage = TAPi18n.__('tenantRequest_missingUserlist');
        errorMessage = errorMessage.concat(err);
        throw new Meteor.Error(errorMessage);
        /*
        response.status = err.response.statusCode;
        response.content = err.response.content;

        // For mock purposes we fill the list here ourself
        response.completeUserList = [
          {
            id: '123456789',
            username: 'Håkan',
          },
          {
            id: '223456789',
            username: 'Luis',
          },
          {
            id: '323456789',
            username: 'Pär',
          },
          {
            id: '423456789',
            username: 'Ivan',
          },
          {
            id: '523456789',
            username: 'Hans',
          },
          {
            id: '62345689',
            username: 'Pierre',
          },
          {
            id: '723456789',
            username: 'Väinämöinen',
          },
          {
            id: '82356789',
            username: 'Jack',
          },
          {
            id: '92356789',
            username: 'Umberto',
          },
        ];
        */
      }
    } else {
      // Return error object
      const errorMessage = TAPi18n.__('tenantRequest_missingBasepath');
      throw new Meteor.Error(errorMessage);
    }
    return response;
  },

  addTenant (tenant) {
    check(tenant, Object);

    const response = {};

    // Fetch tenant endpoint and token
    let tenantUrl = getTenantInfo();

    if (tenantUrl) {
      // Make sure endPoint is a String
      // eslint-disable-next-line new-cap
      check(tenantUrl, Match.Maybe(String));
      // Add endpoint to base path
      tenantUrl = tenantUrl.concat('tenant');

      // Get user's tenant access token
      const accessToken = getTenantToken();

      // Convert parameters to array in tenant manager API from internal object
      const userlist = tenant.users.map(user => {
        const tenantRoles = [];
        if (user.provider) {
          tenantRoles.push('data-provider');
        }
        if (user.consumer) {
          tenantRoles.push('data-consumer');
        }
        return {
          id: user.id,
          name: user.name,
          roles: tenantRoles,
        };
      });

      // New tenant object to be sent
      const tenantToSend = {
        name: tenant.name,
        description: tenant.description,
        users: userlist,
      };

      // Serialize to JSON
      const tenantJSON = JSON.stringify(tenantToSend);

      console.log('\n ----------------- Add tenant ---------------------\n');
      console.log('add tenant userlist=\n', JSON.stringify(tenantToSend, null, 2));

      try {
        const result = HTTP.post(
          tenantUrl,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            content: tenantJSON,
          }
        );
        // Create a monitoring data
        response.status = result.statusCode;
        console.log('3 POST a ok, result=', result);
        console.log('3 a ok, response=', response);
      } catch (err) {
        console.log(+new Date(), ' 3 POST b err=', err);
      //  response.status = err.response.statusCode || 500;
      //  response.content = err.response.content || err.error;

        // Return error object
        throw new Meteor.Error(err.message);
      }
    } else {
      // Return error object
      const errorMessage = TAPi18n.__('tenantRequest_missingBasepath');
      throw new Meteor.Error(errorMessage);
    }

    console.log(+new Date(), ' 4 POST response=', response);
    return response;
  },

  deleteTenant (tenant) {
    check(tenant, Object);

    const response = {};

    // Fetch tenant endpoint and token
    let tenantUrl = getTenantInfo();

    if (tenantUrl) {
      // Make sure endPoint is a String
      // eslint-disable-next-line new-cap
      check(tenantUrl, Match.Maybe(String));
      // Add endpoint to base path
      tenantUrl = tenantUrl.concat('tenant/');
      tenantUrl = tenantUrl.concat(tenant.id);
      tenantUrl = tenantUrl.concat('/');

      // Get user's tenant access token
      const accessToken = getTenantToken();

      console.log('\n ----------------- Delete tenant ---------------------\n');
      console.log('url=', tenantUrl);

      try {
        const result = HTTP.del(
          tenantUrl,
          {
            headers: {
            //  'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // Create a monitoring data
        response.status = result.statusCode;
        console.log('3 DELETE a ok, result=', result);
        console.log('3 a ok, response=', response);
      } catch (err) {
        console.log(+new Date(), ' 3 DELETE b err=', err);
        response.status = err.response.statusCode;
        response.content = err.response.content;
        console.log('3 b nok, response=', response);

        // Return error object
        throw new Meteor.Error(err.message);
      }
    } else {
      // Return error object
      const errorMessage = TAPi18n.__('tenantRequest_missingBasepath');
      throw new Meteor.Error(errorMessage);
    }

    console.log(+new Date(), ' 4 DELETE response=', response);
    return response;
  },

  updateTenant (tenantPayload) {
    check(tenantPayload, Object);

    const response = {};

    // Fetch tenant endpoint and token
    let tenantUrl = getTenantInfo();

    if (tenantUrl) {
      // Make sure endPoint is a String
      // eslint-disable-next-line new-cap
      check(tenantUrl, Match.Maybe(String));
      // Add endpoint to base path
      tenantUrl = tenantUrl.concat('tenant/');
      tenantUrl = tenantUrl.concat(tenantPayload.id);

      // Get user's tenant access token
      const accessToken = getTenantToken();

       // Serialize to JSON
      const payLoadToSend = JSON.stringify(tenantPayload.body);

      console.log('\n ----------------- Update tenant ---------------------\n');
      console.log('tenant tuli =', tenantPayload);
      console.log('tenant url=', tenantUrl);
      console.log('update tenant payload=\n', JSON.stringify(tenantPayload.body, null, 2));

      try {
        const result = HTTP.patch(
          tenantUrl,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            content: payLoadToSend,
          }
        );
        // Create a monitoring data
        response.status = result.statusCode;
        console.log('3 PATCH a ok, result=', result);
        console.log('3 a ok, response=', response);
      } catch (err) {
        console.log(+new Date(), ' 3 PATCH b err=', err);
        response.status = err.response.statusCode;
        response.content = err.response.content;
        console.log('3 b nok, response=', response);

        // Return error object
        throw new Meteor.Error(err.message);
      }
    } else {
      // Return error object
      const errorMessage = TAPi18n.__('tenantRequest_missingBasepath');
      throw new Meteor.Error(errorMessage);
    }
    console.log(+new Date(), ' 4 PATCH response=', response);
    return response;
  },
  checkTenantUsers (userCheckData) {
    check(userCheckData, Object);

    const response = {};
    // If no changes in user, return here always OK
    if (userCheckData.type !== 'user') {
      response.status = 200;
      return response;
    }

    // Fetch tenant endpoint and token
    let tenantUrl = getTenantInfo();

    if (tenantUrl) {
      // Make sure endPoint is a String
      // eslint-disable-next-line new-cap
      check(tenantUrl, Match.Maybe(String));
      // Add endpoint to base path
      tenantUrl = tenantUrl.concat('tenant/');
      tenantUrl = tenantUrl.concat(userCheckData.id);

      // Get user's tenant access token
      const accessToken = getTenantToken();

       // Serialize to JSON
      const payLoadToSend = JSON.stringify(userCheckData.body);

      console.log('\n ----------------- Check tenant ---------------------\n');
      console.log('check users tuli =', userCheckData);
      console.log('tenant url=', tenantUrl);
      console.log('check users  payload=\n', JSON.stringify(userCheckData.body, null, 2));

      try {
        const result = HTTP.patch(
          tenantUrl,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            content: payLoadToSend,
          }
        );
        console.log('3 PATCH check a ok, result=', result);
        console.log('3 a ok, response=', response);
        // Only 200 is acceptable status code
        if (result.statusCode === 200) {
          response.status = result.statusCode;
        } else {
          // Return error object
          let errMsg = 'Error in user, refresh tenants and try again! ';
          errMsg = errMsg.concat(result);
          throw new Meteor.Error(errMsg);
        }
      } catch (err) {
        console.log(+new Date(), ' 3 PATCH b err=', err);
        response.status = err.response.statusCode;
        response.content = err.response.content;
        console.log('3 b PATCH check nok, response=', response);

        // Return error object
        throw new Meteor.Error(err.message);
      }
    } else {
      // Return error object
      const errorMessage = TAPi18n.__('tenantRequest_missingBasepath');
      throw new Meteor.Error(errorMessage);
    }
    console.log(+new Date(), ' 4 PATCH check response=', response);
    return response;
  },
});
