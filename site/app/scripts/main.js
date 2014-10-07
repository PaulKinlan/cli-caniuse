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

  var navdrawerContainer = querySelector('.navdrawer-container');
  var body = document.body;
  var appbarElement = querySelector('.app-bar');
  var menuBtn = querySelector('.menu');
  var main = querySelector('main');
  var querybar = querySelector('#querybar');
  var container = querySelector('#container');
  var stats;

  function closeMenu() {
    body.classList.remove('open');
    appbarElement.classList.remove('open');
    navdrawerContainer.classList.remove('open');
  }

  function toggleMenu() {
    body.classList.toggle('open');
    appbarElement.classList.toggle('open');
    navdrawerContainer.classList.toggle('open');
    navdrawerContainer.classList.add('opened');
  }

  main.addEventListener('click', closeMenu);
  menuBtn.addEventListener('click', toggleMenu);
  navdrawerContainer.addEventListener('click', function (event) {
    if (event.target.nodeName === 'A' || event.target.nodeName === 'LI') {
      closeMenu();
    }
  });


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

  window.addEventListener('load', function() {
    var deviceType = 'all';
    stats = new BrowserStats();

    stats.load(deviceType, function(data) {

      var allFeatures = this.getFeatures();

      // Era work
      var soon = this.getEras([3,2,1])
      var today = this.getEras([0]);
      var last_version = this.getEras([-1]);
      var last_last_version = this.getEras([-2]);

      var commingSoon = __.difference(soon, today);


      var featuresInTwo = __.difference(allFeatures.chrome['38'], allFeatures.chrome['34']);
     

      var not_in_ie = __.difference(allFeatures.chrome['38'], allFeatures.ie['11']);
      var not_in_chrome = __.difference(allFeatures.ie['11'], allFeatures.chrome['38']);

      var not_in_chrome_and = __.difference(allFeatures.chrome['37'], allFeatures.and_chr['37']);


      var not_in_ie8 = __.difference(allFeatures.ie['9'], allFeatures.ie['8']);
      var new_features1 = __.difference(allFeatures.ie['9'], allFeatures.ie['8']);
      var new_features = __.difference(allFeatures.ie['11'], allFeatures.ie['10']);
      var features_in_both = __.intersection(allFeatures.ie['11'], allFeatures.ie['10']);
    }.bind(stats));
  });
})();
