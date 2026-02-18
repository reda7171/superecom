module.exports = {
    apps: [{
        name: 'riwaya',
        script: 'node_modules/next/dist/bin/next',
        args: 'start',
        cwd: '/var/www/riwaya',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        error_file: '/var/log/pm2/riwaya-error.log',
        out_file: '/var/log/pm2/riwaya-out.log',
        time: true,
        max_memory_restart: '1G',
        min_uptime: '10s',
        max_restarts: 10,
        autorestart: true,
        watch: false
    }]
}
