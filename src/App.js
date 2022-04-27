import "./App.css";

function App() {
  const linkTo = function () {
    const href = "http://www.baidu.com";
    //从窗口打开浏览页面的方式
    window.shell.openExternal(href);
  };

  const regist = ()=>{
    window.ipcRenderer.send('capture-screen')
  }
  return (
    <div className="App">
      <div onClick={linkTo}> 跳转到百度 </div>
      <div onClick={regist}> 截屏 </div>
    </div>
  );
}

export default App;
