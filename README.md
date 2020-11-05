# CircleSpace ePortfolio Back-end

This repository hosts the back-end API for the CircleSpace ePortfolio Management System. 

## Installation 

* clone this repository
* run `npm i` to install the required dependencies

## Usage
---

### Local Deployment

Use `npm start` to start the server. Locally, the server is run from `localhost:3000`.

To view the Swagger UI for the API, navigate to `localhost:3000` or `localhost:3000/docs/`. 
You can then manually create requests to the server from this UI.

Make sure to wait for the connection message to MongoDB (`"MongoDB connection established..."`) to appear before creating requests.

### Web Deployment

Two Heroku servers are configured to run the server:
* api-circlespace.herokuapp.com hosts the deployment of the `master` branch, and is the production deployment
* dev-circlespace.herokuapp.com hosts the deployement of the `dev` branch. It's used to host the current development environment without making changes to the production API.

## Documentation
---
Full documentation can be found via the README in the `docs/` folder.

## Testing 
---

The repository runs tests with the `Mocha` and `Chai` libraries. 

### Local Testing
Tests can be run from a local deployment using `npm test`. To run only specific tests, commands in the following styles can be used:

* run all tests related to 'bio's
    * `npm test -- -g "bio"`
* run all tests related to the 'bio/update' route:
    * `npm test -- -g "bio/update"`

The `-g` switch indicates a regex match. To invert the match, follow the pattern with `--invert`. For more information, visit the [Mocha documentation](https://mochajs.org/#usage).

### CI / CD Testing
CI / CD has been configured using GitHub Actions. On each pull request, the full test suite is run on the repository. The tests can also be run manually through the GitHub site.