import { useEffect } from 'react'
import { echo } from '@/lib/echo' // Your Echo instance

export const useRealtimeSync = (syncMap: Record<string, () => void>) => {
  useEffect(() => {
    if (!echo) return;

    const channel = echo.channel('app-sync')
      .listen('.entity.updated', (e: { type: string }) => {
        if (syncMap[e.type]) {
          console.log(`[Realtime] Syncing ${e.type}...`)
          syncMap[e.type]()
        }
      })

    return () => {
      echo?.leaveChannel('app-sync')
    }
  }, [syncMap])
}