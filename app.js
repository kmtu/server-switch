require('dotenv').config()

const express = require('express')
const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const util = require('util');
const cp = require('child_process');
const exec = util.promisify(require('child_process').exec);

const app = express()
const port = process.env.APP_API_PORT || 3000
const apiKey = process.env.APP_API_KEY;

passport.use(new BearerStrategy(
    function(token, done) {
        if (token !== apiKey) {
            return done(null, false, {message: 'Incorrect token'});
        }
        return done(null, true);
    }
));

const router = express.Router();

const availableServices = ['minecraft', 'valheim']

router.get(
    '/status/:service',
    passport.authenticate('bearer', { session: false }),
    async (req, res) => {
        service = req.params.service
        if (availableServices.includes(service)) {
            const {stdout, stderr} = await exec(
                `docker ps | grep ${service} | wc -l`);
            console.log(`querying ${service} status`);
            console.log('stdout:', stdout);
            console.log('stderr:', stderr);
            res.send(stdout);
        }
        else {
            console.log(`unknown service: ${service}`);
            res.status(404).send(`unknown service: ${service}`);
        }
    }
);

router.post(
    '/start/:service',
    passport.authenticate('bearer', { session: false }),
    async (req, res) => {
        service = req.params.service
        if (service === 'minecraft') {
            console.log(`starting ${service}`);
            res.send(`starting ${service}`);
            const {stdout, stderr} = await exec(
                'docker-compose -f /home/kmtu/minecraft/docker-compose.yml up -d');
            console.log('stdout:', stdout);
            console.log('stderr:', stderr);
        }
        else {
            console.log(`unknown service: ${service}`);
            res.status(404).send(`unknown service: ${service}`);
        }
    }
);

router.post(
    '/stop/:service',
    passport.authenticate('bearer', { session: false }),
    async (req, res) => {
        service = req.params.service
        if (service === 'minecraft') {
            console.log(`stopping ${service}`);
            res.send(`stopping ${service}`);
            const {stdout, stderr} = await exec(
                'docker-compose -f /home/kmtu/minecraft/docker-compose.yml stop');
            console.log('stdout:', stdout);
            console.log('stderr:', stderr);
        }
        else {
            console.log(`unknown service: ${service}`);
            res.status(404).send(`unknown service: ${service}`);
        }
    }
);

app.use('/api/v1', router);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
