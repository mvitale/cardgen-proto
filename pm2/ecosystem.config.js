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
        watch: true
      },
      env_production : {
        NODE_ENV: 'production'
      },
      error_file      : "logs/err.log",
      out_file        : "logs/out.log"
    }
  ]
};
