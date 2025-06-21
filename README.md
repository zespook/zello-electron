# Simplified Jellyfin Desktop Client

A streamlined Electron-based desktop client for Jellyfin with enhanced codec support and direct streaming capabilities.

## Key Features

- **Universal Codec Support**: Enhanced support for all major video and audio codecs
- **Direct Streaming**: Optimized for direct play to minimize transcoding
- **Clean Interface**: Simplified, modern UI with minimal distractions
- **Hardware Acceleration**: Enabled GPU acceleration for smooth playback
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Supported Codecs

### Video Codecs
- H.264 (AVC)
- H.265 (HEVC)
- VP8, VP9
- AV1
- MPEG-4, MPEG-2
- VC-1, WMV
- DivX, XviD

### Audio Codecs
- AAC, MP3
- DTS, DTS-HD
- Dolby TrueHD
- FLAC, Opus
- Vorbis, WMA
- PCM (various formats)

### Container Formats
- MP4, M4V
- MKV
- WebM
- AVI, MOV
- TS, M2TS
- WMV, ASF
- And many more...

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run in Development**
   ```bash
   npm start
   ```

3. **Build for Distribution**
   ```bash
   npm run build
   ```

### Simplified from Original
- Removed complex zoom functionality
- Eliminated unnecessary DPI scaling code
- Removed file upload handling (incomplete feature)
- Simplified context menu
- Removed redundant IPC handlers
- Cleaner code structure

### Enhanced Features
- **Comprehensive codec support** with detailed device profile
- **Improved hardware acceleration** settings
- **Better CSP policies** for media playback
- **Enhanced direct play** preferences
- **Modern login interface** with better UX
- **Automatic codec detection** and profile injection

## Configuration

The app automatically:
- Saves your server URL for quick reconnection
- Applies optimal codec profiles for direct streaming
- Enables hardware acceleration when available
- Configures CSP policies for media compatibility

## Usage

1. **First Launch**: Enter your Jellyfin server address (IP:port or domain)
2. **Automatic Connection**: The app remembers your server for future launches
3. **Change Servers**: Right-click anywhere and select "Change Server"
4. **Direct Streaming**: The app automatically optimizes for direct play

## Advanced Settings

The client automatically configures optimal settings for:
- **Maximum bitrate**: 120 Mbps streaming, 100 Mbps static
- **Direct play profiles**: All major codecs and containers
- **Hardware acceleration**: GPU-accelerated decoding when available
- **Audio channels**: Up to 6-channel surround sound

## Troubleshooting

- **Connection Issues**: Ensure your Jellyfin server is running and accessible
- **Playback Problems**: Check that your media files use supported codecs
- **Performance**: The app enables hardware acceleration automatically
- **Audio Issues**: Verify your system supports the audio codec being used

## Contributing

Feel free to submit issues and enhancement requests. This is a simplified version focused on core functionality and codec support.

## License

MIT License - feel free to modify and distribute as needed.
