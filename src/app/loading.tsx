export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="font-heading text-sm font-medium text-muted-foreground animate-pulse">
          Loading Homeys World...
        </p>
      </div>
    </div>
  )
}
