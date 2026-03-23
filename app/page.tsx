import QuizForm from '@/components/QuizForm'
import TrendingPicks from '@/components/TrendingPicks'

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 drop-shadow-lg">
        Find Your Perfect Laptop
      </h1>
      <p className="text-xl text-white/80 text-center mb-12 max-w-2xl">
        Answer a few questions and our AI will match you with the ideal laptop.
      </p>
      <QuizForm />
      <TrendingPicks />
    </div>
  )
}