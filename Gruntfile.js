'use strict';
/* eslint-env node */
var LIVERELOAD_PORT = 35729;
var SERVER_PORT = 9000;
var lrSnippet = require('connect-livereload')({
    port: LIVERELOAD_PORT
});
var serveStatic = require('serve-static');

var mountFolder = function(connect, dir) {
    return serveStatic(require('path').resolve(dir));
};

var modRewrite = require('connect-modrewrite');

module.exports = function(grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // configurable paths
    var yeomanConfig = {
        appName: 'Tenacity',
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            options: {
                nospawn: true,
                livereload: LIVERELOAD_PORT
            },
            livereload: {
                options: {
                    livereload: grunt.option('livereloadport') || LIVERELOAD_PORT
                },
                files: [
                    '<%= yeoman.app %>/*.html',
                    '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                    '<%= yeoman.app %>/scripts/templates/*.{ejs,mustache,hbs}',
                    'test/spec/**/*.js'
                ]
            },
            jst: {
                files: [
                    '<%= yeoman.app %>/scripts/templates/**/*.ejs',
                    '<%= yeoman.app %>/scripts/tenacity/templates/**/*.ejs'
                ],
                tasks: ['jst']
            },
            // test: {
            //     files: [
            //         '<%= yeoman.app %>/scripts/{,*/}*.js',
            //         'test/spec/**/*.js',
            //         '<%= yeoman.app %>/scripts/templates/*.{ejs,mustache,hbs}'
            //     ],
            //     tasks: ['test:true']
            // },
            less: {
                files: '<%= yeoman.app %>/styles/**/*.less',
                tasks: ['less']
            }
        },
        concurrent: {
            target: {
                tasks: ['karma:watch:debug', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        connect: {
            options: {
                port: grunt.option('port') || SERVER_PORT,
                // change this to '0.0.0.0' to access the server from outside
                hostname: '0.0.0.0'
            },
            // livereload: {
            //     options: {
            //         open: true,
            //         base: [
            //             '<%= yeoman.app %>'
            //         ],
            //         middleware: function(connect, options) {
            //             var middlewares = [];
            //
            //             middlewares.push(modRewrite(['^[^\\.]*$ /index.html [L]'])); // Matches everything that does not contain a '.' (period)
            //             options.base.forEach(function(base) {
            //                 middlewares.push(mountFolder(connect, base));
            //             });
            //             middlewares.push(lrSnippet);
            //             return middlewares;
            //         }
            //     }
            // },
            test: {
                options: {
                    port: 9001,
                    middleware: function(connect) {
                        return [
                            mountFolder(connect, 'test'),
                            lrSnippet,
                            //mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            coverage: {
                options: {
                    port: 9002,
                    middleware: function(connect) {
                        return [
                            mountFolder(connect, 'coverage/html')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function(connect) {
                        return [
                            mountFolder(connect, yeomanConfig.dist)
                        ];
                    }
                }
            }
        },
        karma: {
            watch: {
                configFile: 'karma.conf.js',
                singleRun: false,
                options: {}
            },
            once: {
                configFile: 'karma.conf.js',
                singleRun: true,
                options: {}
            }
        },
        open: {
            test: {
                path: 'http://localhost:<%= connect.test.options.port %>'
            },
            coverage: {
                path: 'http://localhost:<%= connect.coverage.options.port %>'
            }
        },
        clean: {
            dist: ['.tmp', '<%= yeoman.dist %>/*'],
            server: ['.tmp', 'coverage', 'junit', '<%= yeoman.dist %>/*']
        },
        eslint: {
            options: {},
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/**/*.js',
                '!<%= yeoman.app %>/scripts/templates.js',
                'test/spec/{,*/}*.js'
            ]
        },
        // useminPrepare: {
        //     html: '<%= yeoman.app %>/index.html',
        //     options: {
        //         dest: '<%= yeoman.dist %>'
        //     }
        // },
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                dirs: ['<%= yeoman.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        less: {
            development: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    'app/styles/main.css': 'app/styles/main.less'
                }
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/styles/main.css': [
                        '.tmp/styles/{,*/}*.css',
                        '<%= yeoman.app %>/styles/{,*/}*.css'
                    ]
                }
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,txt}',
                        'images/{,*/}*.{webp,gif}',
                        // 'styles/fonts/{,*/}*.*',
                        'app/!config.js',
                        'app/!index.html'
                    ]
                }, {
                    src: 'node_modules/apache-server-configs/dist/.htaccess',
                    dest: '<%= yeoman.dist %>/.htaccess'
                }, {
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>/bower_components/font-awesome',
                    src: ['fonts/*.*'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        filetransform: {
            cshtml: {
                options: {
                    map: function(contents) {
                        return contents.replace('/* RAZOR CODE', '').replace('<!--DIST', '').replace('/DIST-->', '');
                    }
                },
                files: {
                    '<%= yeoman.dist %>/index.cshtml': ['<%= yeoman.dist %>/index.html']
                }
            },
            testData: {
                options: {
                    map: function(contents) {
                        return '\'use strict\';\ndefine([], function() { \nreturn ' + contents + ';\n});';
                    }
                },
                files: {
                    '<%= yeoman.app %>/scripts/helpers/testData/headers.js': ['../SurveyBoss.Server/SurveyEditor.Query.Tests/UiTestData/UiTestDataTests.SurveyHeaderTestData.approved.json'],
                    '<%= yeoman.app %>/scripts/helpers/testData/workflow.js': ['../SurveyBoss.Server/SurveyEditor.Query.Tests/UiTestData/UiTestDataTests.SectionWorkflowTestData.approved.json'],
                    '<%= yeoman.app %>/scripts/helpers/testData/nodeProperties.js': ['../SurveyBoss.Server/SurveyEditor.Query.Tests/UiTestData/UiTestDataTests.NodeDetailsTestData.approved.json']
                }
            },
            signalR: {
                options: {
                    map: function(contents) {
                        return contents.replace('$.hubConnection("{URL}"', '$.hubConnection(require(\'config\').get(\'signalrEndpointUrl\')');
                    }
                },
                files: {
                    '<%= yeoman.app %>/scripts/helpers/signalrHubs.js': ['../SurveyBoss.Server/SurveyEditor.Web.Tests/UiTestData/ProxyGenerator.SignalrJsProxy.approved.txt']
                }
            },
            templatesCoverage: {
                options: {
                    map: function(contents) {
                        contents = contents.replace(/function print\(\)/g, '/* istanbul ignore next */ function print()');
                        contents = contents.replace(/ == null \? '' :/g, ' == null /* istanbul ignore next */? \'\' :');
                        return contents;
                    }
                },
                files: {
                    '<%= yeoman.app %>/scripts/templates.js': ['<%= yeoman.app %>/scripts/templates.js']
                }
            }
        },
        bower: {
            all: {
                rjsConfig: '<%= yeoman.app %>/scripts/tenacity.js'
            }
        },
        jst: {
            options: {
                amd: true
            },
            compile: {
                files: {
                    '<%= yeoman.app %>/scripts/templates.js': ['<%= yeoman.app %>/scripts/tenacity/templates/**/*.ejs']
                },
                options: {
                    templateSettings: {
                        variable: 'model'
                    }
                }
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '/styles/fonts/{,*/}*.*'
                    ]
                }
            }
        },
        // htmlmin: {
        //     dist: {
        //         files: [{
        //             expand: true,
        //             cwd: '<%= yeoman.app %>',
        //             src: '*.html',
        //             dest: '<%= yeoman.dist %>'
        //         }]
        //     }
        // },
        githooks: {
            all: {
                'pre-commit': 'test'
            }
        },
        concat: {
            options: {
                sourceMap: true
            }
        },

        uglify: {
            options: {
                sourceMap: true,
                sourceMapIn: function(uglifySource) {
                    return uglifySource + '.map';
                },
                sourceMapIncludeSources: true
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: './app/scripts',
                    mainConfigFile: './app/scripts/common.js',
                    include: ['tenacity'],
                    // exclude: ['jquery', 'backbone', 'underscore'],
                    name: '../bower_components/almond/almond',
                    out: 'dist/tenacity.js',
                    paths: {
                        'jquery': 'stubs/jquery',
                        'backbone': 'stubs/backbone',
                        'underscore': 'stubs/underscore'
                        // 'moment': 'empty:',
                        // 'deepModel': 'empty:',
                        // 'ace': 'empty:'
                    },
                    findNestedDependencies: true,
                    cjsTranslate: true,
                    namespace: 'requacity',
                    wrap: {
                        startFile: 'wrap-start.frag',
                        endFile: 'wrap-end.frag'
                    },
                    optimize: 'none'
                }
            }
        }
    });

    grunt.registerTask('serve', function() {
        grunt.option('debug', true);
        grunt.task.run([
            'clean:server',
            'jst',
            'less',
            // 'connect:livereload',
            'connect:coverage',
            'concurrent:target'
        ]);
    });

    grunt.registerTask('coverage', function() {
        grunt.task.run([
            'clean:server',
            'jst',
            'filetransform:templatesCoverage',
            'karma:once',
            'connect:coverage',
            'open:coverage',
            'concurrent:target'
        ]);
    });

    grunt.registerTask('test', function(isConnected) {
        isConnected = Boolean(isConnected);
        var testTasks = [
            'clean:server',
            'jst',
            'filetransform:templatesCoverage',
            'karma:once',
            'eslint'
        ];

        return grunt.task.run(testTasks);
    });

    grunt.registerTask('build', [
        'clean:dist',
        // 'jst',
        // 'less',
        // 'useminPrepare',
        'requirejs',
        // 'imagemin',
        // 'htmlmin',
        // 'concat',
        // 'cssmin',
        // 'uglify',
        // 'copy:dist',
        // 'rev',
        // 'usemin',
        // 'filetransform:cshtml',
        // 'clean:html'
    ]);
};