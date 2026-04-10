import {
  ContainerScroll,
  ContainerSticky,
  GalleryCol,
  GalleryContainer
} from "@/components/ui/animated-gallery"

const IMAGES_1 = [
  "/images/image.png",
  "/images/image2.png",
  "/images/image3.png",
  "/images/image4.png",
]
const IMAGES_2 = [
  "/images/image5.png",
  "/images/image6.png",
  "/images/image7.png",
  "/images/image8.png",
]
const IMAGES_3 = [
  "/images/image9.png",
  "/images/image10.png",
  "/images/image11.png",
  "/images/image12.png",
]

export const AnimatedGallerySection = () => {
  return (
    <div className="relative -mt-10 bg-transparent">
      <ContainerScroll className="relative h-[300vh] bg-transparent">
        <ContainerSticky className="h-svh bg-transparent">
          <GalleryContainer className="bg-transparent">
            <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
              {IMAGES_1.map((imageUrl, index) => (
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow"
                  src={imageUrl}
                  alt="gallery item"
                />
              ))}
            </GalleryCol>
            <GalleryCol className="mt-[-50%]" yRange={["15%", "5%"]}>
              {IMAGES_2.map((imageUrl, index) => (
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow"
                  src={imageUrl}
                  alt="gallery item"
                />
              ))}
            </GalleryCol>
            <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
              {IMAGES_3.map((imageUrl, index) => (
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow"
                  src={imageUrl}
                  alt="gallery item"
                />
              ))}
            </GalleryCol>
          </GalleryContainer>
        </ContainerSticky>
      </ContainerScroll>
    </div>
  )
}