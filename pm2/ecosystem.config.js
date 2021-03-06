module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    // Card service
    {
      name      : 'card-svc',
      script    : 'app.js',
      ignore_watch: ['storage'],
      env: {
        NODE_ENV: 'development',
        watch: true,
      },
      env_production : {
        NODE_ENV: 'production',
        watch: false,
        exec_mode: 'cluster',
        instances: 1
      },
      error_file      : "logs/err.log",
      out_file        : "logs/out.log"
    },
    {
      name: 'card-worker',
      script: 'worker.js',
      env: {
        NODE_ENV: 'development',
        watch: false // TODO: why doesn't watch work? Better to leave it as 'false' than have it deceptively be 'true'
      }, 
      env_production: {
        NODE_ENV: 'production',
        watch: false,
        exec_mode: 'cluster',
        instances: 1
      },
      error_file: 'logs/worker-err.log',
      out_file: 'logs/worker-out.log'
    }
  ]
};

