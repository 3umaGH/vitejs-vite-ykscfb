import { useState } from 'react'
import { VerificationModel } from './VerificationModel'

const CookieConsentBanner = () => {
  const [isVisible,setVisible] = useState(true)
  const [verifModalVisible, setVerifModalVisible] = useState(false)

  const handleSuccessVerification = () => {
    setVerifModalVisible(false)
    setVisible(false)
    alert('Verification success!')
  }

  return (
    <div style={{ position: 'absolute', display: isVisible ? 'block' : 'none' }}>
      {verifModalVisible && <VerificationModel onSuccess={handleSuccessVerification} />}

      <div className={'fixed bottom-0 left-0 w-full bg-blue-500 text-white p-4 flex justify-between items-center '}>
        <div>
          <p className='font-bold'>This website uses cookies</p>
          <p>We use cookies to ensure you get the best experience on our website.</p>
        </div>
        <button onClick={() => setVerifModalVisible(true)} className='px-4 py-2 text-blue-500 bg-white rounded'>
          Accept
        </button>
      </div>
      {/* <div id='cookieconsent'></div> */}
    </div>
  )
}

export default CookieConsentBanner
