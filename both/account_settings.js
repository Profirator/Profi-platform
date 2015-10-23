ProjectConfiguration = new Mongo.Collection('projectConfiguration');

Schemas.ProjectConfigurationSchema = new SimpleSchema({
  apinf_host: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    label: "Apinf host",
    optional: false,
    autoform: {
      placeholder: 'Apinf host'
    }
  },
  api_umbrella_host: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    label: "Api Umbrella host",
    optional: false,
    autoform: {
      placeholder: 'Api Umbrella host'
    }
  },
  api_umbrella_api_key: {
    type: String,
    label: "Api Umbrella api key",
    optional: false,
    autoform: {
      placeholder: 'Api Umbrella api key'
    }
  },
  api_umbrella_auth_token: {
    type: String,
    label: "Api Umbrella auth token",
    optional: false,
    autoform: {
      placeholder: 'Api Umbrella auth token'
    }
  },
  api_umbrella_base_url: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    label: "Api Umbrella base url",
    optional: false,
    autoform: {
      placeholder: 'Api Umbrella base url'
    }
  },
  elasticsearch_host: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    label: "Elastic search host",
    optional: false,
    autoform: {
      placeholder: 'Elastic search host'
    }
  },
  mailgun_username: {
    type: String,
    label: "Mailgun username",
    optional: false,
    autoform: {
      placeholder: 'Mailgun username'
    }
  },
  mailgun_password: {
    type: String,
    label: "Mailgun password",
    optional: false,
    autoform: {
      placeholder: 'Mailgun password'
    }
  },
  contactForm_toEmail: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    label: "Contact form e-mail address",
    optional: false,
    autoform: {
      placeholder: 'Contact form e-mail address'
    }
  },
  githubConfiguration_clientId: {
    type: String,
    label: "Github client id",
    optional: false,
    autoform: {
      placeholder: 'Github client id'
    }
  },
  githubConfiguration_secret: {
    type: String,
    label: "Github secret",
    optional: false,
    autoform: {
      placeholder: 'Github secret'
    }
  }
});


ProjectConfiguration.attachSchema(Schemas.ProjectConfigurationSchema);
