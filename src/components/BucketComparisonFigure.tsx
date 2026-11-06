import type { Figure } from '@/content/schema'

type BucketComparison = Extract<Figure, { kind: 'bucket-comparison' }>

export function BucketComparisonFigure({ figure }: { figure: BucketComparison }) {
  return (
    <figure className="m-0 border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">Mesmas chaves · m = {figure.m}</span>
      </div>
      <div className="grid gap-3 p-3 lg:grid-cols-2">
        {figure.cases.map((item) => {
          const bucketFor = (key: number) => item.hash === 'zero' ? 0 : key % figure.m
          const buckets = Array.from(
            { length: figure.m },
            (_, index) => item.keys.filter((key) => bucketFor(key) === index),
          )
          const targetBucket = bucketFor(item.searchFor)
          const comparisons = buckets[targetBucket]!.indexOf(item.searchFor) + 1

          return (
            <section key={item.label} className="border border-rule bg-panel-head">
              <div className="flex items-center justify-between gap-3 border-b border-rule px-3 py-2">
                <span className="text-[13px] font-semibold text-fg">{item.label} · {item.hash === 'zero' ? 'h(k) = 0' : `h(k) = k mod ${figure.m}`}</span>
                <span className="font-mono text-[12px] text-implementation">
                  {comparisons} {comparisons === 1 ? 'comparação' : 'comparações'}
                </span>
              </div>
              <div className="grid gap-1.5 p-2.5">
                {buckets.map((bucket, index) => {
                  const searched = index === targetBucket
                  return (
                    <div key={index} className="grid min-h-8 grid-cols-[5.5rem_1fr] items-center gap-2">
                      <span className="font-mono text-[12px] text-fg-4">bucket {index}</span>
                      <div className={`flex min-h-8 flex-wrap items-center gap-1 border px-1.5 py-1 ${searched ? 'border-implementation bg-implementation-bg' : 'border-rule bg-panel'}`}>
                        {bucket.length === 0
                          ? <span className="font-mono text-[12px] text-fg-5">vazio</span>
                          : bucket.map((key) => (
                            <span
                              key={key}
                              className={`border px-2 py-0.5 font-mono text-[12px] ${key === item.searchFor ? 'border-implementation text-implementation' : 'border-rule text-fg-2'}`}
                            >
                              {key}
                            </span>
                          ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-rule px-3 py-2 font-mono text-[12px] text-fg-3">
                buscar({item.searchFor}) → bucket {targetBucket} → {comparisons} {comparisons === 1 ? 'comparação' : 'comparações'}
              </div>
            </section>
          )
        })}
      </div>
      <figcaption className="border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </figcaption>
    </figure>
  )
}
