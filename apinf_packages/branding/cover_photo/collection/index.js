/* Copyright 2017 Apinf Oy
This file is covered by the EUPL license.
You may obtain a copy of the licence at
https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { FileCollection } from 'meteor/vsivsi:file-collection';

const CoverPhoto = new FileCollection('CoverPhoto', {
  resumable: true,   // Enable built-in resumable.js upload support
  http: [
    { method: 'get',
      // this will be at route "/gridfs/CoverPhoto/md5/:md5"
      path: '/md5/:md5',
      // uses express style url params
      // a query mapping url to CoverPhoto
      lookup (params) {
        return { md5: params.md5 };
      },
    },
  ],
});

export default CoverPhoto;
