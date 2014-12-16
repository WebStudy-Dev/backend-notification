'use strict';

describe('backendNotification', function () {

  beforeEach(module('backendCommunicationNotification'));

  // instantiate service
  var $timeout, $q, backendNotification, $rootScope;

  var msg = {
      start: 'start',
      fail: 'fails',
      success: 'success'
  };

  var $scope;

  beforeEach(inject(
    function (_backendNotification_, _$timeout_, _$q_, _$rootScope_) {
      backendNotification = _backendNotification_;
      $timeout = _$timeout_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      $scope = new $rootScope.$new();
    }
  ));

  it('should report none message by default', function () {
      expect(backendNotification.currentInfo).toEqual({});
  });

  describe('when promise start:', function () {
    var p;
    beforeEach(function() {
        p = $q.defer().promise;
    });

    it('should notify about progress start', function () {
        backendNotification.backgroundRequestStart(p, msg, 'start');
        expect(backendNotification.currentInfo.msg).toBe(msg.start);
    });

    it('should notify about progress for all type', function () {
        backendNotification.backgroundRequestStart(p, msg, 'all');
        expect(backendNotification.currentInfo.msg).toBe(msg.start);
    });

    it('should notify about progress for start_and_fail type', function () {
        backendNotification.backgroundRequestStart(p, msg, 'start_and_fail');
        expect(backendNotification.currentInfo.msg).toBe(msg.start);
    });

    it('should not notify about progress for only_success type', function () {
      backendNotification.backgroundRequestStart(p, msg, 'only_success');
      expect(backendNotification.currentInfo).toEqual({});
    });

    it('should not notify about progress for only_fail type', function () {
      backendNotification.backgroundRequestStart(p, msg, 'only_fail');
      expect(backendNotification.currentInfo).toEqual({});
    });

    it('should not notify about progress for success_and_fail type', function () {
      backendNotification.backgroundRequestStart(p, msg, 'success_and_fail');
      expect(backendNotification.currentInfo).toEqual({});
    });

  });

  describe('when promise succeed:', function () {
    var p;
    beforeEach(function() {
        p = $q.when(1);
    });

    it('should notify about finsh for all type', function () {
        backendNotification.backgroundRequestStart(p, msg, 'all');
        $rootScope.$digest();
        expect(backendNotification.currentInfo.msg).toBe(msg.success);
    });

    it('should notify about finsh for only_success', function () {
        backendNotification.backgroundRequestStart(p, msg, 'only_success');
        $rootScope.$digest();
        expect(backendNotification.currentInfo.msg).toBe(msg.success);
    });


    it('should notify about finish success_and_fail all type', function () {
        backendNotification.backgroundRequestStart(p, msg, 'success_and_fail');
        $rootScope.$digest();
        expect(backendNotification.currentInfo.msg).toBe(msg.success);
    });

    it('should not notify about finish for only_fail and start_and_fail type', function () {
      backendNotification.backgroundRequestStart(p, msg, 'only_fail');
      $rootScope.$digest();
      expect(backendNotification.currentInfo).toEqual({});

      backendNotification.backgroundRequestStart(p, msg, 'start_and_fail');
      $rootScope.$digest();
      expect(backendNotification.currentInfo.severity).toEqual(null);
    });
  });

  describe('when promise fail:', function () {
    var p;
    beforeEach(function() {
         var deffered = $q.defer();
        deffered.reject(true);
        p = deffered.promise;
    });

    it('should notify about failure for all type', function () {
        backendNotification.backgroundRequestStart(p, msg, 'all');
        $rootScope.$digest();
        expect(backendNotification.currentInfo.msg).toBe(msg.fail);
    });

    it('should notify about failure success_and_fail type', function () {
        backendNotification.backgroundRequestStart(p, msg, 'success_and_fail');
        $rootScope.$digest();
        expect(backendNotification.currentInfo.msg).toBe(msg.fail);
    });

    it('should notify about failure for success_and_fail type', function () {
        backendNotification.backgroundRequestStart(p, msg, 'success_and_fail');
        $rootScope.$digest();
        expect(backendNotification.currentInfo.msg).toBe(msg.fail);
    });

    it('should not notify about failure for only_success type', function () {
        backendNotification.backgroundRequestStart(p, msg, 'only_success');
        $rootScope.$digest();
        expect(backendNotification.currentInfo.msg).toEqual(null);
    });

  });


  it('should show the most severity message', function () {
    var p = $q.defer().promise;
    backendNotification.backgroundRequestStart(p, msg, 'all', 10000);
    backendNotification.backgroundRequestStart(p, { start: 'winner'}, 'all', 30000);
    backendNotification.backgroundRequestStart(p, msg, 'all', 20000);
    expect(backendNotification.currentInfo.msg).toBe('winner');
  });

  it('should show fail message with higher priority then start and success messages', function() {
    var start = $q.defer().promise;
    var success = $q.when(1);
    var dReject = $q.defer();
    dReject.reject(true);
    var fail = dReject.promise;

    backendNotification.backgroundRequestStart(fail, msg, 'all', 10000);
    backendNotification.backgroundRequestStart(start, msg, 'all', 10000);
    backendNotification.backgroundRequestStart(success, msg, 'all', 10000);
    $rootScope.$digest();

    expect(backendNotification.currentInfo.msg).toBe(msg.fail);
  });

  describe('notify', function () {
    it('should immediately show notification without promisse', function () {
      backendNotification.notify(null, msg.start);
      expect(backendNotification.currentInfo.msg).toBe(msg.start);
    });

    it('should immediately show notification without promisse', function () {
      backendNotification.notify($q.defer.promise, msg.start);
      expect(backendNotification.currentInfo.msg).toBe(msg.start);
    });
  });

  describe('onSuccess', function () {
    var p;
    beforeEach(function() {
         var deffered = $q.defer();
        deffered.reject(true);
        p = deffered.promise;
    });

    it('should show notification when promisse succeed', function () {
      backendNotification.onSuccess($q.when(1), msg.start);
      $rootScope.$digest();
      expect(backendNotification.currentInfo.msg).toBe(msg.start);
    });

    it('should not show notification when promisse fails', function () {
      backendNotification.onSuccess(p, msg.start);
      expect(backendNotification.currentInfo.msg).toBe(undefined);
    });
  });

  describe('onFail', function () {
    var p;
    beforeEach(function() {
         var deffered = $q.defer();
        deffered.reject(true);
        p = deffered.promise;
    });

    it('should show notification when promisse fails', function () {
      backendNotification.onFail(p, msg.fail);
      $rootScope.$digest();
      expect(backendNotification.currentInfo.msg).toBe(msg.fail);
    });

    it('should not show notification when promisse succeed', function () {
      backendNotification.onFail($q.when(1), msg.fail);
      expect(backendNotification.currentInfo.msg).toBe(undefined);
    });
  });

});


