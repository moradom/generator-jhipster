/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable consistent-return */
const chalk = require('chalk');
const _ = require('lodash');
const crypto = require('crypto');
const os = require('os');
const prompts = require('./prompts');
const BaseGenerator = require('../generator-base');
const writeFiles = require('./files').writeFiles;
const packagejs = require('../../package.json');
const constants = require('../generator-constants');
const statistics = require('../statistics');

let useBlueprint;

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);

        this.configOptions = this.options.configOptions || {};
        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false
        });
        // This adds support for a `--[no-]client-hook` flag
        this.option('client-hook', {
            desc: 'Enable Webpack hook from maven/gradle build',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--[no-]i18n` flag
        this.option('i18n', {
            desc: 'Disable or enable i18n when skipping client side generation, has no effect otherwise',
            type: Boolean,
            defaults: true
        });

        // This adds support for a `--protractor` flag
        this.option('protractor', {
            desc: 'Enable protractor tests',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--cucumber` flag
        this.option('cucumber', {
            desc: 'Enable cucumber tests',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--skip-user-management` flag
        this.option('skip-user-management', {
            desc: 'Skip the user management module during app generation',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--experimental` flag which can be used to enable experimental features
        this.option('experimental', {
            desc:
                'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
            type: Boolean,
            defaults: false
        });

        this.setupServerOptions(this);
        const blueprint = this.options.blueprint || this.configOptions.blueprint || this.config.get('blueprint');
        if (!opts.fromBlueprint) {
            // use global variable since getters dont have access to instance property
            useBlueprint = this.composeBlueprint(blueprint, 'server', {
                'client-hook': !this.skipClient,
                'from-cli': this.options['from-cli'],
                configOptions: this.configOptions,
                force: this.options.force
            });
        } else {
            useBlueprint = false;
        }
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            validateFromCli() {
                if (!this.options['from-cli']) {
                    this.warning(
                        `Deprecated: JHipster seems to be invoked using Yeoman command. Please use the JHipster CLI. Run ${chalk.red(
                            'jhipster <command>'
                        )} instead of ${chalk.red('yo jhipster:<command>')}`
                    );
                }
            },

            displayLogo() {
                if (this.logo) {
                    this.printJHipsterLogo();
                }
            },

            setupServerconsts() {
                // Make constants available in templates
                this.MAIN_DIR = constants.MAIN_DIR;
                this.TEST_DIR = constants.TEST_DIR;
                this.CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
                this.CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
                this.SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
                this.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
                this.SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;
                this.SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;

                this.DOCKER_JHIPSTER_REGISTRY = constants.DOCKER_JHIPSTER_REGISTRY;
                this.DOCKER_JAVA_JRE = constants.DOCKER_JAVA_JRE;
                this.DOCKER_MYSQL = constants.DOCKER_MYSQL;
                this.DOCKER_MARIADB = constants.DOCKER_MARIADB;
                this.DOCKER_POSTGRESQL = constants.DOCKER_POSTGRESQL;
                this.DOCKER_MONGODB = constants.DOCKER_MONGODB;
                this.DOCKER_COUCHBASE = constants.DOCKER_COUCHBASE;
                this.DOCKER_MSSQL = constants.DOCKER_MSSQL;
                this.DOCKER_ORACLE = constants.DOCKER_ORACLE;
                this.DOCKER_HAZELCAST_MANAGEMENT_CENTER = constants.DOCKER_HAZELCAST_MANAGEMENT_CENTER;
                this.DOCKER_MEMCACHED = constants.DOCKER_MEMCACHED;
                this.DOCKER_CASSANDRA = constants.DOCKER_CASSANDRA;
                this.DOCKER_ELASTICSEARCH = constants.DOCKER_ELASTICSEARCH;
                this.DOCKER_KEYCLOAK = constants.DOCKER_KEYCLOAK;
                this.DOCKER_KAFKA = constants.DOCKER_KAFKA;
                this.DOCKER_ZOOKEEPER = constants.DOCKER_ZOOKEEPER;
                this.DOCKER_SONAR = constants.DOCKER_SONAR;
                this.DOCKER_JHIPSTER_CONSOLE = constants.DOCKER_JHIPSTER_CONSOLE;
                this.DOCKER_JHIPSTER_ELASTICSEARCH = constants.DOCKER_JHIPSTER_ELASTICSEARCH;
                this.DOCKER_JHIPSTER_LOGSTASH = constants.DOCKER_JHIPSTER_LOGSTASH;
                this.DOCKER_TRAEFIK = constants.DOCKER_TRAEFIK;
                this.DOCKER_CONSUL = constants.DOCKER_CONSUL;
                this.DOCKER_CONSUL_CONFIG_LOADER = constants.DOCKER_CONSUL_CONFIG_LOADER;
                this.DOCKER_SWAGGER_EDITOR = constants.DOCKER_SWAGGER_EDITOR;

                this.JAVA_VERSION = constants.JAVA_VERSION;
                this.SCALA_VERSION = constants.SCALA_VERSION;

                this.NODE_VERSION = constants.NODE_VERSION;
                this.YARN_VERSION = constants.YARN_VERSION;
                this.NPM_VERSION = constants.NPM_VERSION;

                this.packagejs = packagejs;
                const configuration = this.getAllJhipsterConfig(this, true);
                this.applicationType = configuration.get('applicationType') || this.configOptions.applicationType;
                if (!this.applicationType) {
                    this.applicationType = 'monolith';
                }
                this.reactive = configuration.get('reactive') || this.configOptions.reactive;
                this.reactiveRepository = this.reactive ? 'reactive/' : '';
                this.packageName = configuration.get('packageName');
                this.serverPort = configuration.get('serverPort');
                if (this.serverPort === undefined) {
                    this.serverPort = '8080';
                }
                this.websocket = configuration.get('websocket') === 'no' ? false : configuration.get('websocket');
                if (this.websocket === undefined) {
                    this.websocket = false;
                }
                this.searchEngine = configuration.get('searchEngine') === 'no' ? false : configuration.get('searchEngine');
                if (this.searchEngine === undefined) {
                    this.searchEngine = false;
                }
                this.jhiPrefix = this.configOptions.jhiPrefix || configuration.get('jhiPrefix');
                this.jhiTablePrefix = this.getTableName(this.jhiPrefix);
                this.messageBroker = configuration.get('messageBroker') === 'no' ? false : configuration.get('messageBroker');
                if (this.messageBroker === undefined) {
                    this.messageBroker = false;
                }

                this.enableSwaggerCodegen = configuration.get('enableSwaggerCodegen');

                this.serviceDiscoveryType =
                    configuration.get('serviceDiscoveryType') === 'no' ? false : configuration.get('serviceDiscoveryType');
                if (this.serviceDiscoveryType === undefined) {
                    this.serviceDiscoveryType = false;
                }

                this.cacheProvider = configuration.get('cacheProvider') || configuration.get('hibernateCache') || 'no';
                this.enableHibernateCache =
                    configuration.get('enableHibernateCache') ||
                    (configuration.get('hibernateCache') !== undefined &&
                        configuration.get('hibernateCache') !== 'no' &&
                        configuration.get('hibernateCache') !== 'memcached');

                this.databaseType = configuration.get('databaseType');
                if (this.databaseType === 'mongodb') {
                    this.devDatabaseType = 'mongodb';
                    this.prodDatabaseType = 'mongodb';
                    this.enableHibernateCache = false;
                } else if (this.databaseType === 'couchbase') {
                    this.devDatabaseType = 'couchbase';
                    this.prodDatabaseType = 'couchbase';
                    this.enableHibernateCache = false;
                } else if (this.databaseType === 'cassandra') {
                    this.devDatabaseType = 'cassandra';
                    this.prodDatabaseType = 'cassandra';
                    this.enableHibernateCache = false;
                } else if (this.databaseType === 'no') {
                    // no database, only available for microservice applications
                    this.devDatabaseType = 'no';
                    this.prodDatabaseType = 'no';
                    this.enableHibernateCache = false;
                } else {
                    // sql
                    this.devDatabaseType = configuration.get('devDatabaseType');
                    this.prodDatabaseType = configuration.get('prodDatabaseType');
                }

                // Hazelcast is mandatory for Gateways, as it is used for rate limiting
                if (this.applicationType === 'gateway' && this.serviceDiscoveryType) {
                    this.cacheProvider = 'hazelcast';
                }

                this.buildTool = configuration.get('buildTool');
                this.jhipsterVersion = packagejs.version;
                if (this.jhipsterVersion === undefined) {
                    this.jhipsterVersion = configuration.get('jhipsterVersion');
                }
                this.authenticationType = configuration.get('authenticationType');
                if (this.authenticationType === 'session') {
                    this.rememberMeKey = configuration.get('rememberMeKey');
                }
                this.jwtSecretKey = configuration.get('jwtSecretKey');
                this.nativeLanguage = configuration.get('nativeLanguage');
                this.languages = configuration.get('languages');
                this.uaaBaseName = configuration.get('uaaBaseName');
                this.clientFramework = configuration.get('clientFramework');
                const testFrameworks = configuration.get('testFrameworks');
                if (testFrameworks) {
                    this.testFrameworks = testFrameworks;
                }

                const baseName = configuration.get('baseName');
                if (baseName) {
                    // to avoid overriding name from configOptions
                    this.baseName = baseName;
                }

                // force variables unused by microservice applications
                if (this.applicationType === 'microservice' || this.applicationType === 'uaa') {
                    this.websocket = false;
                }

                const serverConfigFound =
                    this.packageName !== undefined &&
                    this.authenticationType !== undefined &&
                    this.cacheProvider !== undefined &&
                    this.enableHibernateCache !== undefined &&
                    this.websocket !== undefined &&
                    this.databaseType !== undefined &&
                    this.devDatabaseType !== undefined &&
                    this.prodDatabaseType !== undefined &&
                    this.searchEngine !== undefined &&
                    this.buildTool !== undefined;

                if (this.baseName !== undefined && serverConfigFound) {
                    // Generate remember me key if key does not already exist in config
                    if (this.authenticationType === 'session' && this.rememberMeKey === undefined) {
                        this.rememberMeKey = crypto.randomBytes(50).toString('hex');
                    }

                    // Generate JWT secret key if key does not already exist in config
                    if (this.authenticationType === 'jwt' && this.jwtSecretKey === undefined) {
                        this.jwtSecretKey = Buffer.from(crypto.randomBytes(64).toString('hex')).toString('base64');
                    }

                    // If translation is not defined, it is enabled by default
                    if (this.enableTranslation === undefined) {
                        this.enableTranslation = true;
                    }
                    if (this.nativeLanguage === undefined) {
                        this.nativeLanguage = 'en';
                    }
                    if (this.languages === undefined) {
                        this.languages = ['en', 'fr'];
                    }
                    // user-management will be handled by UAA app, oauth expects users to be managed in IpP
                    if ((this.applicationType === 'gateway' && this.authenticationType === 'uaa') || this.authenticationType === 'oauth2') {
                        this.skipUserManagement = true;
                    }

                    this.log(
                        chalk.green(
                            'This is an existing project, using the configuration from your .yo-rc.json file \n' +
                                'to re-generate the project...\n'
                        )
                    );

                    this.existingProject = true;
                }
            }
        };
    }

    get initializing() {
        if (useBlueprint) return;
        return this._initializing();
    }

    // Public API method used by the getter and also by Blueprints
    _prompting() {
        return {
            askForModuleName: prompts.askForModuleName,
            askForServerSideOpts: prompts.askForServerSideOpts,
            askForOptionalItems: prompts.askForOptionalItems,
            askFori18n: prompts.askFori18n,

            setSharedConfigOptions() {
                this.configOptions.packageName = this.packageName;
                this.configOptions.cacheProvider = this.cacheProvider;
                this.configOptions.enableHibernateCache = this.enableHibernateCache;
                this.configOptions.websocket = this.websocket;
                this.configOptions.databaseType = this.databaseType;
                this.configOptions.devDatabaseType = this.devDatabaseType;
                this.configOptions.prodDatabaseType = this.prodDatabaseType;
                this.configOptions.searchEngine = this.searchEngine;
                this.configOptions.messageBroker = this.messageBroker;
                this.configOptions.serviceDiscoveryType = this.serviceDiscoveryType;
                this.configOptions.buildTool = this.buildTool;
                this.configOptions.enableSwaggerCodegen = this.enableSwaggerCodegen;
                this.configOptions.authenticationType = this.authenticationType;
                this.configOptions.uaaBaseName = this.uaaBaseName;
                this.configOptions.serverPort = this.serverPort;

                // Make dist dir available in templates
                if (this.buildTool === 'maven') {
                    this.BUILD_DIR = 'target/';
                } else {
                    this.BUILD_DIR = 'build/';
                }
                this.CLIENT_DIST_DIR = this.BUILD_DIR + constants.CLIENT_DIST_DIR;
                // Make documentation URL available in templates
                this.DOCUMENTATION_URL = constants.JHIPSTER_DOCUMENTATION_URL;
                this.DOCUMENTATION_ARCHIVE_URL = `${constants.JHIPSTER_DOCUMENTATION_URL + constants.JHIPSTER_DOCUMENTATION_ARCHIVE_PATH}v${
                    this.jhipsterVersion
                }`;
            }
        };
    }

    get prompting() {
        if (useBlueprint) return;
        return this._prompting();
    }

    // Public API method used by the getter and also by Blueprints
    _configuring() {
        return {
            insight() {
                statistics.sendSubGenEvent('generator', 'server', {
                    app: {
                        authenticationType: this.authenticationType,
                        cacheProvider: this.cacheProvider,
                        enableHibernateCache: this.enableHibernateCache,
                        websocket: this.websocket,
                        databaseType: this.databaseType,
                        devDatabaseType: this.devDatabaseType,
                        prodDatabaseType: this.prodDatabaseType,
                        searchEngine: this.searchEngine,
                        messageBroker: this.messageBroker,
                        serviceDiscoveryType: this.serviceDiscoveryType,
                        buildTool: this.buildTool,
                        enableSwaggerCodegen: this.enableSwaggerCodegen
                    }
                });
            },

            configureGlobal() {
                // Application name modified, using each technology's conventions
                this.angularAppName = this.getAngularAppName();
                this.camelizedBaseName = _.camelCase(this.baseName);
                this.dasherizedBaseName = _.kebabCase(this.baseName);
                this.lowercaseBaseName = this.baseName.toLowerCase();
                this.humanizedBaseName = _.startCase(this.baseName);
                this.mainClass = this.getMainClassName();
                this.cacheManagerIsAvailable = ['ehcache', 'hazelcast', 'infinispan', 'memcached'].includes(this.cacheProvider);
                this.pkType = this.getPkType(this.databaseType);

                this.packageFolder = this.packageName.replace(/\./g, '/');
                if (!this.nativeLanguage) {
                    // set to english when translation is set to false
                    this.nativeLanguage = 'en';
                }
            },

            saveConfig() {
                const config = {
                    jhipsterVersion: packagejs.version,
                    applicationType: this.applicationType,
                    baseName: this.baseName,
                    packageName: this.packageName,
                    packageFolder: this.packageFolder,
                    serverPort: this.serverPort,
                    authenticationType: this.authenticationType,
                    uaaBaseName: this.uaaBaseName,
                    cacheProvider: this.cacheProvider,
                    enableHibernateCache: this.enableHibernateCache,
                    websocket: this.websocket,
                    databaseType: this.databaseType,
                    devDatabaseType: this.devDatabaseType,
                    prodDatabaseType: this.prodDatabaseType,
                    searchEngine: this.searchEngine,
                    messageBroker: this.messageBroker,
                    serviceDiscoveryType: this.serviceDiscoveryType,
                    buildTool: this.buildTool,
                    enableSwaggerCodegen: this.enableSwaggerCodegen,
                    jwtSecretKey: this.jwtSecretKey,
                    rememberMeKey: this.rememberMeKey,
                    enableTranslation: this.enableTranslation
                };
                if (this.enableTranslation && !this.configOptions.skipI18nQuestion) {
                    config.nativeLanguage = this.nativeLanguage;
                    config.languages = this.languages;
                }
                this.config.set(config);
            }
        };
    }

    get configuring() {
        if (useBlueprint) return;
        return this._configuring();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            getSharedConfigOptions() {
                this.useSass = this.configOptions.useSass ? this.configOptions.useSass : false;
                if (this.configOptions.enableTranslation !== undefined) {
                    this.enableTranslation = this.configOptions.enableTranslation;
                }
                if (this.configOptions.nativeLanguage !== undefined) {
                    this.nativeLanguage = this.configOptions.nativeLanguage;
                }
                if (this.configOptions.languages !== undefined) {
                    this.languages = this.configOptions.languages;
                }
                if (this.configOptions.testFrameworks) {
                    this.testFrameworks = this.configOptions.testFrameworks;
                }
                if (this.configOptions.clientFramework) {
                    this.clientFramework = this.configOptions.clientFramework;
                }
                this.protractorTests = this.testFrameworks.includes('protractor');
                this.gatlingTests = this.testFrameworks.includes('gatling');
                this.cucumberTests = this.testFrameworks.includes('cucumber');
            },

            composeLanguages() {
                if (this.configOptions.skipI18nQuestion) return;

                this.composeLanguagesSub(this, this.configOptions, 'server');
            }
        };
    }

    get default() {
        if (useBlueprint) return;
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return writeFiles();
    }

    get writing() {
        if (useBlueprint) return;
        return this._writing();
    }

    _install() {
        if (this.skipClient) {
            if (!this.options['skip-install']) {
                if (this.clientPackageManager === 'yarn') {
                    this.log(chalk.bold(`\nInstalling generator-jhipster@${this.jhipsterVersion} locally using yarn`));
                    this.yarnInstall();
                } else if (this.clientPackageManager === 'npm') {
                    this.log(chalk.bold(`\nInstalling generator-jhipster@${this.jhipsterVersion} locally using npm`));
                    this.npmInstall();
                }
            }
        }
    }

    get install() {
        if (useBlueprint) return;
        return this._install();
    }

    // Public API method used by the getter and also by Blueprints
    _end() {
        return {
            end() {
                if (this.prodDatabaseType === 'oracle') {
                    this.log('\n\n');
                    this.warning(
                        `${chalk.yellow.bold(
                            'You have selected Oracle database.\n'
                        )}Please follow our documentation on using Oracle to set up the \nOracle proprietary JDBC driver.`
                    );
                }
                this.log(chalk.green.bold('\nServer application generated successfully.\n'));

                let executable = 'mvnw';
                if (this.buildTool === 'gradle') {
                    executable = 'gradlew';
                }
                let logMsgComment = '';
                if (os.platform() === 'win32') {
                    logMsgComment = ` (${chalk.yellow.bold(executable)} if using Windows Command Prompt)`;
                }
                this.log(chalk.green(`Run your Spring Boot application:\n${chalk.yellow.bold(`./${executable}`)}${logMsgComment}`));
            }
        };
    }

    get end() {
        if (useBlueprint) return;
        return this._end();
    }
};
