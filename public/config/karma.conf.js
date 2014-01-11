/**
 * Created by peter on 04/01/2014.
 */
module.exports = function(config){
    config.set({
        basePath : '../',

        files : [
            'lib/angular/angular.min.js',
            'lib/angular/angular-sanitize.min.js',
            'test/lib/angular/angular-mocks.js',
            'app/**/*.js',
            'test/**/*.js'
        ],

        preprocessors: {
            'app/**/*.js': 'coverage'
        },

        reporters: ['dots', 'coverage'],

        coverageReporter: {
            type : 'html',
            dir : 'coverage/'
        },

        autoWatch : true,

        frameworks: ['jasmine'],

        browsers : ['Chrome'],

        plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-coverage'
        ],

        junitReporter : {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    })}

