import React, { useState, useEffect, useRef } from 'react';

const HomePage: React.FC = () => {
  const [userName, setUserName] = useState<string>(''); // Store the user's name
  const [isNameEntered, setIsNameEntered] = useState<boolean>(false); // Toggle for showing main content
  const [userVideo, setUserVideo] = useState<MediaStream | null>(null); // User's video stream
  const [remoteVideo, setRemoteVideo] = useState<string>(''); // Remote user's video stream
  const [isRemoteUserConnected, setIsRemoteUserConnected] = useState<boolean>(false); // Track if remote user is connected
  const [facingMode] = useState<'user' | 'environment'>('user'); // Camera toggle state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false); // State to track if the user is speaking
  const [isMuted, setIsMuted] = useState<boolean>(false); // State to track if the microphone is muted
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false); // State to track if the camera is off by default
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]); // Available video devices
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]); // Available audio devices
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>(''); // Selected video device
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>(''); // Selected audio device
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false); // Modal open state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === 'videoinput');
        const audioDevices = devices.filter((device) => device.kind === 'audioinput');
        setVideoDevices(videoDevices);
        setAudioDevices(audioDevices);

        if (videoDevices.length > 0) {
          setSelectedVideoDevice(videoDevices[0].deviceId); // Select first video device by default
        }
        if (audioDevices.length > 0) {
          setSelectedAudioDevice(audioDevices[0].deviceId); // Select first audio device by default
        }
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };
    getDevices();
  }, []);

  useEffect(() => {
    // Request camera and microphone access when the component mounts or when device selection changes
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
            facingMode: isCameraOn ? facingMode : undefined, // Only request video if camera is on
          },
          audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
        });
        setUserVideo(stream);
        if (videoRef.current && isCameraOn) {
          videoRef.current.srcObject = stream;
        }

        // Set up audio context and analyser
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        // Monitor audio levels
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const checkAudioLevels = () => {
          analyserRef.current?.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setIsSpeaking(average > 80); // Adjust threshold as needed
          requestAnimationFrame(checkAudioLevels);
        };
        checkAudioLevels();
      } catch (err) {
        console.error('Error accessing media devices:', err);
        alert('Unable to access your camera or microphone. Please check your permissions.');
      }
    };

    getMedia();

    // Cleanup function to stop the video and audio streams when the component unmounts
    return () => {
      if (userVideo) {
        const tracks = userVideo.getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [selectedVideoDevice, selectedAudioDevice, isCameraOn, facingMode]);

  const handleNameSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (userName.trim()) {
      setIsNameEntered(true);
    } else {
      alert('Please enter your name.');
    }
  };

  const handleNextClick = () => {
    console.log('Connecting to another user...');
    // Simulate connection to remote user
    setTimeout(() => {
      setRemoteVideo('remoteVideoStreamUrl'); // Set the remote video stream URL once connected
      setIsRemoteUserConnected(true); // Mark the remote user as connected
    }, 2000); // Simulate delay of connection
  };

  const handleDisconnectClick = () => {
    console.log('Disconnecting...');
    setIsRemoteUserConnected(false);
    setRemoteVideo('');
  };

  const toggleMute = () => {
    if (userVideo) {
      const audioTracks = userVideo.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled; // Toggle the enabled state of the audio tracks
      });
      setIsMuted((prev) => !prev); // Update the mute state
    }
  };

  const toggleCameraOnOff = () => {
    setIsCameraOn((prev) => {
      const newState = !prev;
      if (!newState && userVideo) {
        userVideo.getVideoTracks().forEach((track) => track.stop());
      }
      return newState;
    });
  };

  // Open the settings modal
  const openSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  // Close the settings modal
  const closeSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {!isNameEntered ? (
        <div className="flex flex-col items-center justify-center p-10 space-y-8 absolute inset-0 z-10 bg-black bg-opacity-70">
          <h1 className="text-4xl font-bold text-white mb-6">What is your name?</h1>
          <form onSubmit={handleNameSubmit} className="flex flex-col items-center space-y-4">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="px-6 py-3 text-lg bg-gray-700 text-white rounded-full placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-8 py-4 text-lg font-semibold text-black bg-white rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Confirm
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-10 space-y-12">
          <h1 className="text-6xl font-extrabold text-center tracking-widest text-white drop-shadow-2xl">
            Finding friends
          </h1>

          <div className="flex flex-col lg:flex-row w-full max-w-6xl mb-8 gap-12 lg:gap-16">
            {/* User Video */}
            <div
            className={`flex-1 flex justify-center items-center relative ${
                isSpeaking ? 'border-4 border-green-500' : 'border-4 border-transparent'
            }`}
            >
            <div
                className={`relative w-full h-96 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 ${
                isCameraOn ? 'bg-gray-800' : 'bg-gray-500' // Grey background when camera is off
                }`}
            >
                {/* Display camera off icon when the camera is off */}
                {!isCameraOn && (
                <div className="w-full h-full flex justify-center items-center bg-gray-500 opacity-80">
                    <i className="fas fa-video-slash text-5xl text-white"></i> {/* Camera off icon */}
                </div>
                )}

                <video
                ref={videoRef}
                className="w-full h-full object-cover transition-opacity duration-300"
                autoPlay
                muted
                playsInline
                style={{ opacity: isCameraOn ? 1 : 0 }} // Fade out the video when camera is off
                />
                <div className="absolute bottom-0 w-full text-center text-white text-lg py-2">
                {userName}
                </div>

            </div>
            </div>


            {/* Remote User Video with Overlay */}
            <div className="flex-1 flex justify-center items-center relative">
              <div className="relative w-full h-96 bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105">
                {/* Remote Video */}
                {remoteVideo ? (
                  <video className="w-full h-full object-cover" src={remoteVideo} autoPlay />
                ) : (
                         //searcinh on the other user
                  <div className="w-full h-full flex justify-center items-center text-3xl font-semibold text-white">
                    <div className="animate-spin rounded-full border-t-4 border-b-4 border-white w-20 h-20"></div>
                    <span className="ml-4">Searching...</span>
                  </div>
                )}
                {/* Remote user's name */}
                {isRemoteUserConnected && (
                <div className="absolute bottom-0 w-full text-center text-white text-lg py-2">
                    Remote User
                </div>
                )}

              </div>
            </div>
          </div>

          {/* Settings Icon */}
          <button
            onClick={openSettingsModal}
            className="absolute top-5 right-5 text-white text-3xl p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all z-50"
          >
            <i className="fas fa-cogs"></i>
          </button>

        {/* Settings Modal */}
        {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center">
            <div className="bg-gray-800 p-8 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Settings</h2>
            
            {/* Change Username Section */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-300">Change Username</label>
                <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)} // Update the userName state
                className="w-full p-2 mt-2 bg-gray-700 text-white border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Video Device Selection */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-300">Select Camera</label>
                <select
                value={selectedVideoDevice}
                onChange={(e) => setSelectedVideoDevice(e.target.value)}
                className="w-full p-2 mt-2 bg-gray-700 text-white border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                {videoDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId}`}
                    </option>
                ))}
                </select>
            </div>

            {/* Audio Device Selection */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-300">Select Microphone</label>
                <select
                value={selectedAudioDevice}
                onChange={(e) => setSelectedAudioDevice(e.target.value)}
                className="w-full p-2 mt-2 bg-gray-700 text-white border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                {audioDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId}`}
                    </option>
                ))}
                </select>
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-4">
                <button
                onClick={closeSettingsModal}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all"
                >
                Close
                </button>
            </div>
            </div>
        </div>
        )}


        <div className="flex gap-8 mb-6 flex-wrap justify-center">
        {/* Start/Next Button */}
        <button
            className="px-10 py-5 text-xl font-semibold text-black bg-white rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 shadow-2xl"
            onClick={handleNextClick}
        >
            <i className={`fas ${isRemoteUserConnected ? 'fa-arrow-right' : 'fa-play'}`}></i>
        </button>

        {/* Disconnect Button */}
        <button
            className="px-10 py-5 text-xl font-semibold text-white border-2 border-white rounded-full hover:bg-gray-900 transition-all duration-300 transform hover:scale-110"
            onClick={handleDisconnectClick}
        >
            <i className="fas fa-times"></i>
        </button>

        {/* Microphone Mute/Unmute Button */}
        <button
            className="px-10 py-4 text-lg font-semibold text-white bg-red-500 rounded-full hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
            onClick={toggleMute}
        >
            <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
        </button>

        {/* Camera On/Off Button */}
        <button
            className="px-10 py-4 text-lg font-semibold text-white bg-purple-500 rounded-full hover:bg-purple-600 transition-all duration-300 transform hover:scale-105"
            onClick={toggleCameraOnOff}
        >
            <i className={`fas ${isCameraOn ? 'fa-video' : 'fa-video-slash'}`}></i>
        </button>
        </div>



          {/* Footer */}
          <footer className="absolute bottom-0 w-full text-center text-gray-400 py-4 text-sm">
            <p>Made with ❤️</p>
          </footer>
        </div>
      )}
    </div>
  );
};

export default HomePage;
