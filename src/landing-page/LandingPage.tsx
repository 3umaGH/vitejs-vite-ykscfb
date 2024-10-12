import Clients from './components/Clients'
import FAQ from './components/FAQ'
import Features from './components/Features'
import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import Testimonials from './components/Testimonials'
import { faqs, features, footerNavigation, navigation, testimonials } from './contentSections'

export default function LandingPage() {
  return (
    <div className='overflow-hidden bg-white dark:text-white dark:bg-boxdark-2'>
      <Header navigation={navigation} />

      <main className='isolate dark:bg-boxdark-2'>
        <Hero />
        <Clients />
        <Features features={features} />
        <Testimonials testimonials={testimonials} />
        <FAQ faqs={faqs} />
      </main>

      <Footer footerNavigation={footerNavigation} />
    </div>
  )
}
