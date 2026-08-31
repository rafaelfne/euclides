'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { allUnits } from '@/content'
import { readProfile, saveProfile } from '@/lib/progress'
import type { Profile } from '@/content/schema'
import { cn } from '@/lib/utils'

const EXPERIENCE: Array<[NonNullable<Profile['experience']>, string]> = [
  ['menos-de-1-ano', 'menos de 1 ano'],
  ['1-a-3-anos', '1 a 3 anos'],
  ['mais-de-3-anos', 'mais de 3 anos'],
]

const REVIEWS: Array<[NonNullable<Profile['reviewsCode']>, string]> = [
  ['nunca', 'nunca'],
  ['as-vezes', 'às vezes'],
  ['sempre', 'sempre'],
]

export function ProfileForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [experience, setExperience] = useState<Profile['experience']>()
  const [reviewsCode, setReviewsCode] = useState<Profile['reviewsCode']>()

  const start = (withProfile: boolean) => {
    if (withProfile) {
      saveProfile({
        name: name.trim() || undefined,
        experience,
        reviewsCode,
      })
    } else if (!readProfile()) {
      saveProfile({})
    }
    router.push(`/units/${allUnits[0]!.id}`)
  }

  const Choice = <T extends string>({
    options, value, onPick,
  }: { options: Array<[T, string]>; value: T | undefined; onPick: (v: T | undefined) => void }) => (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onPick(value === id ? undefined : id)}
          className={cn(
            'm-tap cursor-pointer border px-3 py-1.5 text-[13px]',
            value === id
              ? 'border-contract-rule bg-contract-bg text-fg'
              : 'border-rule bg-panel-head text-fg-3 hover:text-fg-2',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="flex max-w-[640px] flex-col gap-5 border border-rule bg-panel p-5">
      <div className="flex flex-col gap-1.5">
        <span className="lbl">Antes de começar</span>
        <p className="m-0 text-[13.5px] leading-relaxed text-fg-3">
          Três respostas opcionais. Elas ficam só neste navegador, não vão para lugar nenhum, e
          dá para apagar tudo a qualquer momento em <span className="font-mono text-fg-2">/perfil</span>.
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="lbl">Como quer ser chamado</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="um nome ou apelido, ou nada"
          className="max-w-[300px] border border-rule bg-panel-head px-3 py-2 text-[14px] text-fg placeholder:text-fg-5 focus:ring-1 focus:ring-contract focus:outline-none"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="lbl">Há quanto tempo escreve código</span>
        <Choice options={EXPERIENCE} value={experience} onPick={setExperience} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="lbl">Você revisa código de outra pessoa ou de IA</span>
        <Choice options={REVIEWS} value={reviewsCode} onPick={setReviewsCode} />
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-rule pt-4">
        <button
          type="button"
          onClick={() => start(true)}
          className="m-tap cursor-pointer border border-contract-rule bg-contract-bg px-4 py-2 text-[14px] font-semibold text-fg hover:bg-panel-hover"
        >
          Começar pela unidade 01
        </button>
        <button
          type="button"
          onClick={() => start(false)}
          className="m-tap cursor-pointer text-[13px] text-fg-4 underline decoration-rule underline-offset-2 hover:text-fg-2"
        >
          pular e começar sem responder
        </button>
      </div>
    </div>
  )
}
