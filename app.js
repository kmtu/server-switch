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

router.get(
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

router.get(
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
