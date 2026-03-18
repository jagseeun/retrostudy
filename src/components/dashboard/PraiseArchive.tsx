'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PraiseArchiveProps {
  praises: string[]
}

export function PraiseArchive({ praises }: PraiseArchiveProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' })

  if (praises.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-neutral-400 dark:text-neutral-600">
        아직 칭찬이 없어요. 회고를 작성해보세요!
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-3">
          {praises.map((praise, i) => (
            <div
              key={i}
              className="shrink-0 w-64 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4"
            >
              <div className="text-2xl mb-2">✨</div>
              <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed line-clamp-4">{praise}</p>
            </div>
          ))}
        </div>
      </div>
      {praises.length > 1 && (
        <div className="flex gap-1.5 mt-3 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-neutral-500 hover:text-white"
            onClick={() => emblaApi?.scrollPrev()}
          >
            <ChevronLeft size={12} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-neutral-500 hover:text-white"
            onClick={() => emblaApi?.scrollNext()}
          >
            <ChevronRight size={12} />
          </Button>
        </div>
      )}
    </div>
  )
}
