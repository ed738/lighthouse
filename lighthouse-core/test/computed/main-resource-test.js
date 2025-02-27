/**
 * @license Copyright 2017 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {strict as assert} from 'assert';

import {readJson} from '../../../root.js';
import MainResource from '../../computed/main-resource.js';
import networkRecordsToDevtoolsLog from '../network-records-to-devtools-log.js';

const wikipediaDevtoolsLog = readJson('../fixtures/wikipedia-redirect.devtoolslog.json', import.meta);

describe('MainResource computed artifact', () => {
  it('returns an artifact', () => {
    const record = {
      url: 'https://example.com',
    };
    const networkRecords = [
      {url: 'http://example.com'},
      record,
    ];
    const URL = {mainDocumentUrl: 'https://example.com'};
    const devtoolsLog = networkRecordsToDevtoolsLog(networkRecords);

    const context = {computedCache: new Map()};
    return MainResource.request({URL, devtoolsLog}, context).then(output => {
      assert.equal(output.url, record.url);
    });
  });

  it('thows when main resource can\'t be found', () => {
    const networkRecords = [
      {url: 'https://example.com', resourceType: 'Script'},
    ];
    const URL = {mainDocumentUrl: 'https://m.example.com'};
    const devtoolsLog = networkRecordsToDevtoolsLog(networkRecords);

    const context = {computedCache: new Map()};
    return MainResource.request({URL, devtoolsLog}, context).then(() => {
      assert.ok(false, 'should have thrown');
    }).catch(err => {
      assert.equal(err.message, 'Unable to identify the main resource');
    });
  });

  it('should identify correct main resource in the wikipedia fixture', () => {
    const wikiDevtoolsLog = wikipediaDevtoolsLog;
    const URL = {mainDocumentUrl: 'https://en.m.wikipedia.org/wiki/Main_Page'};
    const artifacts = {devtoolsLog: wikiDevtoolsLog, URL};

    const context = {computedCache: new Map()};
    return MainResource.request(artifacts, context).then(output => {
      assert.equal(output.url, 'https://en.m.wikipedia.org/wiki/Main_Page');
    });
  });

  it('should identify correct main resource with hash URLs', () => {
    const networkRecords = [
      {url: 'https://beta.httparchive.org/reports'},
      {url: 'https://beta.httparchive.org/reports/state-of-the-web'},
    ];

    const URL = {mainDocumentUrl: 'https://beta.httparchive.org/reports/state-of-the-web#pctHttps'};
    const devtoolsLog = networkRecordsToDevtoolsLog(networkRecords);
    const artifacts = {URL, devtoolsLog};

    const context = {computedCache: new Map()};
    return MainResource.request(artifacts, context).then(output => {
      assert.equal(output.url, 'https://beta.httparchive.org/reports/state-of-the-web');
    });
  });
});
