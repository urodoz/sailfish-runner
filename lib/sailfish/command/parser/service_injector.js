
var serviceInjector = function(container) {

    this.configure = function(serviceName) {
        switch (serviceName) {
            case "redis":
                return this._attachRedis();
            case "memcached":
                return this._attachMemcached();
            case "postgres":
                return this._attachPostgres();
            default:
                throw Error("Service ["+serviceName+"] not supported");
        }
    };

    this._attachMemcached = function() {
        return {
            "memcached": {
                "image": container.getParameter("service_repository").memcached
            }
        };
    };

    this._attachRedis = function() {
        return {
            "redis": {
                "image": container.getParameter("service_repository").redis
            }
        };
    };

    this._attachPostgres = function() {
        return {
            "postgres": {
                "image": container.getParameter("service_repository").postgres,
                "environment": [
                    "POSTGRES_PASSWORD=postgres",
                    "POSTGRES_USER=postgres"
                ]
            }
        };
    };

};

module.exports = function(container) {
    return new serviceInjector(container);
};