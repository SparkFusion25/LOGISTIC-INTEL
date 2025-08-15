'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Search, Filter, Download, MoreVertical } from 'lucide-react'

interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  data: any[]
  columns: Column[]
  searchable?: boolean
  filterable?: boolean
  exportable?: boolean
  pagination?: boolean
  pageSize?: number
}

export default function DataTable({ 
  data, 
  columns, 
  searchable = true, 
  filterable = true, 
  exportable = true,
  pagination = true,
  pageSize = 10 
}: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const filteredData = data.filter(row =>
    searchQuery === '' || 
    Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        const modifier = sortDirection === 'asc' ? 1 : -1
        
        if (typeof aVal === 'string') {
          return aVal.localeCompare(bVal) * modifier
        }
        return (aVal - bVal) * modifier
      })
    : filteredData

  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData

  const totalPages = Math.ceil(sortedData.length / pageSize)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Table Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {searchable && (
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            {filterable && (
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            )}
            {exportable && (
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && sortColumn === column.key && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    currentPage === page
                      ? 'bg-sky-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}