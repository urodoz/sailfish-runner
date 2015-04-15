module.exports = {

    VERSION:  {
        presence: true,
        format: {
            pattern: "[0-9\.]+",
            flags: "i",
            message: "can only contain 0-9 and . characters"
        }
    },

    port: {
        presence: true,
        numericality: {
            onlyInteger: true,
            greaterThan: 0
        }
    },

    endpoint: {
        presence: true
    },

    app_root: {
        presence: true
    },
    workspace_root: {
        presence: true
    },
    database: {
        presence: true
    },

    isWorker: {
        presence: true
    },

    workers: {
        presence: true,
        numericality: {
            onlyInteger: true,
            greaterThan: 0
        }
    }

}