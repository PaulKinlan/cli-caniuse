/*!
 *
 *  Web Starter Kit
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
(function () {
  'use strict';

  var querySelector = document.querySelector.bind(document);

  var body = document.body;
  
  var main = querySelector('main');
  var querybar = querySelector('#querybar');
  var container = querySelector('#container');
  var stats;


  var currentCmd;
  var currentInput;

  var receiveMessage = function(e) {
    
    var output = e.data;

    if(currentCmd) {
      currentCmd.handleResponse({
        cmd_in: currentInput,
        cmd_out: output
      });
    }
    else {
      statsConsole.appendOutput(output);
    }
  };

  var queryProcessor =  function(input, cmd)  {
    currentCmd = cmd;
    currentInput = input;
    container.contentWindow.postMessage( input , document.location.origin);
    return true;
  };

  var statsConsole = new Cmd({
    selector: '#querybar',
    dark_css: '/styles/cmd.css',
    light_css: '/styles/cmd.css',
    external_processor: queryProcessor
  });

  statsConsole.setPrompt('> ');

  window.addEventListener("message", receiveMessage, false);
})();
