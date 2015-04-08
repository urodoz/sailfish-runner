var ring = require("ring");

var serviceInjectorClass = ring.create({

    constructor: function(container) {
        this.container = container;
    },

    configure: function(serviceName) {
        switch (serviceName) {
            case "redis":
                return this._attachRedis();
                break;
            case "memcached":
                return this._attachMemcached();
                break;
            case "postgres":
                return this._attachPostgres();
                break;
            default:
                throw Error("Service ["+serviceName+"] not supported")
                break;
        }
    },

    _attachMemcached: function() {
        var memcachedImage = this.container.getParameter("service_repository")["memcached"];
        return {
            "memcached": {
                "image": memcachedImage
            }
        }
    },

    _attachRedis: function() {
        var redisImage = this.container.getParameter("service_repository")["redis"];
        return {
            "redis": {
                "image": redisImage
            }
        }
    },

    _attachPostgres: function() {
        var postgresImage = this.container.getParameter("service_repository")["postgres"];
        return {
            "postgres": {
                "image": postgresImage,
                "environment": [
                    "POSTGRES_PASSWORD=postgres",
                    "POSTGRES_USER=postgres"
                ]
            }
        }
    }

});

module.exports = serviceInjectorClass;