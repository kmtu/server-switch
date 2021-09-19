require('dotenv').config()

const express = require('express')
const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const {setToken, getLinodes} = require('@linode/api-v4');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const app = express()
const port = process.env.DST_API_PORT || 3000
const linodeApiKey = process.env.LINODE_API_KEY;
const dstApiKey = process.env.DST_API_KEY;

setToken(linodeApiKey);

mock_linode_list = {
    "data": [
        {
            "alerts": {
                "cpu": 180,
                "io": 10000,
                "network_in": 10,
                "network_out": 10,
                "transfer_quota": 80
            },
            "backups": {
                "enabled": true,
                "last_successful": "2018-01-01T00:01:01",
                "schedule": {
                    "day": "Saturday",
                    "window": "W22"
                }
            },
            "created": "2018-01-01T00:01:01",
            "group": "Linode-Group",
            "hypervisor": "kvm",
            "id": 123,
            "image": "linode/debian10",
            "ipv4": [
                "203.0.113.1",
                "192.0.2.1"
            ],
            "ipv6": "c001:d00d::1337/128",
            "label": "linode123",
            "region": "us-east",
            "specs": {
                "disk": 81920,
                "memory": 4096,
                "transfer": 4000,
                "vcpus": 2
            },
            "status": "running",
            "tags": [
                "example tag",
                "another example"
            ],
            "type": "g6-standard-1",
            "updated": "2018-01-01T00:01:01",
            "watchdog_enabled": true
        }
    ],
    "page": 1,
    "pages": 1,
    "results": 1
}

passport.use(new BearerStrategy(
    function(token, done) {
        if (token !== dstApiKey) {
            return done(null, false, {message: 'Incorrect token'});
        }
        return done(null, true);
    }
));

const router = express.Router();
router.get(
    '/list',
    passport.authenticate('bearer', { session: false }),
    async (req, res) => {
        const ret = await getLinodes();
        res.json(ret);
        //res.json(mock_linode_list);
    }
);

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


app.use('/dst/api/v1', router);


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
