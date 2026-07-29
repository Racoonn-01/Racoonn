"use client"

import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-white p-3 rounded-2xl text-brand-navy font-sans select-none",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-3", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1 z-10",
          defaultClassNames.nav
        ),
        button_previous: cn(
          "h-8 w-8 rounded-full border border-gray-200 bg-white hover:bg-brand-coral hover:border-brand-coral hover:text-white text-gray-600 transition-all flex items-center justify-center p-0 shadow-xs cursor-pointer",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "h-8 w-8 rounded-full border border-gray-200 bg-white hover:bg-brand-coral hover:border-brand-coral hover:text-white text-gray-600 transition-all flex items-center justify-center p-0 shadow-xs cursor-pointer",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-9 w-full items-center justify-center font-bold text-brand-navy text-sm tracking-tight mb-1",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-9 w-full items-center justify-center gap-1.5 text-sm font-semibold",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-xl border border-gray-200 px-2 py-1 bg-white text-brand-navy",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0 cursor-pointer",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "font-bold text-base text-brand-navy select-none",
          captionLayout === "label"
            ? "text-sm font-extrabold"
            : "flex items-center gap-1 text-sm font-extrabold text-brand-navy",
          defaultClassNames.caption_label
        ),
        month_grid: "w-full border-collapse mt-2",
        weekdays: cn("flex justify-between border-b border-gray-100 pb-2 mb-1", defaultClassNames.weekdays),
        weekday: cn(
          "w-9 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-1 flex w-full justify-between gap-1", defaultClassNames.week),
        week_number_header: cn(
          "w-9 select-none text-[11px] text-gray-400",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-9 w-9 p-0 text-center select-none font-medium text-sm flex items-center justify-center",
          defaultClassNames.day
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-xl bg-brand-coral/15 text-brand-coral font-bold",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none bg-brand-coral/10 text-brand-navy", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-xl bg-brand-coral/15 text-brand-coral font-bold",
          defaultClassNames.range_end
        ),
        today: cn(
          "font-bold text-brand-coral relative",
          defaultClassNames.today
        ),
        outside: cn(
          "text-gray-300 opacity-40 font-normal",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-gray-300 opacity-30 cursor-not-allowed hover:bg-transparent pointer-events-none",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon className={cn("size-4", className)} {...props} />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-9 items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      data-today={modifiers.today}
      className={cn(
        "relative isolate z-10 flex h-9 w-9 items-center justify-center rounded-xl border-0 leading-none font-semibold transition-all text-brand-navy hover:bg-brand-coral/15 hover:text-brand-coral cursor-pointer",
        "data-[selected-single=true]:bg-brand-coral data-[selected-single=true]:text-white data-[selected-single=true]:font-bold data-[selected-single=true]:shadow-md data-[selected-single=true]:shadow-brand-coral/30 data-[selected-single=true]:hover:bg-brand-coral data-[selected-single=true]:hover:text-white",
        "data-[range-start=true]:bg-brand-coral data-[range-start=true]:text-white data-[range-start=true]:font-bold data-[range-start=true]:rounded-xl",
        "data-[range-end=true]:bg-brand-coral data-[range-end=true]:text-white data-[range-end=true]:rounded-xl",
        "data-[range-middle=true]:bg-brand-coral/10 data-[range-middle=true]:text-brand-navy data-[range-middle=true]:rounded-none",
        "data-[today=true]:ring-2 data-[today=true]:ring-brand-coral/40",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
