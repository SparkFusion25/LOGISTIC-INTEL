'use client';

export default function DashboardPage() {
  return (
    <div className="p-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
      <div className="bg-blue-100 p-4 rounded-lg">
        <p className="text-blue-800">Welcome to Logistic Intel Dashboard</p>
        <p className="text-gray-600 mt-2">This is a test to see if Tailwind CSS is working properly.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Test Card 1</h3>
          <p className="text-green-600">If you see colors, CSS is working</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Test Card 2</h3>
          <p className="text-yellow-600">Layout should be responsive</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800">Test Card 3</h3>
          <p className="text-red-600">Check browser dev tools for errors</p>
        </div>
      </div>
      
      <div className="mt-6 space-y-2">
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Test Button
        </button>
        <br />
        <a href="/dashboard/search" className="text-blue-500 underline">
          Go to Search Page
        </a>
      </div>
    </div>
  )
}