= backend-notification

Sorry README file in progress.




put into your index.html`:

     <div ng-cloak id="backend-notification" ng-controller='backendNotificationCtrl'>
       <div ng-init="loadingMessage = 'Loading...'" ng-bind="loadingMessage" ng-class="{'loading-spinner': true}" ng-show='loading' ></div>
       <div  ng-show='info.severity' ng-class="{error: info.severity > 1000, 'flash-message': true }" class="alert-dismissible">
         <button type="button" class="close" ng-click="info.severity = undefined">
           <span aria-hidden="true">&nbsp;&times;</span><span class="sr-only">Close</span>
         </button>
         <span ng-bind="info.msg"></span>
       </div>
       <!-- just for debugging INFO: {{info|json}} -->
     </div>
     <div class="container-fluid" ui-view id="content"></div>


include module `backendCommunicationNotification` in your project
e.g.: `angular.module('myApp', ['backendCommunicationNotification', ... ])`

... and add styles. For instance in less format whith bootstrap you
can use:

     /* Backend notification */
     #backend-notification {
       position: fixed;
       z-index: 1000;
       /* center the element */
       top: 0;
       right: 0;
       left: 0;
       margin-right: auto;
       margin-left: auto;
       width: 30%;

       div {
         position: relative;
         text-align: center;
         .alert();
       }

     }

     .loading-spinner {
       .alert-info();
     }

     .flash-message {
       .alert-info();
     }
