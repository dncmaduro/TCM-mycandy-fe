// DataTable.tsx
import * as React from "react"
import clsx from "clsx"
import {
  ColumnDef,
  Row,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  useReactTable
} from "@tanstack/react-table"
import {
  Button,
  Checkbox,
  Menu,
  Pagination,
  Select,
  TextInput
} from "@mantine/core"
import { IconChevronDown, IconSearch } from "@tabler/icons-react"

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  className?: string

  initialPageSize?: number
  pageSizeOptions?: number[]
  enableRowSelection?: boolean
  enableGlobalFilter?: boolean

  // Customization
  extraFilters?: React.ReactNode // render thêm filter ngay trên toolbar (bên trái)
  extraActions?: React.ReactNode // render action bên phải toolbar
  globalFilterValue?: string // cho phép control từ ngoài
  onGlobalFilterChange?: (value: string) => void

  // External pagination (server-side)
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void

  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string
  onRowSelectionChange?: (selectedRows: TData[]) => void
  onRowClick?: (row: Row<TData>) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  className,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  enableRowSelection = false,
  enableGlobalFilter = true,
  extraFilters,
  extraActions,
  globalFilterValue,
  onGlobalFilterChange,
  page,
  totalPages,
  onPageChange,
  getRowId,
  onRowSelectionChange,
  onRowClick
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [internalGlobalFilter, setInternalGlobalFilter] =
    React.useState<string>("")
  const [rowSelection, setRowSelection] = React.useState<
    Record<string, boolean>
  >({})

  const gf = globalFilterValue ?? internalGlobalFilter
  const setGf = onGlobalFilterChange ?? setInternalGlobalFilter

  const table = useReactTable({
    data,
    columns: React.useMemo(() => {
      if (!enableRowSelection) return columns
      const selectionCol: ColumnDef<TData, TValue> = {
        id: "__select__",
        header: ({ table: tbl }) => (
          <Checkbox
            aria-label="Chọn tất cả"
            checked={tbl.getIsAllPageRowsSelected()}
            indeterminate={tbl.getIsSomePageRowsSelected()}
            onChange={(e) =>
              tbl.toggleAllPageRowsSelected(e.currentTarget.checked)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label="Chọn dòng"
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={(e) => row.toggleSelected(e.currentTarget.checked)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 48
      }
      return [selectionCol, ...columns]
    }, [columns, enableRowSelection]),
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter: gf,
      rowSelection
    },
    getRowId,
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGf,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: initialPageSize
      }
    }
  })

  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selected = table.getSelectedRowModel().rows.map((r) => r.original)
      onRowSelectionChange(selected)
    }
  }, [rowSelection, table, onRowSelectionChange])

  const pageSizeValue = String(table.getState().pagination.pageSize)

  // Compute pagination values (controlled vs uncontrolled)
  const currentPage = page ?? table.getState().pagination.pageIndex + 1
  const total = Math.max(1, totalPages ?? table.getPageCount())

  return (
    <div className={clsx("w-full space-y-3", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {enableGlobalFilter && (
          <TextInput
            className="min-w-[220px]"
            placeholder="Tìm kiếm..."
            leftSection={<IconSearch size={16} />}
            value={gf}
            onChange={(e) => setGf(e.currentTarget.value)}
          />
        )}

        {extraFilters}

        <Menu withinPortal>
          <Menu.Target>
            <Button
              variant="light"
              rightSection={<IconChevronDown size={16} />}
            >
              Cột hiển thị
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {table
              .getAllLeafColumns()
              .filter((c) => c.getCanHide())
              .map((column) => (
                <Menu.Item key={column.id}>
                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      checked={column.getIsVisible()}
                      onChange={(e) =>
                        column.toggleVisibility(e.currentTarget.checked)
                      }
                    />
                    <span className="text-sm">
                      {String(column.columnDef.header ?? column.id)}
                    </span>
                  </label>
                </Menu.Item>
              ))}
          </Menu.Dropdown>
        </Menu>

        <div className="ml-auto flex items-center gap-2">
          {extraActions}
          {enableRowSelection && (
            <div className="text-sm text-gray-600">
              Đã chọn: {table.getSelectedRowModel().rows.length}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-gray-200">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sortDir = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={clsx(
                        "px-3 py-2 text-left text-sm font-semibold text-gray-700",
                        canSort && "cursor-pointer select-none"
                      )}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {canSort && (
                          <span className="text-xs text-gray-400">
                            {sortDir === "asc"
                              ? "▲"
                              : sortDir === "desc"
                                ? "▼"
                                : "↕"}
                          </span>
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  className="px-3 py-8 text-center text-sm text-gray-500"
                  colSpan={table.getAllLeafColumns().length}
                >
                  Không có dữ liệu.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={clsx(
                    "border-b border-gray-100 hover:bg-gray-50",
                    enableRowSelection && row.getIsSelected() && "bg-blue-50/60"
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-2 text-sm text-gray-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-gray-600">
          Trang {currentPage} / {total} · Tổng{" "}
          {table.getPrePaginationRowModel().rows.length} dòng
        </div>
        <div className="flex flex-1 justify-center">
          <Pagination
            total={total}
            value={currentPage}
            onChange={(p) =>
              onPageChange ? onPageChange(p) : table.setPageIndex(p - 1)
            }
            withEdges
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            className="w-32"
            aria-label="Số dòng mỗi trang"
            value={pageSizeValue}
            onChange={(value) => {
              if (!value) return
              const n = Number(value)
              table.setPageSize(n)
            }}
            data={pageSizeOptions.map((n) => ({
              value: String(n),
              label: String(n)
            }))}
          />
        </div>
      </div>
    </div>
  )
}
