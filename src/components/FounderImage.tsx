"use client";

import { useState } from "react";
import Image from "next/image";

const PHOTOS = [
  {
    src: "/images/german-rauhut-founder-neckarshore.jpg",
    alt: "German Rauhut — Gründer von neckarshore.ai, Software-Entwickler und KI-Berater aus Stuttgart",
  },
  {
    src: "/images/german-rauhut-founder-bw.png",
    alt: "German Rauhut — Gründer von neckarshore.ai (Schwarz-Weiß Portrait)",
  },
];

export default function FounderImage() {
  const [index, setIndex] = useState(0);
  const photo = PHOTOS[index];

  return (
    <button
      type="button"
      onClick={() => setIndex((i) => (i + 1) % PHOTOS.length)}
      className="group relative mx-auto cursor-pointer overflow-hidden rounded-2xl md:mx-0"
      aria-label="Foto wechseln"
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        width={288}
        height={288}
        className="rounded-2xl object-cover transition-opacity duration-300"
        loading="lazy"
      />
    </button>
  );
}
