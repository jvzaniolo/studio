import { Fragment, useCallback } from "react"
import {
  flexRender,
  type Column,
  type Table as TableType,
} from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { cn } from "~/lib/utils"
import { Button } from "./ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Spinner } from "./ui/spinner"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

interface DataTableProps<TData> {
  table: TableType<TData>
  className?: string
  isLoading?: boolean
}

export function DataTable<TData>({
  table,
  className,
  isLoading,
}: DataTableProps<TData>) {
  "use no memo"

  const scrollToRow = useCallback((node: HTMLTableRowElement | null) => {
    if (node) {
      node.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [])

  return (
    <Table className={className}>
      <TableHeader sticky>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <Fragment key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </Fragment>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              onClick={() => row.toggleSelected()}
              ref={row.getIsSelected() ? scrollToRow : undefined}
              className={cn(
                row.getCanSelect() && "cursor-pointer hover:bg-muted/50"
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <Fragment key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Fragment>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={
                table.getAllColumns().filter((column) => column.getIsVisible())
                  .length
              }
              className="h-12 text-center"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Spinner className="size-6 text-primary" />
                </div>
              ) : (
                "Nenhum resultado encontrado."
              )}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  tooltip,
  align = "left",
}: DataTableColumnHeaderProps<TData, TValue> & {
  align?: "left" | "center" | "right"
  tooltip?: React.ReactNode
}) {
  "use no memo"

  if (!column.getCanSort()) {
    return (
      <TableHead align={align} className={className}>
        <span>{title}</span>
      </TableHead>
    )
  }

  return (
    <TableHead className={className}>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => column.toggleSorting()}
        className={cn(
          "group/sort w-full cursor-pointer px-0 hover:bg-transparent",
          {
            "justify-start": align === "left",
            "justify-center": align === "center",
            "justify-end": align === "right",
          }
        )}
      >
        {title}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger
              render={
                <span>
                  <Info className="size-[1em] text-blue-700" />
                </span>
              }
            ></TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        )}
        <span
          className={cn({
            "opacity-0 transition-opacity group-hover/sort:opacity-50":
              column.getIsSorted() === false,
          })}
        >
          {(column.getIsSorted() || column.getFirstSortDir()) === "desc" ? (
            <ArrowDown />
          ) : (
            <ArrowUp />
          )}
        </span>
      </Button>
    </TableHead>
  )
}

export function DataTablePagination({
  currentPage,
  totalPages,
  perPage,
  onPreviousPage,
  onNextPage,
  onPerPageChange,
}: {
  currentPage: number
  totalPages: number
  perPage: number
  onPreviousPage: () => void
  onNextPage: () => void
  onPerPageChange: (perPage: number) => void
}) {
  "use no memo"
  return (
    <div className="mt-4 flex items-center justify-between px-2">
      <div className="ml-auto flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Linhas por página</p>
          <Select
            value={`${perPage}`}
            onValueChange={(value) => {
              onPerPageChange(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue>{perPage}</SelectValue>
            </SelectTrigger>
            <SelectContent side="top">
              <SelectGroup>
                {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm font-medium">
          Página {currentPage} de {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={onPreviousPage}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Ir para a página anterior</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Ir para a próxima página</span>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
