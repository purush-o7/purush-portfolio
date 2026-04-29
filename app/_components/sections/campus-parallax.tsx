import Image from "next/image"

export function CampusArt() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <Image
        src="/amrita-campus.png"
        alt="Amrita School of Computing, Amritapuri"
        fill
        className="object-cover object-center"
        style={{ filter: "invert(1)" }}
        priority
        sizes="60vw"
      />
    </div>
  )
}
