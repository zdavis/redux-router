'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = routeReplacement;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _redux = require('redux');

var _reactRouter = require('react-router');

var _replaceRoutesMiddleware = require('./replaceRoutesMiddleware');

var _replaceRoutesMiddleware2 = _interopRequireDefault(_replaceRoutesMiddleware);

function routeReplacement(next) {
  return function (options) {
    return function (createStore) {
      return function (reducer, initialState) {
        var baseRoutes = options.routes;
        var getRoutes = options.getRoutes;
        var routerStateSelector = options.routerStateSelector;

        var store = undefined;

        var childRoutes = [];
        var areChildRoutesResolved = false;
        var childRoutesCallbacks = [];

        function replaceRoutes(r) {
          childRoutes = _reactRouter.createRoutes(r);

          var routerState = routerStateSelector(store.getState());
          if (routerState) {
            var _routerState$location = routerState.location;
            var state = _routerState$location.state;
            var pathname = _routerState$location.pathname;
            var query = _routerState$location.query;

            if (routerState.location.hasOwnProperty('hash')) pathname = '' + pathname + routerState.location.hash;
            store.history.replaceState(state, pathname, query);
          }

          if (!areChildRoutesResolved) {
            areChildRoutesResolved = true;
            childRoutesCallbacks.forEach(function (cb) {
              return cb(null, childRoutes);
            });
          }
        }

        var routes = undefined;
        if (baseRoutes) {
          routes = baseRoutes;
        } else if (getRoutes) {
          routes = getRoutes({
            dispatch: function dispatch(action) {
              return store.dispatch(action);
            },
            getState: function getState() {
              return store.getState();
            }
          });
        } else {
          routes = [{
            getChildRoutes: function getChildRoutes(location, cb) {
              if (!areChildRoutesResolved) {
                childRoutesCallbacks.push(cb);
                return;
              }

              cb(null, childRoutes);
            }
          }];
        }

        store = _redux.compose(_redux.applyMiddleware(_replaceRoutesMiddleware2['default'](replaceRoutes)), next(_extends({}, options, {
          routes: _reactRouter.createRoutes(routes)
        })))(createStore)(reducer, initialState);

        return store;
      };
    };
  };
}

module.exports = exports['default'];