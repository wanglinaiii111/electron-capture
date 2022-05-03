const { getCurrentScreen, getTargetDisplayIndex } = require('./utils');
const curScreen = getCurrentScreen();
const { ipcRenderer } = require('electron');

function getScreen(callback) {
    this.callback = callback;

    document.body.style.opacity = '0';
    let oldCursor = document.body.style.cursor;
    document.body.style.cursor = 'none';

    //缩略图的处理方式
    this.handleStream = (img_url) => {
        document.body.style.cursor = oldCursor;
        document.body.style.opacity = '1';

        if (this.callback) {
            // Save screenshot to png - base64
            this.callback(img_url);
        } else {
            // console.log('Need callback!')
        }
    };

    //video的处理方式
    this.handleStreamVideo = (stream) => {
        document.body.style.cursor = oldCursor;
        document.body.style.opacity = '1';
        // Create hidden video tag
        let video = document.createElement('video');
        video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';
        // Event connected to stream

        let loaded = false;
        video.onloadedmetadata = () => {
            if (loaded) {
                return;
            }
            loaded = true;

            video.play();
            video.pause();

            // Set video ORIGINAL height (screenshot)
            video.style.height = video.videoHeight + 'px'; // videoHeight
            video.style.width = video.videoWidth + 'px'; // videoWidth

            // Create canvas
            let canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            let ctx = canvas.getContext('2d');
            // Draw video on canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            if (this.callback) {
                // Save screenshot to png - base64
                this.callback(canvas.toDataURL('image/png'));
            } else {
                // console.log('Need callback!')
            }

            // Remove hidden video tag
            video.remove();
            try {
                stream.getTracks()[0].stop();
            } catch (e) {
                // nothing
            }
        };
        video.srcObject = stream;
        document.body.appendChild(video);
    };

    this.handleError = (e) => {
        console.log(e);
    };

    if (require('os').platform() === 'win32') {
        const { desktopCapturer } = require('@electron/remote');
        desktopCapturer
            .getSources({
                types: ['screen'],
                thumbnailSize: {
                    width: 0,
                    height: 0,
                },
            })
            .then((sources) => {
                console.log(sources);
                console.log(curScreen);

                let targetDisplayIndex = getTargetDisplayIndex();
                let screenName = targetDisplayIndex + 1;
                let selectSource = sources.find((source) => {
                    if (source.display_id) {
                        return source.display_id + '' === curScreen.id + '';
                    } else {
                        return source.name === 'Screen ' + screenName || source.name === 'Entire screen';
                    }
                });

                console.log(selectSource);
                navigator.getUserMedia(
                    {
                        audio: false,
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: selectSource.id + '',
                                minWidth: 1280,
                                minHeight: 720,
                                maxWidth: 8000,
                                maxHeight: 8000,
                            },
                        },
                    },
                    (e) => {
                        this.handleStream(e);
                    },
                    this.handleError
                );
            })
            .catch((e) => {
                console.log(e, 'EEEEEEEEEEE');
            });
    } else {
        console.log('type122321');
        ipcRenderer.on('capture-screen', (e, { type } = {}) => {
            console.log(type, 'type122321');
            if (type === 'img') {
                //缩略图
                const { desktopCapturer } = require('@electron/remote');
                desktopCapturer
                    .getSources({
                        types: ['window', 'screen'],
                        thumbnailSize: {
                            width: curScreen.bounds.width * curScreen.scaleFactor,
                            height: curScreen.bounds.height * curScreen.scaleFactor,
                        },
                    })
                    .then(async (sources) => {
                        console.log(curScreen.bounds.width, curScreen.scaleFactor);
                        console.table(sources);

                        let targetDisplayIndex = getTargetDisplayIndex();
                        let screenName = targetDisplayIndex + 1;

                        let selectSource = sources.find((source) => {
                            if (source.display_id) {
                                return source.display_id + '' === curScreen.id + '';
                            } else {
                                return source.name === 'Screen ' + screenName || source.name === 'Entire screen';
                            }
                        });
                        // js_img.src = selectSource.thumbnail.toDataURL('image/png');

                        this.handleStream(selectSource.thumbnail.toDataURL('image/png'));
                    });
            } else {
                //video
                console.log(curScreen.id, 'id');
                navigator.mediaDevices
                    .getUserMedia({
                        // video: { width: 1280, height: 720 },
                        audio: false,
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: `screen:${curScreen.id}:0`,
                                minWidth: 1280,
                                minHeight: 720,
                                maxWidth: 8000,
                                maxHeight: 8000,
                            },
                        },
                    })
                    .then((e) => {
                        this.handleStreamVideo(e);
                    }, this.handleError);
            }
        });
    }
}

exports.getScreenSources = ({ types = ['screen'] } = {}, callback) => {
    getScreen(callback);
};
