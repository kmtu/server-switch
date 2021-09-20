require('dotenv').config()

const express = require('express')
const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const util = require('util');
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
    '/up/:server',
    passport.authenticate('bearer', { session: false }),
    async (req, res) => {
        server = req.params.server
        if (server === 'minecraft') {
            console.log(`up ${server}`);
            const {stdout, stderr} = await exec(
                'docker-compose -f /home/kmtu/minecraft/docker-compose.yml up -d');
            console.log('stdout:', stdout);
            console.log('stderr:', stderr);
            res.send(`up ${server}`);
        }
        else {
            console.log(`unknown server: ${server}`);
            res.status(404).send(`unknown server: ${server}`);
        }
    }
);

router.get(
    '/stop/:server',
    passport.authenticate('bearer', { session: false }),
    async (req, res) => {
        server = req.params.server
        if (server === 'minecraft') {
            console.log(`stop ${server}`);
            const {stdout, stderr} = await exec(
                'docker-compose -f /home/kmtu/minecraft/docker-compose.yml stop');
            console.log('stdout:', stdout);
            console.log('stderr:', stderr);
            res.send(`stop ${server}`);
        }
        else {
            console.log(`unknown server: ${server}`);
            res.status(404).send(`unknown server: ${server}`);
        }
    }
);

app.use('/api/v1', router);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
