const CONFIG = {
  //开发环境配�?
  development: {
    assetsPath: "/static/images/", // 静态资源路�?
    baseUrl: "http://localhost:3456",
  },

  //生产环境配置
  production: {
    assetsPath: "/static/images/", // 静态资源路�?
    baseUrl: "",
  },
};

export default CONFIG[process.env.NODE_ENV];
