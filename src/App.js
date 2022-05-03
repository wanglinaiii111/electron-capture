import styles from './App.module.css';

function App() {
    const linkTo = function () {
        const href = 'http://www.baidu.com';
        //从窗口打开浏览页面的方式
        window.shell.openExternal(href);
    };

    const capture = (type) => {
        return () => {
            console.log(type);
            window.ipcRenderer.send('capture-screen', { type });
        };
    };
    return (
        <div className="App">
            <div onClick={linkTo}> 跳转到百度 </div>
            <div className={styles.btn} onClick={capture('img')}>
                使用缩略图的方式截图
            </div>
            <div className={styles.btn} onClick={capture('origin')}>
                使用原生的方式截图
            </div>
            <div className={styles.btn} onClick={capture('video')}>
                使用video的方式截图
            </div>
        </div>
    );
}

export default App;
