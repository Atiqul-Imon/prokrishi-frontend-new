import HomeClient from "./HomeClient";

// ISR: regenerate home page every 5 minutes
export const revalidate = 300;

export default function Home() {
  return <HomeClient />;
}
