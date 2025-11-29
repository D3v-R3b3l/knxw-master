import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "./LoadingStates";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Filter,
  Download,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function DataTable({
  data = [],
  columns = [],
  loading = false,
  error = null,
  title,
  description,
  searchable = true,
  filterable = false,
  exportable = false,
  pagination = true,
  pageSize = 10,
  sortable = true,
  selectable = false,
  onRowClick,
  onExport,
  customFilters = [],
  emptyState,
  className = ""
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [activeFilters, setActiveFilters] = useState({});

  // Process and filter data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm && searchable) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        columns.some(column => {
          const value = getNestedValue(row, column.key);
          return String(value || '').toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply custom filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(row => {
          const rowValue = getNestedValue(row, key);
          return String(rowValue) === String(value);
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        let comparison = 0;
        if (aValue > bValue) comparison = 1;
        if (aValue < bValue) comparison = -1;
        
        return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, activeFilters, columns, searchable]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = pagination 
    ? processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : processedData;

  // Helper function to get nested object values
  function getNestedValue(obj, path) {
    return path.split('.').reduce((value, key) => value?.[key], obj);
  }

  // Sorting handler
  const handleSort = (columnKey) => {
    if (!sortable) return;
    
    setSortConfig(prevConfig => ({
      key: columnKey,
      direction: prevConfig.key === columnKey && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (index, checked) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
  };

  // Render cell content
  const renderCell = (row, column) => {
    const value = getNestedValue(row, column.key);
    
    if (column.render) {
      return column.render(value, row);
    }
    
    if (column.type === 'date' && value) {
      return format(new Date(value), column.dateFormat || 'MMM d, yyyy');
    }
    
    if (column.type === 'badge' && value) {
      const badgeConfig = column.badgeConfig?.[value] || {};
      return (
        <Badge className={badgeConfig.className || ''}>
          {badgeConfig.label || value}
        </Badge>
      );
    }
    
    if (column.type === 'number' && typeof value === 'number') {
      return value.toLocaleString();
    }
    
    return value || '-';
  };

  if (loading) {
    return <TableSkeleton rows={pageSize} columns={columns.length} />;
  }

  if (error) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardContent className="p-8 text-center">
          <p className="text-[#ef4444]">Error loading data: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-[#111111] border-[#262626]", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-white">{title}</CardTitle>}
          {description && <p className="text-[#a3a3a3] text-sm">{description}</p>}
        </CardHeader>
      )}
      
      <CardContent>
        {/* Toolbar */}
        {(searchable || filterable || exportable) && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            {searchable && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#0a0a0a] border-[#262626] text-white"
                />
              </div>
            )}
            
            {/* Filters */}
            {filterable && customFilters.map((filter) => (
              <select
                key={filter.key}
                value={activeFilters[filter.key] || 'all'}
                onChange={(e) => setActiveFilters(prev => ({
                  ...prev,
                  [filter.key]: e.target.value
                }))}
                className="px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white"
              >
                <option value="all">All {filter.label}</option>
                {filter.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
            
            {/* Export */}
            {exportable && (
              <Button
                onClick={onExport}
                variant="outline"
                className="border-[#262626] text-[#a3a3a3]"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        )}

        {/* Table */}
        {processedData.length === 0 ? (
          <div className="text-center py-12">
            {emptyState || (
              <>
                <div className="w-16 h-16 bg-[#262626] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-[#a3a3a3]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No data found</h3>
                <p className="text-[#a3a3a3]">
                  {searchTerm ? 'Try adjusting your search terms' : 'No records to display'}
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#262626]">
                    {selectable && (
                      <th className="p-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedRows.size === paginatedData.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-[#262626]"
                        />
                      </th>
                    )}
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={cn(
                          "p-3 text-left text-[#a3a3a3] font-medium",
                          sortable && "cursor-pointer hover:text-white transition-colors"
                        )}
                        onClick={() => handleSort(column.key)}
                      >
                        <div className="flex items-center gap-2">
                          {column.label}
                          {sortable && sortConfig.key === column.key && (
                            sortConfig.direction === 'asc' ? (
                              <SortAsc className="w-4 h-4" />
                            ) : (
                              <SortDesc className="w-4 h-4" />
                            )
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <tr
                      key={index}
                      className={cn(
                        "border-b border-[#262626] hover:bg-[#1a1a1a] transition-colors",
                        onRowClick && "cursor-pointer",
                        selectedRows.has(index) && "bg-[#00d4ff]/10"
                      )}
                      onClick={() => onRowClick?.(row, index)}
                    >
                      {selectable && (
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(index)}
                            onChange={(e) => handleSelectRow(index, e.target.checked)}
                            className="rounded border-[#262626]"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key} className="p-3 text-white">
                          {renderCell(row, column)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-[#a3a3a3]">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} results
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="border-[#262626]"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="border-[#262626]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <span className="px-3 py-1 text-sm text-white bg-[#262626] rounded">
                    {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="border-[#262626]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="border-[#262626]"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}