import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white drop-shadow-lg">
          💻 LaptopFinder
        </Link>
        <nav className="space-x-6 text-white/90">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <Link href="/about" className="hover:text-white transition">About</Link>
        </nav>
      </div>
    </header>
  )
}