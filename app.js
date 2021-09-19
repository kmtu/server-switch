require('dotenv').config()

const express = require('express')
const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const app = express()
const port = process.env.DST_API_PORT || 3000
const apiKey = process.env.GAMES_API_KEY;

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
    '/test',
    passport.authenticate('bearer', { session: false }),
    async (req, res) => {
        const {stdout, stderr} = await exec('ls');
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
        res.json({
            stdout,
            stderr
        });
    }
);


app.use('/api/v1', router);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
