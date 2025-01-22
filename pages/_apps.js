import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("../app/layout"), { ssr: false });

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
