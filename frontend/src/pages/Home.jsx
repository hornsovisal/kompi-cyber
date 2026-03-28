import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Stats from '../components/Stats'
import Courses from '../components/Courses'
import Announcements from '../components/Announcements'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <Courses />
      <Announcements />
      <CTA />
      <Footer />
    </>
  )
}
