'use strict';

angular.module('backendCommunicationNotification', [])
.factory('backendNotification', function ($q, $interval) {
  var MESSAGE_TIMEOUT = 8000;
  var DEFAULT_FAIL_MESSAGE = 'We are sorry, but something went wrong!';
  return {
    messages: [],
    currentInfo: {},

    routeLoading: function(inProgress) {
      this.routeLoading = inProgress;
      return this.routeLoading;
    },

    /**
     * @nodoc
     * @private
     *
     * @description
     * Add promise to the queue and automatically remove
     * from the queue when the promise is resolved/rejected
     *
     * @param {Promise} promise The promise we are puttiong to queue
     * @param {String}  msg     Message showen to user
     * @param {Number}  severity Severity of this message
     * @param [{Promise}] promiseToRemove when this promise
     *      is resolved the message of *promiseToRemove* will be removed.
     */
    queueAdd: function(promise, msg, severity, promiseToRemove) {
      var self = this;
      this.messages.push({
        date: new Date(),
        msg: msg,
        promise: promise,
        severity: severity,
        promiseToRemove: promiseToRemove
      });
      promise.finally(function() {
        self.queueRemove(promise);
        if (promiseToRemove) {
          self.queueRemove(promiseToRemove);
        }
      });
      self.updateSeverityMsg();
    },

    /**
     * @private
     *
     * Removes promise info form the queue
     */
    queueRemove: function(promise) {
      for(var i = 0; i < this.messages.length; i++) {
        if (this.messages[i].promise === promise) {
          this.messages.splice(i, 1);
          this.updateSeverityMsg();
          break;
        }
      }
    },

    /**
     * Notify about given promise
     *
     * @param {Promise} promise The promise we are going to notify about
     * @param {Object}  msg     Message object, should contain *start*, *fail*, *success*
     *                          and *delay*.
     * @param {String} type     One of *all*, *only_fail*, *start_and_fail*, *success_and_fail*
     * @param {Number} severity Number higher are more several. Use is informed only about
     *                          the most important message
     */
    backgroundRequestStart: function(promise, msg, type, severity) {
      var self = this;
      severity = severity || 1;

      var start = function(promise) {
        self.queueAdd(promise, msg.start, severity);
      };
      var fail = function(r) {
        var d = $q.defer();
        $interval(function () { d.resolve(); }, MESSAGE_TIMEOUT, 1);
        var failMessage = msg.fail || DEFAULT_FAIL_MESSAGE;
        self.queueAdd(d.promise, failMessage, severity + 1000, start);
      };
      var success = function() {
        var d = $q.defer();
        $interval(function () { d.resolve(); }, msg.delay || MESSAGE_TIMEOUT, 1);
        self.queueAdd(d.promise, msg.success, severity + 100, start);
      };

      switch(type) {
        case 'all':
          break;
        case 'start':
          case 'only_start':
          success = angular.noop;
          fail = angular.noop;
          break;
        case 'fail':
        case 'only_fail':
          start = angular.noop;
          success = angular.noop;
          break;
        case 'success':
        case 'only_success':
          start = angular.noop;
          fail = angular.noop;
          break;
        case 'success_and_fail':
          start = angular.noop;
          break;
        case 'start_and_fail':
          success = angular.noop;
          break;
        default:
          throw('Unknown notification type');
      }
      start(promise);
      promise.then(success, fail);
    },

    /**
     * Notify on promise start
     * alias for backgroundRequestStart(*promise*, { start: *message* }, severity)
     *
     * @param {Promise} promise The promise we are going to notify about
     * @param {String}  message Message to display when promise  success
     * @param {Number} severity Number higher are more several. Use is informed only about
     *                          the most important message
    */

    notify: function(promise, message, severity) {
      promise = promise || $q.when(null);
      this.backgroundRequestStart(promise, { start: message }, 'start', severity);
    },


    /**
     * Notify on promise success
     * alias for backgroundRequestStart(*promise*, { success: *message* }, severity)
     *
     * @param {Promise} promise The promise we are going to notify about
     * @param {String}  message Message to display when promise  success
     * @param {Number} severity Number higher are more several. Use is informed only about
     *                          the most important message
    */

    onSuccess: function(promise, message, severity) {
      this.backgroundRequestStart(promise, { success: message }, 'success', severity);
    },

    /**
     * Notify when promise fails
     * alias for backgroundRequestStart(*promise*, { fail: *message* }, severity)
     *
     * @param {Promise} promise The promise we are going to notify about
     * @param {String}  message Message to display when promise  success
     * @param {Number} severity Number higher are more several. Use is informed only about
     *                          the most important message
    */

    onFail: function(promise, message, severity) {
      this.backgroundRequestStart(promise, { fail: message }, 'fail', severity);
    },


    /**
     * @private
     *
     * update *currentInfo*. Notice that *messages* are sorted by by severity and date
     *
     */

    updateSeverityMsg: function() {
      this.messages.sort(function (a, b) {
        var res = b.severity - a.severity;
        if (res === 0) {
          res = b.date.getTime() - a.date.getTime();
        }
        return res;
      });
      angular.extend(this.currentInfo, this.messages[0] || {severity: null, msg: null});
    }
  };
})

.controller('backendNotificationCtrl', function($scope, $window, backendNotification) {
  $scope.info = backendNotification.currentInfo;
  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (toState.resolve &&
        // do not display 'Loading' message OTHERWISE it won't disappear because
        // $stateChangeSuccess and $stateChangeError are not generated
        !$window.onbeforeunload)
      {
        $scope.loading = true;
      }
  });
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    //  Do not test toState.resolve.
    //  There are situation when event stateChangeStart is emited with resolve
    //  but when you redirect in resolve block by state.go then
    //  the stateChangeSuccess could be emmited without resolve block
    $scope.loading = false;
  });

  $scope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams) {
    $scope.loading = false;
  });


});

