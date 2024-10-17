import { useEffect, useState } from 'react'
import { VerificationModal } from './VerificationModal'

const CookieConsentBanner = () => {
  const [isVisible, setVisible] = useState(true)
  const [verifModalVisible, setVerifModalVisible] = useState(false)

  useEffect(() => {
    const verified = localStorage.getItem('verified')

    if (verified === null) {
      return
    }

    if (verified === 'true') {
      return
    }

    setVerifModalVisible(true)
  }, [])

  const handleSuccessVerification = () => {
    setVerifModalVisible(false)
    setVisible(false)
    alert('Verification success!')
    localStorage.setItem('verified', 'true')
  }

  const handleStartVerification = () => {
    setVerifModalVisible(true)
    localStorage.setItem('verified', 'false')
  }

  return (
    <div style={{ position: 'absolute', display: isVisible ? 'block' : 'none' }}>
      {verifModalVisible && <VerificationModal onSuccess={handleSuccessVerification} />}

      <div className={'fixed bottom-0 left-0 w-full bg-blue-500 text-white p-4 flex justify-between items-center '}>
        <div>
          <p className='font-bold'>This website uses cookies</p>
          <p>We use cookies to ensure you get the best experience on our website.</p>
        </div>
        <button onClick={handleStartVerification} className='px-4 py-2 text-blue-500 bg-white rounded'>
          Accept
        </button>
      </div>
      {/* <div id='cookieconsent'></div> */}
    </div>
  )
}

export default CookieConsentBanner
