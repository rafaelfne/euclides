import Image from 'next/image'

export function Logo({ size = 56 }: { size?: number }) {
  return <Image src="/logo.png" width={size} height={size} alt="Euclides" />
}
