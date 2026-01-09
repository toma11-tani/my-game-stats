import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="max-w-lg mx-auto">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 pt-8 pb-6">
        <Skeleton className="h-8 w-48 mb-2 bg-slate-700" />
        <Skeleton className="h-4 w-36 bg-slate-700" />
      </div>

      {/* Stats Card Skeleton */}
      <div className="px-4 -mt-4 mb-6">
        <Card className="bg-white shadow-md border-0">
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-4">
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-6 w-8" />
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Games Skeleton */}
      <div className="px-4 mb-6">
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white shadow-sm border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
