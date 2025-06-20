const { app, BrowserWindow, ipcMain, Menu, session } = require('electron');
const path = require('path');
const Store = require('electron-store');
const log = require('electron-log');

// Configure logging
log.transports.file.level = 'info';
log.info('Jellyfin Client starting...');

// Enhanced codec support and hardware acceleration
app.commandLine.appendSwitch('enable-features',
  'VaapiVideoDecoder,VaapiVideoEncoder,CanvasOopRasterization,WebRTCPipeWireCapturer'
);
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('enable-accelerated-mjpeg-decode');
app.commandLine.appendSwitch('disable-features', 'UseChromeOSDirectVideoDecoder');
app.commandLine.appendSwitch('force-color-profile', 'srgb');

// Enhanced codec support
app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const store = new Store();
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Allow cross-origin for media files
      allowRunningInsecureContent: true,
      experimentalFeatures: true,
      plugins: true,
      webgl: true
    },
    backgroundColor: '#101010',
    autoHideMenuBar: true,
    show: false,

    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'zello',

    minWidth: 800,
    minHeight: 600,
    center: true
  });

  // Enhanced CSP for media playback
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
          "media-src * blob: data:; " +
          "connect-src * ws: wss:;"
        ]
      }
    });
  });

  // Load login page or saved server
  const serverUrl = store.get('serverUrl');
  if (serverUrl) {
    loadJellyfinServer(serverUrl);
  } else {
    mainWindow.loadFile('login.html');
  }

  // Simple menu for server switching
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Change Server',
      click: () => {
        store.delete('serverUrl');
        mainWindow.loadFile('login.html');
      }
    },
    { type: 'separator' },
    { role: 'reload' },
    { role: 'toggleDevTools' }
  ]);

  mainWindow.webContents.on('context-menu', () => {
    contextMenu.popup();
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  // Set app icon in taskbar/dock
  if (process.platform === 'win32') {
    mainWindow.setIcon(path.join(__dirname, 'assets', 'icon.ico'));
  } else if (process.platform === 'darwin') {
    app.dock?.setIcon(path.join(__dirname, 'assets', 'icon.icns'));
  }
}

function loadJellyfinServer(url) {
  mainWindow.loadURL(url);

  mainWindow.webContents.once('did-finish-load', () => {
    // Inject comprehensive codec support
    injectCodecSupport();
  });
}

function injectCodecSupport() {
  const codecScript = `
    (function() {
      // Enhanced device profile for maximum codec support with detailed HEVC support
      function createEnhancedDeviceProfile() {
        return {
          "MaxStreamingBitrate": 120000000,
          "MaxStaticBitrate": 100000000,
          "MusicStreamingTranscodingBitrate": 384000,
          "DirectPlayProfiles": [
            // Enhanced Video profiles with explicit HEVC support
            {
              "Container": "mp4,m4v,mkv,webm,avi,mov,wmv,ts,mpg,mpeg,m2ts,asf,flv,3gp,mts,m2v,rec",
              "Type": "Video",
              "VideoCodec": "h264,hevc,h265,vp8,vp9,av1,mpeg4,mpeg2video,vc1,wmv,divx,xvid",
              "AudioCodec": "aac,mp3,ac3,eac3,dts,dtshd,truehd,flac,pcm,opus,vorbis,wma,wmapro,wmav2"
            },
            // Dedicated HEVC profile for maximum compatibility
            {
              "Container": "mp4,mkv,mov,ts,m2ts",
              "Type": "Video", 
              "VideoCodec": "hevc,h265",
              "AudioCodec": "aac,ac3,eac3,dts,dtshd,truehd,flac,opus"
            },
            // Audio profiles
            {
              "Container": "mp3,flac,ogg,oga,webma,wav,wma,aac,m4a,m4b,ape,opus,wv",
              "Type": "Audio",
              "AudioCodec": "mp3,flac,vorbis,opus,aac,wma,wav,pcm,dts,ac3,eac3,ape,wavpack"
            }
          ],
          "TranscodingProfiles": [
            {
              "Container": "ts",
              "Type": "Video",
              "VideoCodec": "h264",
              "AudioCodec": "aac",
              "Context": "Streaming",
              "Protocol": "hls",
              "MaxAudioChannels": "6",
              "MinSegments": 2,
              "BreakOnNonKeyFrames": false
            },
            {
              "Container": "webm",
              "Type": "Video", 
              "VideoCodec": "vp8",
              "AudioCodec": "vorbis",
              "Context": "Streaming",
              "Protocol": "http",
              "MaxAudioChannels": "2"
            },
            {
              "Container": "mp4",
              "Type": "Video",
              "VideoCodec": "h264",
              "AudioCodec": "aac",
              "Context": "Static"
            }
          ],
          "ContainerProfiles": [
            // Enhanced container profiles for HEVC
            {
              "Type": "Video",
              "Container": "mp4,mkv",
              "Conditions": [
                {
                  "Condition": "LessThanEqual",
                  "Property": "Width",
                  "Value": "4096"
                },
                {
                  "Condition": "LessThanEqual",
                  "Property": "Height", 
                  "Value": "2160"
                }
              ]
            }
          ],
          "CodecProfiles": [
            // Enhanced HEVC SDR 10-bit Main Profile Support
            {
              "Type": "Video",
              "Codec": "hevc,h265",
              "Conditions": [
                {
                  "Condition": "LessThanEqual",
                  "Property": "VideoBitDepth",
                  "Value": "10"
                },
                {
                  "Condition": "LessThanEqual",
                  "Property": "Height",
                  "Value": "2160"
                },
                {
                  "Condition": "LessThanEqual",
                  "Property": "Width", 
                  "Value": "4096"
                },
                {
                  "Condition": "LessThanEqual",
                  "Property": "VideoLevel",
                  "Value": "153"
                },
                {
                  "Condition": "EqualsAny",
                  "Property": "VideoProfile",
                  "Value": "main,main 10"
                },
                {
                  "Condition": "LessThanEqual",
                  "Property": "VideoBitrate",
                  "Value": "120000000"
                }
              ]
            },
            // HEVC Main Profile (8-bit) for lower bitdepth content
            {
              "Type": "Video", 
              "Codec": "hevc,h265",
              "Conditions": [
                {
                  "Condition": "LessThanEqual",
                  "Property": "VideoBitDepth",
                  "Value": "8"
                },
                {
                  "Condition": "LessThanEqual",
                  "Property": "Height",
                  "Value": "2160"
                },
                {
                  "Condition": "LessThanEqual",
                  "Property": "Width",
                  "Value": "4096"
                },
                {
                  "Condition": "EqualsAny",
                  "Property": "VideoProfile", 
                  "Value": "main"
                }
              ]
            },
            // Multiple resolution support for HEVC
            {
              "Type": "Video",
              "Codec": "hevc,h265", 
              "Conditions": [
                {
                  "Condition": "LessThanEqual",
                  "Property": "Height",
                  "Value": "720"
                },
                {
                  "Condition": "LessThanEqual",
                  "Property": "VideoBitDepth",
                  "Value": "10"
                }
              ]
            },
            {
              "Type": "Video",
              "Codec": "hevc,h265",
              "Conditions": [
                {
                  "Condition": "LessThanEqual", 
                  "Property": "Height",
                  "Value": "1080"
                },
                {
                  "Condition": "LessThanEqual",
                  "Property": "VideoBitDepth",
                  "Value": "10"
                }
              ]
            },
            {
              "Type": "Video",
              "Codec": "hevc,h265",
              "Conditions": [
                {
                  "Condition": "LessThanEqual",
                  "Property": "Height", 
                  "Value": "1440"
                },
                {
                  "Condition": "LessThanEqual",
                  "Property": "VideoBitDepth",
                  "Value": "10"
                }
              ]
            },
            // Standard H.264 profile
            {
              "Type": "Video",
              "Codec": "h264",
              "Conditions": [
                {
                  "Condition": "LessThanEqual",
                  "Property": "VideoBitDepth",
                  "Value": "8"
                },
                {
                  "Condition": "LessThanEqual", 
                  "Property": "Height",
                  "Value": "2160"
                }
              ]
            },
            // Audio codec profiles
            {
              "Type": "VideoAudio",
              "Codec": "aac",
              "Conditions": [
                {
                  "Condition": "LessThanEqual",
                  "Property": "AudioChannels", 
                  "Value": "6"
                }
              ]
            },
            {
              "Type": "VideoAudio",
              "Codec": "ac3,eac3",
              "Conditions": [
                {
                  "Condition": "LessThanEqual",
                  "Property": "AudioChannels",
                  "Value": "6"
                }
              ]
            },
            {
              "Type": "VideoAudio",
              "Codec": "dts,dtshd",
              "Conditions": [
                {
                  "Condition": "LessThanEqual",
                  "Property": "AudioChannels",
                  "Value": "8"
                }
              ]
            }
          ],
          "ResponseProfiles": [
            {
              "Container": "m4v",
              "Type": "Video", 
              "MimeType": "video/mp4"
            },
            {
              "Container": "mov",
              "Type": "Video",
              "MimeType": "video/mp4"
            }
          ]
        };
      }

      // Wait for Jellyfin API to be available and set enhanced profile
      function waitForJellyfinAndSetProfile() {
        if (window.ApiClient && window.ApiClient.getDeviceProfile) {
          try {
            const enhancedProfile = createEnhancedDeviceProfile();
            window.ApiClient.deviceProfile = enhancedProfile;
            console.log('Enhanced HEVC codec support applied');
            console.log('HEVC Support: SDR, 10-bit, Main Profile, up to 4K');
            
            // Force direct play for HEVC content
            if (window.playbackManager) {
              const originalCanDirectPlay = window.playbackManager.canDirectPlay || function() { return true; };
              window.playbackManager.canDirectPlay = function(mediaSource) {
                // Always try direct play first, especially for HEVC
                if (mediaSource && mediaSource.Container) {
                  const container = mediaSource.Container.toLowerCase();
                  const videoCodec = mediaSource.MediaStreams && 
                    mediaSource.MediaStreams.find(s => s.Type === 'Video')?.Codec?.toLowerCase();
                  
                  // Prioritize HEVC direct play
                  if (videoCodec === 'hevc' || videoCodec === 'h265') {
                    console.log('HEVC content detected - forcing direct play');
                    return true;
                  }
                }
                return originalCanDirectPlay.call(this, mediaSource);
              };
            }
          } catch (error) {
            console.log('Could not apply enhanced HEVC profile yet, retrying...');
            setTimeout(waitForJellyfinAndSetProfile, 1000);
          }
        } else {
          setTimeout(waitForJellyfinAndSetProfile, 500);
        }
      }
      
      waitForJellyfinAndSetProfile();
    })();
  `;

  mainWindow.webContents.executeJavaScript(codecScript)
    .catch(err => log.error('Failed to inject HEVC codec support:', err));
}

// IPC handler for server connection
ipcMain.handle('connect-to-server', async (event, url) => {
  try {
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = 'http://' + url;
    }

    store.set('serverUrl', formattedUrl);
    loadJellyfinServer(formattedUrl);

    return { success: true };
  } catch (error) {
    log.error('Connection error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-window-title', async (event, serverName, userName) => {
  updateWindowTitle(serverName, userName);
  return { success: true };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});