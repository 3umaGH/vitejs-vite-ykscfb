import { useRef } from 'react'

const CookieConsentBanner = () => {
  const divRef = useRef<HTMLDivElement>(null)

  return (
    <div style={{ position: 'absolute' }}>
      <div className={'fixed bottom-0 left-0 w-full bg-blue-500 text-white p-4 flex justify-between items-center '}>
        <div>
          <p className='font-bold'>This website uses cookies</p>
          <p>We use cookies to ensure you get the best experience on our website.</p>
        </div>
        <button className='px-4 py-2 text-blue-500 bg-white rounded'>Accept</button>
      </div>
      {/* <div id='cookieconsent'></div> */}
    </div>
  )
}

export default CookieConsentBanner
