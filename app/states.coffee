class States extends Config
    constructor: ($stateProvider, $urlRouterProvider) ->
        $urlRouterProvider.otherwise '/'

        $stateProvider
        	.state 'root',
        		url : '/', templateUrl : 'states/root/content.html', controller: 'rootController'

