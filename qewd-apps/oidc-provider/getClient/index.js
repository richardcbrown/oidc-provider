/*

 ----------------------------------------------------------------------------
 | oidc-provider: OIDC Provider QEWD-Up MicroService                        |
 |                                                                          |
 | Copyright (c) 2019 M/Gateway Developments Ltd,                           |
 | Redhill, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  9 April 2019

*/

//var oidc_config = require('/opt/qewd/mapped/configuration/oidc.json');


function getAClient(clientsDoc, client_id) {

  var orchestrator = this.oidc.orchestrator;
  var orchestratorHost = orchestrator.host;
  if (orchestrator.port) {
    orchestratorHost = orchestratorHost + ':' + orchestrator.port;
  }

  var id = clientsDoc.$(['by_client_id', client_id]).value;
  var client = clientsDoc.$(['by_id', id]).getDocument(true);
  var post_logout_uri_path = client.post_logout_uri_path;
  var clientObj = {
    client_id: client.client_id,
    client_secret: client.client_secret,
    redirect_uris: [orchestratorHost + client.redirect_uri_path],
    post_logout_redirect_uris: [orchestratorHost + post_logout_uri_path]
  };
  if (client.grant_types) {
    clientObj.grant_types = client.grant_types;
  }
  return clientObj;
}

module.exports = function(messageObj, session, send, finished) {
  var client_id;
  if (messageObj.params) client_id = messageObj.params.id;
  if (!client_id || client_id === '') {
    return finished({error: 'Missing or empty Client Id'});
  }
  var clientsDoc = this.db.use(this.oidc.documentName, 'Clients');
  var clientIndex = clientsDoc.$(['by_client_id', client_id]);
  if (clientIndex.exists) {
    finished(getAClient.call(this, clientsDoc, client_id));
  }
  else {
    finished({error: 'No such Client'});
  }
};
