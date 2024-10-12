/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react'
import kebab from '../../../assets/kebab.png'
import skibidi from '../../../assets/skibidi.png'
import { cn } from '../../cn'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

enum VideoStatus {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

const COUNTDOWN_SECONDS = 4
const MISSED_BEATS_FAIL_THRESHOLD = 20

export const VerificationModel = ({ onSuccess }: { onSuccess: () => void }) => {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [player, setPlayer] = useState<any>(null) // YT.Player type can be complex, so using any for simplicity
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [targetBPM, setTargetBPM] = useState<number>(0)
  const [timestamps, setTimestamps] = useState<number[]>([])
  const [userBPM, setUserBPM] = useState<number | null>(null)
  const [userFails, setUserFails] = useState<number>(0)
  const [beat, setBeat] = useState(false)
  const [beatImage, setBeatImage] = useState(skibidi)
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(VideoStatus.UNSTARTED)
  const beatIntervalRef = useRef<null | number>(null)
  const isGameStarted = countdown === 0

  useEffect(() => {
    const lastTimestamp = timestamps[timestamps.length - 1]

    if (lastTimestamp && Date.now() - lastTimestamp > 1000) {
      setTimestamps([])
      setUserBPM(0)
    }
  }, [timestamps, beat])

  useEffect(() => {
    if (videoStatus === VideoStatus.PLAYING && beat && Math.abs((userBPM ?? 0) - targetBPM) > 3) {
      setUserFails(p => {
        const newFails = p + 1

        if (newFails > MISSED_BEATS_FAIL_THRESHOLD) {
          alert('Verification failed. Please try again.')
          location.reload()
        }

        return newFails
      })
    }
  }, [beat, player, targetBPM, userBPM, videoStatus])

  const initalizeVideo = useCallback(() => {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }

    tag.onerror = () => console.error('Failed to load YouTube Iframe API')

    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('player', {
        width: '100%',
        videoId: '5nbSPCm8lDA',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          mute: 0,
          start: 60, //60
        },
        events: {
          onReady: () => {
            setPlayer(newPlayer)
          },
          onError: () => {
            alert('Failed to load video.')
          },
          onStateChange: (a: { data: number }) => {
            const status = a.data as VideoStatus
            setVideoStatus(status)

            if (status === VideoStatus.ENDED) {
              onSuccess()
            }
          },
        },
      })
    }
  }, [onSuccess])

  useEffect(() => {
    initalizeVideo()
    document.body.classList.add('overflow-hidden')
    addEventListener('keydown', handleKeyPress)

    return () => {
      window.onYouTubeIframeAPIReady = undefined
      removeEventListener('keydown', handleKeyPress)
      document.body.classList.remove('overflow-hidden')
    }
  }, [initalizeVideo])

  const handleSetTargetBPM = useCallback((bpm: number) => {
    setTargetBPM(prev => {
      if (prev !== bpm) {
        setTimestamps([])

        if (beatIntervalRef.current) {
          clearInterval(beatIntervalRef.current)
        }

        beatIntervalRef.current = setInterval(() => {
          setBeat(true)

          setTimeout(() => {
            setBeat(false)
          }, 60000 / bpm / 2)
        }, 60000 / bpm)
      }

      return bpm
    })
  }, [])

  // Update target bpm
  useEffect(() => {
    if (!player || !isGameStarted) {
      return
    }

    if (currentTime >= 102) {
      handleSetTargetBPM(128)
      setBeatImage(kebab)
    } else {
      handleSetTargetBPM(113)
      setBeatImage(skibidi)
    }
  }, [currentTime, handleSetTargetBPM, isGameStarted, player])

  // Update current video time
  useEffect(() => {
    if (player) {
      setInterval(() => {
        const time = player.getCurrentTime()
        setCurrentTime(time.toFixed(2))
      }, 250)
    }
  }, [player])

  const handleKeyPress = (e: KeyboardEvent | null) => {
    const now = Date.now()

    if (e) {
      if (e.key !== ' ') return
    }

    setTimestamps(prevTimestamps => {
      const newTimestamps = [...prevTimestamps, now]

      if (newTimestamps.length > 1) {
        const timeDiffs = newTimestamps.slice(1).map((t, i) => t - newTimestamps[i])

        const averageTime = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length / 1000

        const calculatedBpm = 60 / averageTime
        setUserBPM(Math.round(calculatedBpm))
      }

      return newTimestamps.slice(-10)
    })
  }

  const handleStartGame = () => {
    const interval = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) {
          if (player) player.playVideo()
          clearInterval(interval)
        }

        return p - 1
      })
    }, 1000)
  }

  const getBPMColor = () => {
    const diff = Math.abs((userBPM ?? 0) - targetBPM)

    if (diff < 2) return 'text-green-300'
    if (diff < 3) return 'text-green-500'
    if (diff > 3 && diff < 5) return 'text-orange-500'
    return 'text-red-500'
  }

  return (
    <div className='fixed z-[100] flex flex-col gap-8 top-0 w-[100svw] h-[100svh] p-8 bg-[rgba(0,0,0,0.8)] overflow-hidden'>
      {/* YouTube iframe container */}

      <div className='absolute top-0 overflow-hidden opacity-0'>
        <div id='player' className='w-1 h-1 overflow-hidden rounded-xl' />
      </div>

      <div className='flex flex-col items-center w-full h-full overflow-hidden md:flex-row justify-evenly'>
        {videoStatus === VideoStatus.PLAYING && (
          <img
            src={beatImage}
            className={cn('xl:max-w-50 max-w-24 h-auto transition-all', {
              '-rotate-12 scale-x-[-1.25] scale-y-[1.25]': beat,
              'rotate-12 scale-x-[-1] scale-y-[1]': !beat,
            })}
          />
        )}

        <div className='flex flex-col gap-4 text-base font-semibold text-center text-white md:text-lg'>
          <p className='text-xl font-bold md:text-3xl '>Please verify that you are a human.</p>
          <p> Match the songs rythm!</p>

          {isGameStarted ? (
            <>
              {videoStatus !== VideoStatus.ENDED && (
                <button
                  className='p-4 m-4 transition-all duration-75 bg-green-500 cursor-pointer select-none rounded-xl active:scale-95 disabled:opacity-50'
                  onClick={() => handleKeyPress(null)}
                  disabled={videoStatus !== VideoStatus.PLAYING}>
                  {videoStatus === VideoStatus.PLAYING
                    ? 'Press spacebar or this button.'
                    : videoStatus === VideoStatus.BUFFERING
                    ? 'Buffering...'
                    : 'Loading...'}
                </button>
              )}
              <div className='flex items-center gap-2 text-sm md:text-base'>
                Human
                <div className='w-full h-4 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-700'>
                  <div
                    className='h-4 transition-all duration-1000 bg-orange-600 rounded-full'
                    style={{ width: `${(100 / MISSED_BEATS_FAIL_THRESHOLD) * userFails}%` }}></div>
                </div>
                Robot
              </div>
              <span className={cn(getBPMColor(), 'text-xl font-bold')}>Your BPM: {userBPM ?? 0}</span>
            </>
          ) : (
            <div>
              {countdown === COUNTDOWN_SECONDS ? (
                <p
                  className='p-4 transition-all duration-75 bg-orange-500 cursor-pointer select-none rounded-xl active:scale-95'
                  onClick={() => handleStartGame()}>
                  Press to start verification
                </p>
              ) : (
                <p className='text-2xl'>Starting in {countdown}...</p>
              )}
            </div>
          )}
        </div>

        {videoStatus === VideoStatus.PLAYING && (
          <img
            src={beatImage}
            className={cn('xl:max-w-50 max-w-24 h-auto transition-all', {
              'rotate-12 scale-[1.25]': beat,
              '-rotate-12 scale-[1]': !beat,
            })}
          />
        )}
      </div>
    </div>
  )
}
