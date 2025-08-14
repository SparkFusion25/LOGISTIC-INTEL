import SearchPanel from '@/components/SearchPanel'
import SearchResultsMount from '@/components/SearchResultsMount'

export default function SearchPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-semibold">Trade Intelligence Search</h1>
      <p className="text-sm text-brand-muted">Discover global trade patterns and company insights.</p>

      <div className="mt-5 card p-4">
        <SearchPanel />
      </div>

      <div id="search-results" className="mt-5" />
      <SearchResultsMount />
    </div>
  )
}