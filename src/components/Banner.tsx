import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

type Props = {};

const Banner = (props: Props) => {
  return (
    <div className="relative">
      <div className="absolute w-full h-40 bg-gradient-to-t from-gray-100 to-transparent bottom-0 z-20" />
      <Carousel
        autoPlay
        infiniteLoop
        showStatus={false}
        showIndicators={false}
        showThumbs={false}
        interval={5000}
      >
        <div>
          <Image
            width={800}
            height={500}
            src="/carousel1.png"
            alt="carousel1"
            priority
          />
        </div>
        <div>
          <Image
            width={800}
            height={500}
            src="/carousel2.png"
            alt="carousel2"
          />
        </div>
        <div>
          <Image
            width={800}
            height={500}
            src="/carousel3.png"
            alt="carousel3"
          />
        </div>
      </Carousel>
    </div>
  );
};

export default Banner;
