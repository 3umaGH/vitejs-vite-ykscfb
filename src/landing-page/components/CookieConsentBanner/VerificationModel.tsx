/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import kebab from '../../../assets/kebab.png'
import skibidi from '../../../assets/skibidi.png'
import { cn } from '../../cn'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

export const VerificationModel = () => {
  const [player, setPlayer] = useState<any>(null) // YT.Player type can be complex, so using any for simplicity
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [targetBPM, setTargetBPM] = useState<number>(0)
  const [timestamps, setTimestamps] = useState<number[]>([])
  const [userBPM, setUserBPM] = useState<number | null>(null)
  const [userFails, setUserFails] = useState<number>(0)
  const [beat, setBeat] = useState(false)
  const [beatImage, setBeatImage] = useState(skibidi)
  const [isPlaying, setPlaying] = useState(false)
  const beatIntervalRef = useRef<null | number>(null)

  useEffect(() => {
    const lastTimestamp = timestamps[timestamps.length - 1]

    if (lastTimestamp && Date.now() - lastTimestamp > 1000) {
      setTimestamps([])
      setUserBPM(0)
    }
  }, [timestamps, beat])

  useEffect(() => {
    if (isPlaying && beat && Math.abs((userBPM ?? 0) - targetBPM) > 3) {
      setUserFails(p => {
        const newFails = p + 1

        if (newFails > 10) {
          alert('Verification failed. Please try again.')
          location.reload()
        }

        return newFails
      })
    }
  }, [beat, isPlaying, targetBPM, userBPM])

  console.log(userFails)
  useEffect(() => {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }

    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('player', {
        width: '100%',
        videoId: 'mUPlzggNRoE',
        playerVars: {
          autoplay: 1,
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
          onStateChange: (a: { data: number }) => {
            if (a.data === 1) setPlaying(true)
            else setPlaying(false)
          },
        },
      })
    }

    document.body.classList.add('overflow-hidden')

    const checkPlay = () => {
      player.playVideo()
      requestAnimationFrame(checkPlay)
    }

    requestAnimationFrame(checkPlay)
    addEventListener('keydown', handleKeyPress)

    return () => {
      window.onYouTubeIframeAPIReady = undefined
      removeEventListener('keydown', handleKeyPress)
      document.body.classList.remove('overflow-hidden')
    }
  }, [player])

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
    if (!player) {
      return
    }

    if (currentTime >= 102) {
      handleSetTargetBPM(128)
      setBeatImage(kebab)
    } else {
      handleSetTargetBPM(113)
      setBeatImage(skibidi)
    }
  }, [currentTime, handleSetTargetBPM, player])

  // Update current video time
  useEffect(() => {
    if (player) {
      setInterval(() => {
        const time = player.getCurrentTime()
        setCurrentTime(time.toFixed(2))
      }, 50)
    }
  }, [player])

  const handlePlayerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

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
        <div id='player' className='w-1 h-1 overflow-hidden rounded-xl ' />
      </div>

      {/*}  <div
          onClick={handlePlayerClick}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '0%',
            height: '0%',
            background: 'transparent',
            zIndex: 1,
          }}
        />*/}

      <div className='flex flex-col items-center w-full h-full overflow-hidden md:flex-row justify-evenly'>
        {isPlaying && (
          <img
            src={beatImage}
            className={cn('xl:max-w-50 max-w-24 h-auto transition-all', {
              '-rotate-12 scale-x-[-1.25] scale-y-[1.25]': beat,
              'rotate-12 scale-x-[-1] scale-y-[1]': !beat,
            })}
          />
        )}

        <div className='flex flex-col gap-4 text-xl font-semibold text-center text-white'>
          <p className='text-3xl font-bold'>Please verify that you are a human.</p>
          <p> Match the songs BPM</p>
          <p
            className='p-4 transition-all duration-75 bg-green-500 cursor-pointer select-none rounded-xl active:scale-95'
            onClick={() => handleKeyPress(null)}>
            Press <span>Spacebar</span> or this button.
          </p>
          <span>Missed beats: {userFails}</span>
          <span className={getBPMColor()}>Your BPM: {userBPM ?? 0}</span>
        </div>

        {isPlaying && (
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
