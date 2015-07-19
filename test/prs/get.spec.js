
var assert = require('assert');
var sinon = require('sinon');
var PassThrough = require('stream').PassThrough;
var StashClient = require('../../index.js').Client;

describe('Pull Requests', function() {
    var httpClientGet, httpClient, stashClient;

    beforeEach(function() {
        stashClient = new StashClient('http://localhost/', 'username', 'password');
        httpClient = stashClient.client;
        httpClientGet = sinon.stub(httpClient, 'get');
    });

    afterEach(function() {
        httpClient.get.restore();
    });

    it('should get list of pull requests for a project/repo', function(done) {
        // Mock the HTTP Client get.
        var expected = require('../mocks/prs.json');
        var response = new PassThrough();
        var request = new PassThrough();
        httpClientGet.callsArgWith(1, expected, response)
            .returns(request);

        // Test prs.get API.
        stashClient.prs.get('PRJ', 'my-repo').then(function(prs) {
            assert.equal(prs.size, 1);
            assert.deepEqual(prs.values[0], expected.values[0]);
            done();
        });
    });

    it('should get a combined list of pull requests for all repos', function(done) {
        // Mock the HTTP Client get.
        var expectedProjects = require('../mocks/projects.json');
        var expectedRepos = require('../mocks/repos.json');
        var expectedPrs = require('../mocks/prs.json');
        var response = new PassThrough();
        var request = new PassThrough();

        httpClientGet.onCall(0).callsArgWith(1, expectedProjects, response)
            .returns(request);
        httpClientGet.onCall(1).callsArgWith(1, expectedRepos, response)
            .returns(request);
        httpClientGet.onCall(2).callsArgWith(1, expectedPrs, response)
            .returns(request);

        // Test prs.get API.
        stashClient.prs.getCombined().then(function(prs) {
            assert.deepEqual(prs.values[0], expectedPrs.values[0]);
            done();
        });
    });

    it('should filter PRs by author', function(done) {
        // Mock the HTTP Client get.
        var expectedProjects = require('../mocks/projects.json');
        var expectedRepos = require('../mocks/repos.json');
        var expectedPrs = require('../mocks/prs.json');
        var response = new PassThrough();
        var request = new PassThrough();

        httpClientGet.onCall(0).callsArgWith(1, expectedProjects, response)
            .returns(request);
        httpClientGet.onCall(1).callsArgWith(1, expectedRepos, response)
            .returns(request);
        httpClientGet.onCall(2).callsArgWith(1, expectedPrs, response)
            .returns(request);

        // Test prs.get API.
        stashClient.prs.getCombined(null, null, { author: 'tom' }).then(function(prs) {
            assert.deepEqual(prs.values[0], expectedPrs.values[0]);
        }).then(function() {
            httpClientGet.onCall(3).callsArgWith(1, expectedProjects, response)
                .returns(request);
            httpClientGet.onCall(4).callsArgWith(1, expectedRepos, response)
                .returns(request);
            httpClientGet.onCall(5).callsArgWith(1, expectedPrs, response)
                .returns(request);
            // Test prs.get API.
            stashClient.prs.getCombined(null, null, { author: 'ben' }).then(function(prs) {
                assert.equal(prs.values.length, 0);
                done();
            });
        });
    });
});
