import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Coach Athlete App
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Professional workout management platform connecting coaches and athletes.
            Create, assign, and track workouts with ease.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">👨‍💼</div>
              <h3 className="text-2xl font-semibold mb-4">Coach Dashboard</h3>
              <p className="text-gray-600 mb-6">
                Create custom workouts, manage your athletes, and track their progress
              </p>
              <Link
                href="/auth/signin"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Coach Login
              </Link>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🏃‍♂️</div>
              <h3 className="text-2xl font-semibold mb-4">Athlete Portal</h3>
              <p className="text-gray-600 mb-6">
                View your assigned workouts, log progress, and track your fitness journey
              </p>
              <Link
                href="/auth/signin"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block"
              >
                Athlete Login
              </Link>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-semibold mb-8">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Workout Builder</h4>
                <p className="text-sm text-gray-600">Drag-and-drop interface to create custom workout plans</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Progress Tracking</h4>
                <p className="text-sm text-gray-600">Real-time monitoring of athlete performance and completion</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Exercise Library</h4>
                <p className="text-sm text-gray-600">Comprehensive database with video demonstrations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}