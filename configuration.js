module.exports = {

    /*
     * APPLICATION CONFIGURATION
     */
    "VERSION": "0.0.1",
    "port": 13900,

    /*
     * PATH CONFIGURATION
     */
    "app_root": __dirname,
    "workspace_root": "/tmp/workspace",
    "database": __dirname+"/store.database",

    /*
     * PLUGIN CONFIGURATION
     */
    "plugins": {
        /*
         * Reporter plugins : This plugins are executed on each
         * status change for all builds
         */
        "reporter": [
            //Main repoter (to report Sailfish CI Server)
            "sailfish/plugin/server_reporter"
        ]
    },

    /*
     * WORKER CONFIGURATION
     */
    "isWorker": false,
    "workers": 3, //Max number of workers (parallel builds)

    /*
     * LOGGING CONFIGURATION
     */
    "loggers": [
        {
            name: 'sailfish-runner',
            stream: process.stdout,
            level: 'info'
        }
    ],

    /*
     * DOCKER IMAGES/CONFIGURATION
     */

    //CUSTOM IMAGES - BASE IMAGES
    "image_repository": {
        'python@2.7': "urodoz/sailfish-python:2.7",
        'node@0.10.37': "urodoz/sailfish-node:0.10.37",
        'node@0.12.1': "urodoz/sailfish-node:0.12.1"
    },

    //SERVICE IMAGES
    "service_repository": {
        "redis": "redis:2.8.19",
        "postgres": "postgres:9.4.1",
        "memcached": "memcached:1.4.22"
    }

}