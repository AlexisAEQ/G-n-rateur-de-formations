import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, SkipForward, Settings } from 'lucide-react';

const VideoPlayer = ({ 
  src, 
  title, 
  poster,
  onProgress,
  onComplete,
  primaryColor = '#1e40af',
  autoPlay = false,
  showControls = true 
}) => {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gestion des événements vidéo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onProgress) {
        const progress = (video.currentTime / video.duration) * 100;
        onProgress(progress);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onComplete) {
        onComplete();
      }
    };

    const handleError = () => {
      setError('Erreur lors du chargement de la vidéo');
      setIsLoading(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onProgress, onComplete]);

  // Gestion du mode plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Formatage du temps
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Contrôles de lecture
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleProgressClick = (e) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickPercent = clickX / rect.width;
      const newTime = clickPercent * duration;
      videoRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10;
    }
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSettings(false);
  };

  if (error) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="text-red-600 mb-2">⚠️ Erreur de lecture</div>
        <div className="text-gray-600 text-sm">{error}</div>
        <div className="text-gray-500 text-xs mt-2">
          Vérifiez que le fichier vidéo existe : <code>{src}</code>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
      {/* Titre de la vidéo */}
      {title && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent z-10 p-4">
          <h3 className="text-white font-medium">{title}</h3>
        </div>
      )}

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Élément vidéo */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-auto max-h-96"
        preload="metadata"
        autoPlay={autoPlay}
        onClick={togglePlay}
      />

      {/* Contrôles vidéo personnalisés */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent z-10">
          {/* Barre de progression */}
          <div className="px-4 pb-2">
            <div
              ref={progressRef}
              className="w-full h-1 bg-white/30 rounded-full cursor-pointer hover:h-2 transition-all"
              onClick={handleProgressClick}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  backgroundColor: primaryColor
                }}
              />
            </div>
          </div>

          {/* Contrôles principaux */}
          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center space-x-3">
              {/* Bouton play/pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>

              {/* Boutons de navigation */}
              <button
                onClick={skipBackward}
                className="text-white hover:text-gray-300 transition-colors"
                title="Reculer de 10s"
              >
                <RotateCcw size={20} />
              </button>

              <button
                onClick={skipForward}
                className="text-white hover:text-gray-300 transition-colors"
                title="Avancer de 10s"
              >
                <SkipForward size={20} />
              </button>

              {/* Temps */}
              <div className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Contrôle du volume */}
              <div className="flex items-center space-x-2 group">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                
                <div className="w-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/30 rounded-full appearance-none slider"
                  />
                </div>
              </div>

              {/* Vitesse de lecture */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <Settings size={20} />
                </button>

                {showSettings && (
                  <div className="absolute bottom-8 right-0 bg-black/90 rounded-lg p-2 min-w-32">
                    <div className="text-white text-xs mb-2">Vitesse</div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <button
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-white/20 transition-colors ${
                          playbackRate === rate ? 'text-yellow-400' : 'text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Plein écran */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de lecture */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
          isLoading || (!isPlaying && currentTime === 0) ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {!isLoading && (
          <button
            onClick={togglePlay}
            className="bg-black/50 rounded-full p-4 text-white hover:bg-black/70 transition-colors pointer-events-auto"
          >
            <Play size={48} />
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;