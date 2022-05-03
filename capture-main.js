/**
 * Created by xujian1 on 2018/10/5.
 */

const { globalShortcut } = require('electron');

const useCapture = () => {
    globalShortcut.register('Esc', () => {
        console.log('ESC 退出截屏');
    });

    const screenShot = () => {
        const { spawn } = require('child_process');
        new Promise((resolve, reject) => {
            let instance = spawn(`screencapture`, ['-x', '-i']);
            instance.on(`error`, (err) => reject(err.toString()));
            instance.stderr.on(`data`, (err) => reject(err.toString()));
            instance.on(`close`, (code) => {
                code === 0 ? resolve(true) : reject(false);
            });
        });
    };
    globalShortcut.register('shift+P', screenShot);
};

exports.useCapture = useCapture;
