Backend-notification
------------------------
It is possible to:
* display flash message on specific events - when request was sent / completed (sucessfully or not)
* specify interval after which flash should be hidden. Uses `$inverval` which allows testing with protractor
* supports queue of messages which are displayed by its severity
* ...

First of all you need to install from repository. It is not available as official bower package yet.
```
bower install -S https://github.com/WebStudy-Dev/backend-notification.git
```
Then include module `backendCommunicationNotification` in your project e.g.:
```js
angular.module('myApp', ['backendCommunicationNotification', ... ])
```
And you can use it in your HTML (index.html):
```html
     <div ng-cloak id="backend-notification" ng-controller='backendNotificationCtrl'>

        <!--Displays "Loading..." on every request -->
        <div ng-init="loadingMessage = 'Loading...'" ng-bind="loadingMessage" ng-class="{'loading-spinner': true}" ng-show='loading' ></div>
        <!--Displays flash message-->
        <div  ng-show='info.severity' ng-class="{error: info.severity > 1000, 'flash-message': true }" class="alert-dismissible">
          <button type="button" class="close" ng-click="info.severity = undefined">
            <span aria-hidden="true">&nbsp;&times;</span><span class="sr-only">Close</span>
          </button>
          <span ng-bind="info.msg"></span>
        </div>
      </div>
```

Last thing is to call appropriate method on `backendNotification` service (methods are documented in source file).

```js
var reqPromise = $http.get(...);

backendNotification.backgroundRequestStart(
  reqPromise,  {
    fail: 'We are sorry, but something went wrong!'
  },
  'only_fail'
);
```


Here is an example of styles in less format with bootstrap.
```css
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

.init-loading-spinner {
  font-size: 24pt;
  //horizontal and vertical center
  width: 50%;
  height: 50%;
  overflow: auto;
  margin: auto;
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
}

.loading-spinner {
  .alert-info();
}

.flash-message {
  .alert-info();
}
```
