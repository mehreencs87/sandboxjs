var Jwt = require('jsonwebtoken');

var assign = require('lodash.assign');
var defaultsDeep = require('lodash.defaultsdeep');

/**
 * Creates an object representing a Webtask
 *
 * @constructor
 */
function CronJob (sandbox, job) {
    /**
     * @property name - The name of the cron job
     * @property schedule - The cron schedule of the job
     * @property next_scheduled_at - The next time this job is scheduled
     */
    assign(this, job);
    
    /**
     * @property claims - The claims embedded in the Webtask's token
     */
    this.claims = Jwt.decode(job.token);
    
    /**
     * @property sandbox - The {@see Sandbox} instance used to create this Webtask instance
     */
    this.sandbox = sandbox;
    
    /**
     * @property cluster_url - The url of the webtask cluster on which this job will run
     */
    this.cluster_url = 'https://' + this.cluster_url;

    /**
     * @property url - The public url that can be used to invoke webtask that the cron job runs
     */
    Object.defineProperty(this, 'url', {
        enumerable: true,
        get: function () {
            return this.sandbox.url + '/api/run/' + this.container + '/' + this.name;
        }
    });
}

/**
 * Remove this cron job from the webtask cluster
 * 
 * Note that this will not revoke the underlying webtask token, so the underlying webtask will remain functional.
 * 
 * @param {Function} [cb] - Optional callback function for node-style callbacks
 * @returns {Promise} A Promise that will be fulfilled with the token
 */
CronJob.prototype.remove = function (cb) {
    var promise = this.sandbox.removeCronJob({
        container: this.container,
        name: this.name,
    });

    return cb ? promise.nodeify(cb, {spread: true}) : promise;
};

/**
 * Get the history of this cron job
 * 
 * @param {Object} options - Options for retrieving the cron job.
 * @param {String} [options.offset] - The offset to use when paging through results.
 * @param {String} [options.limit] - The limit to use when paging through results.
 * @param {Function} [cb] - Optional callback function for node-style callbacks.
 * @returns {Promise} A Promise that will be fulfilled with an Array of cron job results.
 */
CronJob.prototype.getHistory = function (options, cb) {
    if (typeof options === 'function') {
        cb = options;
        options = {};
    }

    if (!options) options = {};
    
    options = defaultsDeep(options, {
        container: this.container,
        name: this.name,
        offset: 0,
        limit: 10,
    });
    
    var promise = this.sandbox.getCronJobHistory(options);

    return cb ? promise.nodeify(cb, {spread: true}) : promise;
};

module.exports = CronJob;