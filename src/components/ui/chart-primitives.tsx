"use client"

import * as React from "react"
import {
  Tooltip as TooltipPrimitive,
  type TooltipProps,
} from "recharts"

import { cn } from "@/lib/utils"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: Record<string, {
      label?: React.ReactNode
      color?: string
      icon?: React.ComponentType
    }>
  }
>(({ children, className, config, ...props }, ref) => {
  const chartConfig = React.useMemo(() => {
    return Object.entries(config).reduce((prev, [key, value]) => {
      return {
        ...prev,
        [key]: {
          ...value,
          color: value.color ?? "hsl(var(--primary))"
        }
      }
    }, {} as typeof config)
  }, [config])

  return (
    <div
      ref={ref}
      data-chart-config={JSON.stringify(chartConfig)}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-polar-grid_line]:stroke-border/50 [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-reference-line_line]:stroke-border [&_.recharts-sector_path]:stroke-border [&_.recharts-sector:focus-visible]:outline-none [&_.recharts-sector:focus-visible]:ring-2 [&_.recharts-sector:focus-visible]:ring-ring [&_.recharts-sector:focus-visible]:ring-offset-2",
        className
      )}
      style={
        Object.entries(chartConfig).reduce(
          (prev, [key, value]) => ({
            ...prev,
            [`--color-${key}`]: value.color,
          }),
          {}
        ) as React.CSSProperties
      }
      {...props}
    >
      <div className="h-full w-full">{children}</div>
    </div>
  )
})
ChartContainer.displayName = "Chart"

const ChartTooltip = TooltipPrimitive

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    React.ComponentProps<typeof TooltipPrimitive> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      formatter,
      color,
      name,
    },
    ref
  ) => {
    const tooltipConfig = React.useContext(
      (ChartContainer as any).Context
    )?.chartConfig

    if (!active || !payload || payload.length === 0) {
      return null
    }

    const item = payload[0]
    const id = item.dataKey as string
    const config = tooltipConfig?.[id]
    const finalName = item.name
    const value = item.value
    const finalColor = item.color as string

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl transition-all",
          className
        )}
      >
        {!hideLabel && (
          <div className="grid gap-1.5">
            <span className="font-semibold text-muted-foreground">
              {label ?? finalName}
            </span>
          </div>
        )}
        <div className="grid gap-1.5">
          <div className="flex items-center gap-2 font-medium leading-none">
            {!hideIndicator && (
              <span
                className={cn("h-2.5 w-2.5 shrink-0 rounded-[2px]", {
                  "rounded-full": indicator === "dot",
                  "w-0 border-[1.5px] border-dashed": indicator === "dashed",
                  "w-2.5": indicator === "line",
                })}
                style={{
                  backgroundColor: finalColor,
                }}
              />
            )}
            <div className="flex flex-1 justify-between leading-none">
              <span className="text-muted-foreground">{config?.label ?? finalName}</span>
              <span className="font-bold text-foreground">
                {formatter?.(value, finalName, item, 0, payload) ?? value}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

export { ChartContainer, ChartTooltip, ChartTooltipContent }
