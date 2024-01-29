<template>
  <div id="app">
    <div id="nav">
      <b>AI 标注工具</b>
      <ul>
        <li><a href="#/">数据集</a></li>
        <!-- <li><a href="#/label">标注</a></li> -->
        <li><a href="#/about">关于</a></li>
      </ul>
    </div>
    <div style="padding: 10px">
      <router-view />
    </div>
  </div>
</template>
<script>
</script>
<style>
@import "assets/css/initCss.css";
@import "font/iconfont.css";

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 0;
  margin: 0;
}

#nav {
  padding: 10px 20px;
  background: #0052a5;
  color: #fff;
  font-size: 16px;
  height: 20px;
}

#nav b {
  cursor: pointer;
  display: block;
  float:left;
  width: 100px;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

#nav ul,#nav li{
  display: block;
}
#nav li{
  display: inline-block;
  padding: 0 10px;
}

#nav li a{
   display: block;
   color: #fff;
}
.demo-drawer__footer {
    display: flex;
}
.demo-drawer__footer button {
    flex: 1;
}
.demo-drawer__content {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.demo-drawer__content form {
    flex: 1;
}
.el-drawer__body {
    padding: 20px;
}
</style>
