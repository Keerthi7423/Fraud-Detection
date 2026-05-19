import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '../common/RiskBadge';

const TransactionTable = ({ data = [], loading, isQueueView, onAction }) => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'transactionId',
        header: 'TXN ID',
        cell: (info) => (
          <span className="font-mono text-xs text-blue-400">
            {info.getValue().substring(0, 12)}...
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Amount <ArrowUpDown size={14} />
          </button>
        ),
        cell: (info) => (
          <span className="font-bold">
            ₹{info.getValue().toLocaleString('en-IN')}
          </span>
        ),
      },
      {
        accessorKey: 'merchantName',
        header: 'Merchant',
        cell: (info) => <span className="truncate max-w-[150px] block">{info.getValue()}</span>,
      },
      {
        accessorKey: 'merchantCategory',
        header: 'Category',
        cell: (info) => (
          <span className="text-gray-400 capitalize">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: 'location.city',
        header: 'City',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'timestamp',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Time <ArrowUpDown size={14} />
          </button>
        ),
        cell: (info) => {
          const date = new Date(info.getValue());
          return (
            <div className="flex flex-col">
              <span className="text-sm">
                {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
              <span className="text-[10px] text-gray-500">
                {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'riskScore',
        header: 'Risk Score',
        cell: (info) => {
          const score = info.getValue();
          const getColor = (s) => {
            if (s >= 90) return 'bg-red-500';
            if (s >= 70) return 'bg-orange-500';
            if (s >= 40) return 'bg-amber-500';
            return 'bg-emerald-500';
          };
          return (
            <div className="flex flex-col gap-1 w-24">
              <div className="flex justify-between text-[10px] font-mono">
                <span>{score}%</span>
              </div>
              <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const row = info.row.original;
          return <RiskBadge level={row.riskLevel} status={info.getValue()} />;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          if (isQueueView) {
            return (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onAction(info.row.original.transactionId, 'approved'); }}
                  className="px-3 py-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-md transition-colors text-xs font-semibold border border-green-500/20 hover:border-green-500/50"
                >
                  Approve
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onAction(info.row.original.transactionId, 'rejected'); }}
                  className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md transition-colors text-xs font-semibold border border-red-500/20 hover:border-red-500/50"
                >
                  Reject
                </button>
                <button
                  onClick={() => navigate(`/transactions/${info.row.original.transactionId}`)}
                  className="p-1 hover:bg-blue-500/10 text-blue-400 rounded-md transition-colors ml-1"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
              </div>
            );
          }
          return (
            <button
              onClick={() => navigate(`/transactions/${info.row.original.transactionId}`)}
              className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye size={18} />
            </button>
          );
        },
      },
    ],
    [navigate, isQueueView, onAction]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <div className="w-full bg-[#11131C] border border-[#2A2D3E] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1A1D27] text-gray-400 text-xs uppercase tracking-wider">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th 
                    key={header.id} 
                    className={`px-6 py-4 font-semibold border-b border-[#2A2D3E] ${
                      header.column.id === 'location_city' || header.column.id === 'location.city' || header.column.id === 'merchantCategory' 
                        ? 'hidden md:table-cell' 
                        : ''
                    }`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[#1A1D27]">
            {table.getRowModel().rows.map((row) => {
              const isCritical = row.original.riskScore >= 91;
              return (
                <tr
                  key={row.id}
                  className={`group transition-colors hover:bg-[#1A1D27]/50 ${
                    isCritical ? 'bg-red-500/5 animate-pulse-subtle shadow-[inset_0_0_20px_rgba(220,38,38,0.1)]' : ''
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td 
                      key={cell.id} 
                      className={`px-6 py-4 text-sm text-gray-300 ${
                        cell.column.id === 'location_city' || cell.column.id === 'location.city' || cell.column.id === 'merchantCategory' 
                          ? 'hidden md:table-cell' 
                          : ''
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 bg-[#1A1D27]/30 border-t border-[#2A2D3E] flex items-center justify-between text-gray-400 text-sm">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="bg-[#11131C] border border-[#2A2D3E] rounded px-2 py-1 outline-none text-xs"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <span>Page</span>
            <span className="font-bold text-white">
              {table.getState().pagination.pageIndex + 1}
            </span>
            <span>of</span>
            <span className="font-bold text-white">{table.getPageCount()}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1 disabled:opacity-30 hover:text-white transition-colors"
            >
              <ChevronsLeft size={20} />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 disabled:opacity-30 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 disabled:opacity-30 hover:text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1 disabled:opacity-30 hover:text-white transition-colors"
            >
              <ChevronsRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
