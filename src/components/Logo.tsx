import Image from 'next/image'

export function Logo({ size = 56 }: { size?: number }) {
  return <Image src="/icon.png" width={size} height={size} alt="Euclides" />
}
