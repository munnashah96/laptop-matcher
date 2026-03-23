export default function Footer() {
  return (
    <footer className="bg-white/5 backdrop-blur-sm border-t border-white/20 py-6">
      <div className="container mx-auto px-4 text-center text-white/70 text-sm">
        © {new Date().getFullYear()} LaptopMatcher. All rights reserved.
      </div>
    </footer>
  )
}