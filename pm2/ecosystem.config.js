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
      env: {
        NODE_ENV: 'development',
        watch: false
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
        watch: false
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
